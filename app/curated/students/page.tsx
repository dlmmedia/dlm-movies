import { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import SortableMovieGrid from '@/components/SortableMovieGrid';
import Footer from '@/components/Footer';
import { curatedMovieLists } from '@/lib/curatedLists';

export const metadata: Metadata = {
  title: 'Movies for Students',
  description: 'Coming-of-age films, college stories, and educational inspirations.',
};

export default async function StudentsMoviesPage() {
  const movies = await tmdb.getMoviesByIds(curatedMovieLists.students.movieIds);
  
  return (
    <>
      <main className="min-h-screen bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-1.5 h-12 bg-yellow-500 rounded-full"></span>
              🎓 Movies for Students
            </h1>
            <p className="text-neutral-300 text-lg">
              Coming-of-age and college films that inspire
            </p>
          </div>
          
          <SortableMovieGrid movies={movies} />
        </div>
      </main>
      <Footer />
    </>
  );
}
