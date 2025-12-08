import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateCharacterPortrait, generateMoviePoster } from '@/lib/openrouter';
import { saveAsset, saveAssetMetadata } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

// Allow up to 60 seconds for image generation
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, projectId, ...params } = body;

    if (!type || !projectId) {
      return NextResponse.json(
        { error: 'Type and projectId are required' },
        { status: 400 }
      );
    }

    let imageUrl: string;
    let prompt: string;

    if (type === 'portrait') {
      const { characterName, description, actorType } = params;
      prompt = `Portrait of ${characterName}: ${description}`;
      imageUrl = await generateCharacterPortrait(characterName, description, actorType);
    } else if (type === 'poster') {
      const { title, logline, genre, mood } = params;
      prompt = `Movie poster for "${title}": ${logline}`;
      imageUrl = await generateMoviePoster(title, logline, genre, mood);
    } else {
      return NextResponse.json(
        { error: 'Invalid image type' },
        { status: 400 }
      );
    }

    // If image URL is base64, save it to blob storage
    const assetId = uuidv4();
    let finalUrl = imageUrl;

    if (imageUrl.startsWith('data:') || !imageUrl.startsWith('http')) {
      // Convert base64 to buffer and save
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      finalUrl = await saveAsset(projectId, assetId, buffer, 'image/png');
    }

    // Save metadata
    await saveAssetMetadata({
      id: assetId,
      projectId,
      type: type === 'portrait' ? 'portrait' : 'poster',
      url: finalUrl,
      prompt,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      url: finalUrl,
      assetId,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

