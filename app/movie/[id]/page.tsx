import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { tmdb } from '@/lib/tmdb';
import { Star, Clock, Calendar, Play } from 'lucide-react';
import MovieCarousel from '@/components/MovieCarousel';
import Footer from '@/components/Footer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const movie = await tmdb.getMovieDetails(Number(id));
    
    return {
      title: movie.title,
      description: movie.overview || `Watch ${movie.title} and explore similar titles.`,
      openGraph: {
        title: movie.title,
        description: movie.overview,
        images: movie.poster_path ? [tmdb.getImageUrl(movie.poster_path, 'w780')] : [],
        type: 'video.movie',
      },
      twitter: {
        card: 'summary_large_image',
        title: movie.title,
        description: movie.overview,
        images: movie.poster_path ? [tmdb.getImageUrl(movie.poster_path, 'w780')] : [],
      },
    };
  } catch {
    return {
      title: 'Movie Not Found',
      description: 'This movie could not be found.',
    };
  }
}

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params;
  
  let movie, credits, videos, similar;
  
  try {
    [movie, credits, videos, similar] = await Promise.all([
      tmdb.getMovieDetails(Number(id)),
      tmdb.getMovieCredits(Number(id)),
      tmdb.getMovieVideos(Number(id)),
      tmdb.getSimilarMovies(Number(id)),
    ]);
  } catch {
    notFound();
  }

  const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos.results[0];
  const cast = credits.cast.slice(0, 10);
  const director = credits.crew.find(c => c.job === 'Director');
  
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.overview,
    image: movie.poster_path ? tmdb.getImageUrl(movie.poster_path, 'original') : '',
    datePublished: movie.release_date,
    director: director ? { '@type': 'Person', name: director.name } : undefined,
    aggregateRating: movie.vote_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: movie.vote_average,
      ratingCount: movie.vote_count,
    } : undefined,
    genre: movie.genres.map(g => g.name),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main className="min-h-screen bg-black">
        {/* Hero Section */}
        <div className="relative h-[60vh] sm:h-[70vh] w-full">
          {/* Backdrop */}
          {movie.backdrop_path && (
            <Image
              src={tmdb.getBackdropUrl(movie.backdrop_path)}
              alt={movie.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative -mt-32 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0 w-64">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                {movie.poster_path ? (
                  <Image
                    src={tmdb.getImageUrl(movie.poster_path, 'w500')}
                    alt={movie.title}
                    fill
                    sizes="256px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-500">
                    No Image
                  </div>
                )}
              </div>
            </div>

            {/* Movie Info */}
            <div className="flex-1 space-y-6 pb-8">
              {/* Title & Rating */}
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{movie.title}</h1>
                {movie.tagline && (
                  <p className="text-xl text-neutral-300 italic">{movie.tagline}</p>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base">
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-1.5 bg-yellow-400 text-black px-3 py-1.5 rounded font-bold">
                    <Star className="w-5 h-5 fill-current" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-neutral-300">
                  <Calendar className="w-4 h-4" />
                  <span>{year}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <Clock className="w-4 h-4" />
                  <span>{runtime}</span>
                </div>
              </div>

              {/* Genres */}
              {movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map(genre => (
                    <span
                      key={genre.id}
                      className="px-4 py-1.5 bg-neutral-800 text-white rounded-full text-sm border border-neutral-700"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Overview</h2>
                <p className="text-neutral-300 leading-relaxed text-lg">{movie.overview}</p>
              </div>

              {/* Director & Trailer */}
              <div className="flex flex-wrap gap-4">
                {director && (
                  <div>
                    <p className="text-neutral-400 text-sm mb-1">Director</p>
                    <p className="text-white font-semibold">{director.name}</p>
                  </div>
                )}
                {trailer && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Watch Trailer
                  </a>
                )}
              </div>

              {/* Cast */}
              {cast.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Top Cast</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {cast.map(person => (
                      <div key={person.id} className="text-center">
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800 mb-2">
                          {person.profile_path ? (
                            <Image
                              src={tmdb.getImageUrl(person.profile_path, 'w200')}
                              alt={person.name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-500 text-4xl">
                              👤
                            </div>
                          )}
                        </div>
                        <p className="text-white font-medium text-sm">{person.name}</p>
                        <p className="text-neutral-400 text-xs">{person.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Movies */}
        {similar.results.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <MovieCarousel title="More like this" movies={similar.results} />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
