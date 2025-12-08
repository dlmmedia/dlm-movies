import { ReferenceMovie, ScreenplayElement } from '@/types/screenplay';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const OPENAI_API_URL = 'https://api.openai.com/v1';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
    };
    finish_reason: string;
  }[];
}

interface StreamChunk {
  choices: {
    delta: {
      content?: string;
    };
  }[];
}

// ============================================
// BASE API FUNCTIONS
// ============================================

async function callOpenRouter(
  messages: ChatMessage[],
  model: string = 'anthropic/claude-3.5-sonnet',
  options: {
    stream?: boolean;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'DLM Screenwriter',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: options.stream ?? false,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  return response;
}

// OpenAI fallback for text generation
async function callOpenAI(
  messages: ChatMessage[],
  model: string = 'gpt-4o',
  options: {
    stream?: boolean;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: options.stream ?? false,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  return response;
}

// Non-streaming completion with OpenAI fallback
export async function complete(
  messages: ChatMessage[],
  model?: string
): Promise<string> {
  // Try OpenRouter first
  try {
    const response = await callOpenRouter(messages, model);
    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (openRouterError) {
    console.warn('OpenRouter failed, falling back to OpenAI:', openRouterError);
    
    // Fallback to OpenAI
    try {
      const response = await callOpenAI(messages, 'gpt-4o');
      const data: OpenRouterResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (openAIError) {
      console.error('OpenAI fallback also failed:', openAIError);
      throw new Error('Both OpenRouter and OpenAI failed. Please check your API keys and credits.');
    }
  }
}

// Streaming completion with OpenAI fallback
export async function* streamComplete(
  messages: ChatMessage[],
  model?: string
): AsyncGenerator<string> {
  let response: Response;
  let usingFallback = false;

  // Try OpenRouter first
  try {
    response = await callOpenRouter(messages, model, { stream: true });
  } catch (openRouterError) {
    console.warn('OpenRouter streaming failed, falling back to OpenAI:', openRouterError);
    usingFallback = true;
    
    try {
      response = await callOpenAI(messages, 'gpt-4o', { stream: true });
    } catch (openAIError) {
      console.error('OpenAI streaming fallback also failed:', openAIError);
      throw new Error('Both OpenRouter and OpenAI failed. Please check your API keys and credits.');
    }
  }

  if (usingFallback) {
    console.log('Using OpenAI as fallback for streaming');
  }

  const reader = response.body?.getReader();
  
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        
        try {
          const chunk: StreamChunk = JSON.parse(data);
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }
}

// ============================================
// SCREENPLAY GENERATION
// ============================================

const SCREENPLAY_SYSTEM_PROMPT = `You are an expert Hollywood screenwriter with decades of experience writing for major studios. You write in proper industry-standard screenplay format.

SCREENPLAY FORMAT RULES:
1. SCENE HEADINGS (Slug Lines): Always uppercase, start with INT. or EXT., include location and time of day
   Format: INT./EXT. LOCATION - TIME OF DAY

2. ACTION: Present tense, vivid but concise descriptions. No camera directions unless essential.

3. CHARACTER NAMES: Uppercase when speaking, centered above dialogue

4. DIALOGUE: Natural, reveals character, advances plot

5. PARENTHETICALS: Brief, only when delivery isn't obvious from context

6. TRANSITIONS: Use sparingly (CUT TO:, DISSOLVE TO:, etc.)

OUTPUT FORMAT:
Return the screenplay in JSON format with this structure:
{
  "title": "Movie Title",
  "logline": "One sentence summary",
  "synopsis": "2-3 paragraph summary",
  "characters": [
    {
      "name": "CHARACTER NAME",
      "role": "lead|supporting|minor",
      "description": "Physical and personality description",
      "arc": "Character's journey in the story"
    }
  ],
  "elements": [
    {"type": "scene_heading", "content": "INT. LOCATION - DAY", "sceneNumber": 1},
    {"type": "action", "content": "Action description"},
    {"type": "character", "content": "CHARACTER NAME"},
    {"type": "dialogue", "content": "What they say"},
    {"type": "parenthetical", "content": "(how they say it)"},
    {"type": "transition", "content": "CUT TO:"}
  ]
}`;

export interface GeneratedScreenplay {
  title: string;
  logline: string;
  synopsis: string;
  characters: {
    name: string;
    role: 'lead' | 'supporting' | 'minor';
    description: string;
    arc: string;
  }[];
  elements: ScreenplayElement[];
}

export async function generateScreenplay(
  referenceMovies: ReferenceMovie[],
  customPrompt?: string,
  tone?: string,
  length: 'short' | 'feature' | 'pilot' = 'short'
): Promise<GeneratedScreenplay> {
  const lengthGuide = {
    short: '15-20 pages (approximately 15-20 minutes)',
    feature: '90-120 pages (approximately 90-120 minutes)',
    pilot: '45-60 pages (approximately 45-60 minutes)',
  };

  const movieDescriptions = referenceMovies.map(m => 
    `"${m.title}" (${m.releaseYear}) - ${m.genres.join(', ')}
    Overview: ${m.overview}
    ${m.tagline ? `Tagline: ${m.tagline}` : ''}
    ${m.director ? `Director: ${m.director}` : ''}
    ${m.cast?.length ? `Cast: ${m.cast.slice(0, 5).join(', ')}` : ''}`
  ).join('\n\n');

  const userPrompt = `Create an ORIGINAL screenplay inspired by these reference films:

${movieDescriptions}

REQUIREMENTS:
- Length: ${lengthGuide[length]}
- Tone: ${tone || 'Match the tone of the reference films'}
- Create an ORIGINAL story - do not copy plots from the references
- Draw inspiration from themes, visual styles, and storytelling techniques
${customPrompt ? `\nAdditional direction: ${customPrompt}` : ''}

Generate a complete screenplay with all scenes, dialogue, and action. Return as JSON.`;

  const content = await complete([
    { role: 'system', content: SCREENPLAY_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ], 'anthropic/claude-3.5-sonnet');

  // Parse the JSON response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse screenplay response');
  }

  return JSON.parse(jsonMatch[0]);
}

// Streaming version for real-time preview
export async function* streamGenerateScreenplay(
  referenceMovies: ReferenceMovie[],
  customPrompt?: string,
  tone?: string,
  length: 'short' | 'feature' | 'pilot' = 'short'
): AsyncGenerator<string> {
  const lengthGuide = {
    short: '15-20 pages (approximately 15-20 minutes)',
    feature: '90-120 pages (approximately 90-120 minutes)',
    pilot: '45-60 pages (approximately 45-60 minutes)',
  };

  const movieDescriptions = referenceMovies.map(m => 
    `"${m.title}" (${m.releaseYear}) - ${m.genres.join(', ')}
    Overview: ${m.overview}
    ${m.tagline ? `Tagline: ${m.tagline}` : ''}
    ${m.director ? `Director: ${m.director}` : ''}
    ${m.cast?.length ? `Cast: ${m.cast.slice(0, 5).join(', ')}` : ''}`
  ).join('\n\n');

  const userPrompt = `Create an ORIGINAL screenplay inspired by these reference films:

${movieDescriptions}

REQUIREMENTS:
- Length: ${lengthGuide[length]}
- Tone: ${tone || 'Match the tone of the reference films'}
- Create an ORIGINAL story - do not copy plots from the references
- Draw inspiration from themes, visual styles, and storytelling techniques
${customPrompt ? `\nAdditional direction: ${customPrompt}` : ''}

Generate a complete screenplay with all scenes, dialogue, and action. Return as JSON.`;

  yield* streamComplete([
    { role: 'system', content: SCREENPLAY_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ], 'anthropic/claude-3.5-sonnet');
}

// ============================================
// IMAGE GENERATION (Using OpenAI DALL-E 3)
// ============================================

export async function generateImage(
  prompt: string,
  style: 'portrait' | 'poster' | 'scene' = 'portrait'
): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  
  const stylePrompts = {
    portrait: 'Professional headshot photograph, studio lighting, high quality, 8k, detailed face, photorealistic, neutral background',
    poster: 'Movie poster design, cinematic, dramatic lighting, professional graphic design, typography space at top',
    scene: 'Cinematic still, movie scene, professional cinematography, dramatic lighting',
  };

  const enhancedPrompt = `${prompt}. ${stylePrompts[style]}`;

  // Use OpenAI DALL-E 3 for image generation
  if (openaiKey) {
    try {
      const imageUrl = await tryOpenAIDallE(openaiKey, enhancedPrompt, style);
      if (imageUrl) {
        console.log('Image generated successfully with OpenAI DALL-E 3');
        return imageUrl;
      }
    } catch (error) {
      console.error('OpenAI DALL-E image generation failed:', error);
    }
  } else {
    console.warn('OPENAI_API_KEY not configured for image generation');
  }

  // Fallback to placeholder if OpenAI fails or not configured
  console.warn('Image generation failed, using placeholder. Ensure OPENAI_API_KEY is set.');
  return generatePlaceholder(prompt, style);
}

async function tryOpenAIDallE(
  apiKey: string,
  prompt: string,
  style: 'portrait' | 'poster' | 'scene'
): Promise<string | null> {
  const size = style === 'poster' 
    ? '1024x1792' as const
    : style === 'portrait'
    ? '1024x1024' as const
    : '1792x1024' as const;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality: 'standard',
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI DALL-E error:', errorText);
    throw new Error(`OpenAI DALL-E image generation failed: ${errorText}`);
  }

  const data = await response.json();
  
  if (data.data?.[0]?.b64_json) {
    return `data:image/png;base64,${data.data[0].b64_json}`;
  }
  
  if (data.data?.[0]?.url) {
    return data.data[0].url;
  }

  return null;
}

function generatePlaceholder(prompt: string, style: 'portrait' | 'poster' | 'scene'): string {
  // Create a simple alphanumeric seed from the prompt
  const seed = prompt
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 20)
    .toLowerCase() || 'default';
  
  const colors = ['e11d48', 'f59e0b', '10b981', '3b82f6', '8b5cf6', 'ec4899'];
  const colorIndex = Math.abs(prompt.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length;
  const color = colors[colorIndex];
  
  if (style === 'portrait') {
    // Use UI Avatars for placeholder portraits (returns PNG, works with Next.js Image)
    const initials = seed.slice(0, 2).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&size=256&bold=true&format=png`;
  }
  
  // For posters/scenes, use a simple placeholder
  return `https://placehold.co/768x1024/${color}/ffffff.png?text=Generating`;
}

// ============================================
// CHARACTER PORTRAIT GENERATION
// ============================================

export async function generateCharacterPortrait(
  characterName: string,
  description: string,
  actorType?: string
): Promise<string> {
  const prompt = `Portrait of ${characterName}: ${description}${actorType ? `. Similar look to ${actorType} type actors` : ''}. Professional headshot, neutral background.`;
  
  return generateImage(prompt, 'portrait');
}

// ============================================
// POSTER GENERATION
// ============================================

export async function generateMoviePoster(
  title: string,
  logline: string,
  genre: string[],
  mood: string
): Promise<string> {
  const genreStyle = genre.join(' and ');
  const prompt = `Movie poster for "${title}": ${logline}. ${genreStyle} genre, ${mood} mood. Professional movie poster with dramatic composition. Leave space for title text at top.`;
  
  return generateImage(prompt, 'poster');
}

// ============================================
// CAST SUGGESTION
// ============================================

export async function suggestCasting(
  characters: { name: string; description: string; arc: string }[]
): Promise<{ name: string; actorType: string; suggestions: string[] }[]> {
  const prompt = `For each of these film characters, suggest the type of actor that would fit the role and 3 specific actors who could play them:

${characters.map(c => `${c.name}: ${c.description}. Arc: ${c.arc}`).join('\n\n')}

Return as JSON array:
[{"name": "CHARACTER", "actorType": "description of actor type", "suggestions": ["Actor 1", "Actor 2", "Actor 3"]}]`;

  const content = await complete([
    { role: 'system', content: 'You are a casting director with extensive knowledge of actors and their ranges.' },
    { role: 'user', content: prompt },
  ]);

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return characters.map(c => ({
      name: c.name,
      actorType: 'Versatile actor',
      suggestions: [],
    }));
  }

  return JSON.parse(jsonMatch[0]);
}

