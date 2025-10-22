import { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Now Playing',
  description: 'Discover movies currently showing in theaters near you.',
};

export default async function NowPlayingPage() {
  const { results: movies } = await tmdb.getNowPlaying(1);

  return (
    <>
      <main className="min-h-screen bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-1.5 h-12 bg-yellow-400 rounded-full"></span>
            Now Playing in Theaters
          </h1>
          
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
