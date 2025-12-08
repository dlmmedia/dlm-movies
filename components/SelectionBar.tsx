'use client';

import { useSelection } from './SelectionContext';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { X, Sparkles, Film, ChevronRight } from 'lucide-react';
import { tmdb } from '@/lib/tmdb';

export default function SelectionBar() {
  const { selectedMovies, removeFromSelection, clearSelection, selectionMode } = useSelection();
  const pathname = usePathname();

  // Hide on screenwriter/new page to avoid covering the Generate button
  if (pathname === '/screenwriter/new') return null;
  
  if (!selectionMode || selectedMovies.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-700 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Selected movies */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-2 text-neutral-400 shrink-0">
                <Film className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {selectedMovies.length}/5 selected
                </span>
              </div>
              
              {/* Movie thumbnails */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {selectedMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="relative group shrink-0"
                  >
                    <div className="relative w-12 h-18 rounded-lg overflow-hidden border-2 border-yellow-400/50 transition-all hover:border-yellow-400">
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
                    
                    {/* Remove button */}
                    <button
                      onClick={() => removeFromSelection(movie.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      aria-label={`Remove ${movie.title}`}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {movie.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={clearSelection}
                className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
              >
                Clear all
              </button>
              
              <Link
                href="/screenwriter/new"
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-yellow-400/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Script</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

