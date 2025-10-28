'use client';

import { useState, useMemo } from 'react';
import MovieCard from './MovieCard';
import { MovieDetails } from '@/types/movie';
import { ArrowUpDown, Calendar, Globe, TrendingUp, Star } from 'lucide-react';

interface SortableMovieGridProps {
  movies: MovieDetails[];
}

type SortOption = 'default' | 'year-desc' | 'year-asc' | 'title' | 'popularity' | 'rating';

export default function SortableMovieGrid({ movies }: SortableMovieGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  // Get unique languages from movies
  const languages = useMemo(() => {
    const langs = new Set(movies.map(m => m.original_language));
    return Array.from(langs).sort();
  }, [movies]);

  // Filter and sort movies
  const filteredAndSortedMovies = useMemo(() => {
    let filtered = [...movies];

    // Filter by language
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(m => m.original_language === selectedLanguage);
    }

    // Sort
    switch (sortBy) {
      case 'year-desc':
        filtered.sort((a, b) => {
          const yearA = a.release_date ? new Date(a.release_date).getFullYear() : 0;
          const yearB = b.release_date ? new Date(b.release_date).getFullYear() : 0;
          return yearB - yearA;
        });
        break;
      case 'year-asc':
        filtered.sort((a, b) => {
          const yearA = a.release_date ? new Date(a.release_date).getFullYear() : 0;
          const yearB = b.release_date ? new Date(b.release_date).getFullYear() : 0;
          return yearA - yearB;
        });
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [movies, sortBy, selectedLanguage]);

  const sortOptions = [
    { value: 'default', label: 'Default Order', icon: ArrowUpDown },
    { value: 'year-desc', label: 'Newest First', icon: Calendar },
    { value: 'year-asc', label: 'Oldest First', icon: Calendar },
    { value: 'title', label: 'Title (A-Z)', icon: ArrowUpDown },
    { value: 'popularity', label: 'Most Popular', icon: TrendingUp },
    { value: 'rating', label: 'Highest Rated', icon: Star },
  ];

  const getLanguageName = (code: string) => {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'hi': 'Hindi',
      'ru': 'Russian',
      'pt': 'Portuguese',
      'ar': 'Arabic',
    };
    return languageNames[code] || code.toUpperCase();
  };

  return (
    <div>
      {/* Filters & Sort Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-neutral-400">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-neutral-900 text-white px-4 py-2 rounded-lg border border-neutral-800 focus:border-blue-500 focus:outline-none transition-colors"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          {languages.length > 1 && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-neutral-400" />
              <label htmlFor="language" className="text-sm text-neutral-400">
                Language:
              </label>
              <select
                id="language"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-neutral-900 text-white px-4 py-2 rounded-lg border border-neutral-800 focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="all">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {getLanguageName(lang)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="text-sm text-neutral-400">
          Showing {filteredAndSortedMovies.length} of {movies.length} movies
        </div>
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredAndSortedMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {/* No results message */}
      {filteredAndSortedMovies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-400 text-lg">No movies found with the selected filters.</p>
        </div>
      )}
    </div>
  );
}
