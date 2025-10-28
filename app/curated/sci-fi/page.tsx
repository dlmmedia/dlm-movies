import { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import SortableMovieGrid from '@/components/SortableMovieGrid';
import Footer from '@/components/Footer';
import { curatedMovieLists } from '@/lib/curatedLists';

export const metadata: Metadata = {
  title: 'Sci-Fi Masterpieces',
  description: 'Mind-bending futuristic tales and space adventures.',
};

export default async function SciFiMoviesPage() {
  const movies = await tmdb.getMoviesByIds(curatedMovieLists.sciFi.movieIds);
  
  return (
    <>
      <main className="min-h-screen bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-1.5 h-12 bg-cyan-600 rounded-full"></span>
              🚀 Sci-Fi Masterpieces
            </h1>
            <p className="text-neutral-300 text-lg">
              Mind-bending futuristic tales and space adventures
            </p>
          </div>
          
          <SortableMovieGrid movies={movies} />
        </div>
      </main>
      <Footer />
    </>
  );
}
