'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import { tmdb } from '@/lib/tmdb';
import { Star, Plus, Check, Sparkles } from 'lucide-react';
import { useSelection } from './SelectionContext';

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
  enableSelection?: boolean;
}

export default function MovieCard({ movie, priority = false, enableSelection = true }: MovieCardProps) {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  
  const { isSelected, toggleSelection, selectionMode, selectedMovies } = useSelection();
  const selected = isSelected(movie.id);
  const canSelect = selectedMovies.length < 5 || selected;

  const handleSelectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canSelect) {
      toggleSelection(movie);
    }
  };

  return (
    <div className={`group relative flex-shrink-0 w-[180px] sm:w-[200px] transition-all duration-300 hover:scale-105 ${
      selected ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black rounded-lg' : ''
    }`}>
      <Link href={`/movie/${movie.id}`} className="block">
        {/* Poster Image */}
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800 mb-2">
          {movie.poster_path ? (
            <Image
              src={tmdb.getImageUrl(movie.poster_path, 'w500')}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 180px, 200px"
              className={`object-cover transition-all ${
                selected ? 'opacity-80' : 'group-hover:opacity-75'
              }`}
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-500">
              No Image
            </div>
          )}
          
          {/* Selection overlay when selected */}
          {selected && (
            <div className="absolute inset-0 bg-yellow-400/20 pointer-events-none" />
          )}
          
          {/* Selection button - always visible in selection mode, hover otherwise */}
          {enableSelection && (
            <button 
              className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                selected 
                  ? 'bg-yellow-400 opacity-100' 
                  : selectionMode 
                    ? 'bg-black/70 opacity-100 hover:bg-black/90'
                    : 'bg-black/70 opacity-0 group-hover:opacity-100 hover:bg-black/90'
              } ${!canSelect && !selected ? 'cursor-not-allowed opacity-50' : ''}`}
              onClick={handleSelectClick}
              aria-label={selected ? 'Remove from selection' : 'Add to selection'}
              title={!canSelect && !selected ? 'Maximum 5 movies' : undefined}
            >
              {selected ? (
                <Check className="w-5 h-5 text-black" />
              ) : (
                <Plus className="w-5 h-5 text-white" />
              )}
            </button>
          )}

          {/* "Use as reference" tooltip on selection mode */}
          {enableSelection && selectionMode && !selected && canSelect && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-400 rounded text-xs text-black font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Reference
            </div>
          )}

          {/* Rating badge */}
          {movie.vote_average > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/80 px-2 py-1 rounded">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-white text-sm font-semibold">{rating}</span>
            </div>
          )}
          
          {/* Selected badge */}
          {selected && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-yellow-400 rounded text-xs text-black font-bold">
              Selected
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="space-y-1">
          <h3 className={`font-medium text-sm line-clamp-2 leading-tight transition-colors ${
            selected ? 'text-yellow-400' : 'text-white group-hover:text-yellow-400'
          }`}>
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>{year}</span>
            {movie.vote_count > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span>{rating}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
