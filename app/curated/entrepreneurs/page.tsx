import { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import Footer from '@/components/Footer';
import { curatedMovieLists } from '@/lib/curatedLists';

export const metadata: Metadata = {
  title: 'Movies for Entrepreneurs',
  description: 'Inspiring business stories, startup journeys, and entrepreneurial success tales.',
};

export default async function EntrepreneursMoviesPage() {
  const movies = await tmdb.getMoviesByIds(curatedMovieLists.entrepreneurs.movieIds);
  
  return (
    <>
      <main className="min-h-screen bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-1.5 h-12 bg-blue-600 rounded-full"></span>
              💼 Movies for Entrepreneurs
            </h1>
            <p className="text-neutral-300 text-lg">
              Inspiring business stories and entrepreneurial journeys
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
