import { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import SortableMovieGrid from '@/components/SortableMovieGrid';
import Footer from '@/components/Footer';
import { curatedMovieLists } from '@/lib/curatedLists';

export const metadata: Metadata = {
  title: 'Horror Must-Watch',
  description: 'Spine-chilling thrillers and terrifying horror classics.',
};

export default async function HorrorMoviesPage() {
  const movies = await tmdb.getMoviesByIds(curatedMovieLists.horror.movieIds);
  
  return (
    <>
      <main className="min-h-screen bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-1.5 h-12 bg-gray-700 rounded-full"></span>
              👻 Horror Must-Watch
            </h1>
            <p className="text-neutral-300 text-lg">
              Spine-chilling thrillers and terrifying horror classics
            </p>
          </div>
          
          <SortableMovieGrid movies={movies} />
        </div>
      </main>
      <Footer />
    </>
  );
}
