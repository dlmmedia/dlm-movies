'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CastMember } from '@/types/screenplay';
import { User, Sparkles, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

interface CastGridProps {
  cast: CastMember[];
  projectId: string;
  onUpdate: (cast: CastMember[]) => void;
}

export default function CastGrid({ cast, projectId, onUpdate }: CastGridProps) {
  const [generatingPortrait, setGeneratingPortrait] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePortrait = async (member: CastMember) => {
    setGeneratingPortrait(member.id);
    setError(null);
    
    try {
      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'portrait',
          projectId,
          characterName: member.characterName,
          description: member.description,
          actorType: member.actorType,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate portrait');
      }

      const { url } = data;
      
      // Update cast member with portrait URL
      const updatedCast = cast.map(c => 
        c.id === member.id 
          ? { ...c, portraitUrl: url, generatedAt: new Date().toISOString() }
          : c
      );
      onUpdate(updatedCast);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate portrait';
      setError(message);
      console.error('Portrait generation error:', err);
    } finally {
      setGeneratingPortrait(null);
    }
  };

  const generateAllPortraits = async () => {
    for (const member of cast) {
      if (!member.portraitUrl) {
        await generatePortrait(member);
      }
    }
  };

  if (cast.length === 0) {
    return (
      <div className="text-center py-16 bg-neutral-900 rounded-xl border border-neutral-800">
        <User className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
        <h3 className="text-white text-lg font-medium mb-2">No cast members yet</h3>
        <p className="text-neutral-400">Cast will be generated with your screenplay</p>
      </div>
    );
  }

  return (
    <div>
      {/* Error message */}
      {error && (
        <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Generate all button */}
      {cast.some(c => !c.portraitUrl) && (
        <div className="mb-6">
          <button
            onClick={generateAllPortraits}
            disabled={generatingPortrait !== null}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate All Portraits
          </button>
        </div>
      )}

      {/* Cast grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {cast.map((member) => (
          <div
            key={member.id}
            className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-colors"
          >
            {/* Portrait */}
            <div className="relative aspect-[3/4] bg-neutral-800">
              {member.portraitUrl ? (
                <>
                  <Image
                    src={member.portraitUrl}
                    alt={member.characterName}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover"
                  />
                  {/* Regenerate button */}
                  <button
                    onClick={() => generatePortrait(member)}
                    disabled={generatingPortrait === member.id}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90"
                    title="Regenerate portrait"
                  >
                    {generatingPortrait === member.id ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-white" />
                    )}
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {generatingPortrait === member.id ? (
                    <>
                      <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mb-2" />
                      <span className="text-xs text-neutral-400">Generating...</span>
                    </>
                  ) : (
                    <>
                      <User className="w-12 h-12 text-neutral-600 mb-2" />
                      <button
                        onClick={() => generatePortrait(member)}
                        className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Generate
                      </button>
                    </>
                  )}
                </div>
              )}
              
              {/* Role badge */}
              <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium ${
                member.role === 'lead' 
                  ? 'bg-yellow-400 text-black' 
                  : member.role === 'supporting'
                    ? 'bg-neutral-700 text-white'
                    : 'bg-neutral-800 text-neutral-400'
              }`}>
                {member.role}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="text-white font-semibold mb-1">{member.characterName}</h3>
              <p className="text-neutral-400 text-sm line-clamp-2 mb-2">{member.description}</p>
              {member.actorType && (
                <p className="text-xs text-neutral-500">
                  Type: {member.actorType}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

