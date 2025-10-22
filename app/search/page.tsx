'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { tmdb } from '@/lib/tmdb';
import { Movie } from '@/types/movie';
import MovieCard from '@/components/MovieCard';
import Footer from '@/components/Footer';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      handleSearch(searchQuery);
    }
  }, [searchParams]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setMovies([]);
      return;
    }

    setLoading(true);
    try {
      const response = await tmdb.searchMovies(searchQuery);
      setMovies(response.results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <main className="min-h-screen bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[60vh]">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <span className="w-1.5 h-12 bg-yellow-400 rounded-full"></span>
          Search Movies
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies..."
              className="w-full pl-12 pr-4 py-4 bg-neutral-900 text-white rounded-lg border border-neutral-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-colors"
              autoFocus
            />
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : movies.length > 0 ? (
          <>
            <p className="text-neutral-400 mb-6">
              Found {movies.length} result{movies.length !== 1 ? 's' : ''} for "{searchParams.get('q')}"
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        ) : searchParams.get('q') ? (
          <div className="text-center py-12">
            <p className="text-neutral-400 text-lg">No movies found for "{searchParams.get('q')}"</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-400 text-lg">Start typing to search for movies</p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
