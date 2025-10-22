'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '@/types/movie';
import MovieCard from './MovieCard';

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  href?: string;
}

export default function MovieCarousel({ title, movies, href }: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!movies.length) return null;

  return (
    <section className="relative mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-8 bg-yellow-400 rounded-full"></span>
          {title}
        </h2>
        {href && (
          <a 
            href={href} 
            className="text-yellow-400 hover:text-yellow-300 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            See all
            <ChevronRight className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-full bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-2"
          aria-label="Scroll left"
        >
          <div className="w-10 h-10 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/90 transition-colors">
            <ChevronLeft className="w-6 h-6 text-white" />
          </div>
        </button>

        {/* Scrollable Movies */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} priority={index < 6} />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-full bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-2"
          aria-label="Scroll right"
        >
          <div className="w-10 h-10 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/90 transition-colors">
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        </button>
      </div>
    </section>
  );
}
