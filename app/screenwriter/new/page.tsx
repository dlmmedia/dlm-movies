'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSelection } from '@/components/SelectionContext';
import { tmdb } from '@/lib/tmdb';
import { 
  Sparkles, 
  X, 
  Film, 
  Clock, 
  Palette, 
  Loader2,
  ArrowLeft,
  Clapperboard,
  AlertCircle
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const TONE_OPTIONS = [
  { value: 'dramatic', label: 'Dramatic', emoji: '🎭' },
  { value: 'comedic', label: 'Comedic', emoji: '😄' },
  { value: 'dark', label: 'Dark & Gritty', emoji: '🌑' },
  { value: 'lighthearted', label: 'Lighthearted', emoji: '☀️' },
  { value: 'suspenseful', label: 'Suspenseful', emoji: '😰' },
  { value: 'romantic', label: 'Romantic', emoji: '💕' },
  { value: 'action', label: 'Action-Packed', emoji: '💥' },
  { value: 'surreal', label: 'Surreal', emoji: '🌀' },
];

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short Film', description: '15-20 pages (~15-20 min)', emoji: '📽️' },
  { value: 'pilot', label: 'TV Pilot', description: '45-60 pages (~45-60 min)', emoji: '📺' },
  { value: 'feature', label: 'Feature Film', description: '90-120 pages (~2 hours)', emoji: '🎬' },
];

export default function NewScreenwriterPage() {
  const router = useRouter();
  const { selectedMovies, removeFromSelection, clearSelection } = useSelection();
  
  const [title, setTitle] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [tone, setTone] = useState('dramatic');
  const [length, setLength] = useState<'short' | 'pilot' | 'feature'>('short');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generationProgress, setGenerationProgress] = useState('');

  // Redirect if no movies selected
  useEffect(() => {
    if (selectedMovies.length === 0) {
      router.push('/');
    }
  }, [selectedMovies, router]);

  const handleGenerate = async () => {
    if (selectedMovies.length === 0) {
      setError('Please select at least one reference movie');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGenerationProgress('Preparing reference data...');

    try {
      // Prepare reference movies data
      const referenceMovies = selectedMovies.map(movie => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        genres: movie.genres?.map(g => g.name) || [],
        releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
        tagline: '',
      }));

      setGenerationProgress('Generating screenplay with AI...');

      const response = await fetch('/api/generate/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceMovies,
          customPrompt: customPrompt || undefined,
          tone,
          length,
        }),
      });

      if (!response.ok) {
        // Try to parse error response
        const text = await response.text();
        let errorMessage = 'Failed to generate script';
        try {
          const data = JSON.parse(text);
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let streamError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                streamError = parsed.error;
              } else if (parsed.content) {
                accumulatedContent += parsed.content;
                // Update progress with character count
                const charCount = accumulatedContent.length;
                if (charCount > 1000) {
                  setGenerationProgress(`Writing screenplay... (${Math.round(charCount / 1000)}k characters)`);
                }
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      if (streamError) {
        throw new Error(streamError);
      }

      if (!accumulatedContent) {
        throw new Error('No content generated');
      }

      // Parse the accumulated JSON content
      setGenerationProgress('Processing screenplay...');
      const jsonMatch = accumulatedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse screenplay response');
      }
      
      const screenplay = JSON.parse(jsonMatch[0]);

      setGenerationProgress('Saving project...');

      // Create project
      const projectId = uuidv4();
      const project = {
        id: projectId,
        title: title || screenplay.title,
        logline: screenplay.logline,
        synopsis: screenplay.synopsis,
        genre: selectedMovies.flatMap(m => m.genres?.map(g => g.name) || []).filter((v, i, a) => a.indexOf(v) === i),
        tone,
        referenceMovieIds: selectedMovies.map(m => m.id),
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to storage via API
      const saveResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, screenplay, characters: screenplay.characters }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save project');
      }

      // Clear selection and redirect to project
      clearSelection();
      router.push(`/project/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsGenerating(false);
    }
  };

  if (selectedMovies.length === 0) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-black/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clapperboard className="w-5 h-5 text-yellow-400" />
                  Create New Screenplay
                </h1>
                <p className="text-sm text-neutral-400">
                  {selectedMovies.length} reference {selectedMovies.length === 1 ? 'movie' : 'movies'} selected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Reference Movies */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Film className="w-5 h-5 text-yellow-400" />
            Reference Movies
          </h2>
          <div className="flex flex-wrap gap-4">
            {selectedMovies.map((movie) => (
              <div
                key={movie.id}
                className="relative group bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800"
              >
                <div className="flex items-center gap-3 p-3">
                  <div className="relative w-12 h-18 rounded overflow-hidden shrink-0">
                    {movie.poster_path ? (
                      <Image
                        src={tmdb.getImageUrl(movie.poster_path, 'w200')}
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                        <Film className="w-4 h-4 text-neutral-600" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate max-w-[150px]">
                      {movie.title}
                    </p>
                    <p className="text-neutral-400 text-xs">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromSelection(movie.id)}
                    className="ml-2 p-1 text-neutral-500 hover:text-red-400 transition-colors"
                    aria-label={`Remove ${movie.title}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-neutral-700 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
            >
              <span className="text-2xl">+</span>
              <span className="text-sm">Add more</span>
            </Link>
          </div>
        </section>

        {/* Configuration */}
        <div className="space-y-8">
          {/* Title */}
          <section>
            <label htmlFor="title" className="block text-lg font-semibold text-white mb-3">
              Title (Optional)
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Leave blank to auto-generate"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
            />
          </section>

          {/* Length */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Script Length
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {LENGTH_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLength(option.value as typeof length)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    length === option.value
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{option.emoji}</span>
                  <p className={`font-semibold ${length === option.value ? 'text-yellow-400' : 'text-white'}`}>
                    {option.label}
                  </p>
                  <p className="text-sm text-neutral-400">{option.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Tone */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-yellow-400" />
              Tone
            </h2>
            <div className="flex flex-wrap gap-3">
              {TONE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTone(option.value)}
                  className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2 ${
                    tone === option.value
                      ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                      : 'border-neutral-700 text-neutral-300 hover:border-neutral-600'
                  }`}
                >
                  <span>{option.emoji}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Custom Prompt */}
          <section>
            <label htmlFor="prompt" className="block text-lg font-semibold text-white mb-3">
              Additional Direction (Optional)
            </label>
            <textarea
              id="prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add any specific requirements, themes, or ideas you want the AI to incorporate..."
              rows={4}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors resize-none"
            />
          </section>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || selectedMovies.length === 0}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>{generationProgress}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>Generate Screenplay</span>
              </>
            )}
          </button>
          
          <p className="text-center text-neutral-500 text-sm">
            Generation typically takes 30-60 seconds depending on script length
          </p>
        </div>
      </div>
    </main>
  );
}

