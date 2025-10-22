'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/types/movie';
import { tmdb } from '@/lib/tmdb';
import { Play, ChevronLeft, ChevronRight, Star, Info } from 'lucide-react';

interface HeroSectionProps {
  movies: Movie[];
}

export default function HeroSection({ movies }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const currentMovie = movies[currentIndex];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, movies.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
    setIsAutoPlaying(false);
  };

  if (!currentMovie) return null;

  return (
    <section className="relative h-[60vh] sm:h-[70vh] lg:h-[85vh] w-full overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {movie.backdrop_path && (
              <Image
                src={tmdb.getBackdropUrl(movie.backdrop_path)}
                alt={movie.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority={index === 0}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl space-y-4 sm:space-y-6">
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            {currentMovie.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm sm:text-base">
            {currentMovie.vote_average > 0 && (
              <div className="flex items-center gap-1.5 bg-yellow-400 text-black px-3 py-1 rounded font-semibold">
                <Star className="w-4 h-4 fill-current" />
                <span>{currentMovie.vote_average.toFixed(1)}</span>
              </div>
            )}
            {currentMovie.release_date && (
              <span className="text-white font-medium">
                {new Date(currentMovie.release_date).getFullYear()}
              </span>
            )}
            {currentMovie.vote_count > 0 && (
              <span className="text-neutral-300">
                {currentMovie.vote_count.toLocaleString()} votes
              </span>
            )}
          </div>

          {/* Overview */}
          <p className="text-white/90 text-sm sm:text-base lg:text-lg line-clamp-3 max-w-xl">
            {currentMovie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 sm:gap-4">
            <Link
              href={`/movie/${currentMovie.id}`}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Play className="w-5 h-5 fill-current" />
              Watch Trailer
            </Link>
            <Link
              href={`/movie/${currentMovie.id}`}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold backdrop-blur-sm transition-colors"
            >
              <Info className="w-5 h-5" />
              More Info
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentIndex
                ? 'w-8 bg-yellow-400'
                : 'w-2 bg-white/50 hover:bg-white/70'
            } h-2 rounded-full`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
