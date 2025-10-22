import { tmdb } from "@/lib/tmdb";
import HeroSection from "@/components/HeroSection";
import MovieCarousel from "@/components/MovieCarousel";
import Footer from "@/components/Footer";
import { curatedMovieLists } from "@/lib/curatedLists";

export default async function Home() {
  // Fetch main movie lists
  const [trending, popular, topRated, nowPlaying, upcoming] = await Promise.all([
    tmdb.getTrending('week'),
    tmdb.getPopular(1),
    tmdb.getTopRated(1),
    tmdb.getNowPlaying(1),
    tmdb.getUpcoming(1),
  ]);

  // Fetch curated lists
  const [christmasMovies, entrepreneurMovies, studentMovies, romanceMovies, sciFiMovies, familyMovies] = await Promise.all([
    tmdb.getMoviesByIds(curatedMovieLists.christmas.movieIds),
    tmdb.getMoviesByIds(curatedMovieLists.entrepreneurs.movieIds),
    tmdb.getMoviesByIds(curatedMovieLists.students.movieIds),
    tmdb.getMoviesByIds(curatedMovieLists.romance.movieIds),
    tmdb.getMoviesByIds(curatedMovieLists.sciFi.movieIds),
    tmdb.getMoviesByIds(curatedMovieLists.familyFun.movieIds),
  ]);

  return (
    <main className="min-h-screen bg-black">
      <HeroSection movies={trending.results.slice(0, 8)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Main Categories */}
        <MovieCarousel 
          title="Most popular movies this week" 
          movies={popular.results} 
          href="/popular" 
        />
        <MovieCarousel 
          title="Top rated" 
          movies={topRated.results} 
          href="/top-rated" 
        />
        
        {/* Curated Lists Section Header */}
        <div className="pt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <span className="w-1 h-10 bg-yellow-400 rounded-full"></span>
              Curated Collections
            </h2>
            <a 
              href="/curated" 
              className="text-yellow-400 hover:text-yellow-300 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              Explore all
            </a>
          </div>
          <p className="text-neutral-400 mb-8">Hand-picked movies for every mood and occasion</p>
        </div>

        {/* Christmas Movies */}
        <MovieCarousel 
          title="🎄 Christmas Movies" 
          movies={christmasMovies} 
          href="/curated/christmas" 
        />

        {/* Entrepreneurs */}
        <MovieCarousel 
          title="💼 Movies for Entrepreneurs" 
          movies={entrepreneurMovies} 
          href="/curated/entrepreneurs" 
        />

        {/* Now Playing */}
        <MovieCarousel 
          title="Now playing in theaters" 
          movies={nowPlaying.results} 
          href="/now-playing" 
        />

        {/* Students */}
        <MovieCarousel 
          title="🎓 Movies for Students" 
          movies={studentMovies} 
          href="/curated/students" 
        />

        {/* Romantic Classics */}
        <MovieCarousel 
          title="❤️ Romantic Classics" 
          movies={romanceMovies} 
          href="/curated/romance" 
        />

        {/* Sci-Fi */}
        <MovieCarousel 
          title="🚀 Sci-Fi Masterpieces" 
          movies={sciFiMovies} 
          href="/curated/sci-fi" 
        />

        {/* Upcoming */}
        <MovieCarousel 
          title="Coming soon" 
          movies={upcoming.results} 
          href="/upcoming" 
        />

        {/* Family Fun */}
        <MovieCarousel 
          title="👨‍👩‍👧‍👦 Family Fun" 
          movies={familyMovies} 
          href="/curated/family-fun" 
        />
      </div>

      <Footer />
    </main>
  );
}
