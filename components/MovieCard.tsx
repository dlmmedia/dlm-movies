'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import { tmdb } from '@/lib/tmdb';
import { Star, Plus, Info } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
}

export default function MovieCard({ movie, priority = false }: MovieCardProps) {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  return (
    <div className="group relative flex-shrink-0 w-[180px] sm:w-[200px] transition-transform duration-300 hover:scale-105">
      <Link href={`/movie/${movie.id}`} className="block">
        {/* Poster Image */}
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800 mb-2">
          {movie.poster_path ? (
            <Image
              src={tmdb.getImageUrl(movie.poster_path, 'w500')}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 180px, 200px"
              className="object-cover transition-opacity group-hover:opacity-75"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-500">
              No Image
            </div>
          )}
          
          {/* Watchlist button overlay */}
          <button 
            className="absolute top-2 left-2 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Implement watchlist functionality
            }}
            aria-label="Add to watchlist"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>

          {/* Rating badge */}
          {movie.vote_average > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/80 px-2 py-1 rounded">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-white text-sm font-semibold">{rating}</span>
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="space-y-1">
          <h3 className="text-white font-medium text-sm line-clamp-2 leading-tight group-hover:text-yellow-400 transition-colors">
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
