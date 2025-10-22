import { Movie, MovieDetails, MoviesResponse, MovieCredits, VideosResponse } from '@/types/movie';

const API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  
  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status}`);
  }
  
  return response.json();
};

export const tmdb = {
  // Get trending movies
  getTrending: async (timeWindow: 'day' | 'week' = 'week'): Promise<MoviesResponse> => {
    return fetcher<MoviesResponse>(
      `${BASE_URL}/trending/movie/${timeWindow}?api_key=${API_KEY}`
    );
  },

  // Get popular movies
  getPopular: async (page: number = 1): Promise<MoviesResponse> => {
    return fetcher<MoviesResponse>(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`
    );
  },

  // Get top rated movies
  getTopRated: async (page: number = 1): Promise<MoviesResponse> => {
    return fetcher<MoviesResponse>(
      `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`
    );
  },

  // Get now playing movies
  getNowPlaying: async (page: number = 1): Promise<MoviesResponse> => {
    return fetcher<MoviesResponse>(
      `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}`
    );
  },

  // Get upcoming movies
  getUpcoming: async (page: number = 1): Promise<MoviesResponse> => {
    return fetcher<MoviesResponse>(
      `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&page=${page}`
    );
  },

  // Get movie details
  getMovieDetails: async (movieId: number): Promise<MovieDetails> => {
    return fetcher<MovieDetails>(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
    );
  },

  // Get movie credits (cast and crew)
  getMovieCredits: async (movieId: number): Promise<MovieCredits> => {
    return fetcher<MovieCredits>(
      `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`
    );
  },

  // Get movie videos (trailers, teasers, etc.)
  getMovieVideos: async (movieId: number): Promise<VideosResponse> => {
    return fetcher<VideosResponse>(
      `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
    );
  },

  // Get similar movies
  getSimilarMovies: async (movieId: number): Promise<MoviesResponse> => {
    return fetcher<MoviesResponse>(
      `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}`
    );
  },

  // Get recommended movies
  getRecommendedMovies: async (movieId: number): Promise<MoviesResponse> => {
    return fetcher<MoviesResponse>(
      `${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}`
    );
  },

  // Search movies
  searchMovies: async (query: string, page: number = 1): Promise<MoviesResponse> => {
    return fetcher<MoviesResponse>(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
  },

  // Discover movies with filters
  discoverMovies: async (params: {
    page?: number;
    sort_by?: string;
    genre?: string;
    year?: number;
    vote_average_gte?: number;
  }): Promise<MoviesResponse> => {
    const queryParams = new URLSearchParams({
      api_key: API_KEY!,
      page: String(params.page || 1),
      sort_by: params.sort_by || 'popularity.desc',
      ...(params.genre && { with_genres: params.genre }),
      ...(params.year && { primary_release_year: String(params.year) }),
      ...(params.vote_average_gte && { 'vote_average.gte': String(params.vote_average_gte) }),
    });

    return fetcher<MoviesResponse>(
      `${BASE_URL}/discover/movie?${queryParams.toString()}`
    );
  },

  // Helper functions for image URLs
  getImageUrl: (path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'): string => {
    if (!path) return '/placeholder-movie.jpg';
    return `${IMAGE_BASE_URL}/${size}${path}`;
  },

  getBackdropUrl: (path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'original'): string => {
    if (!path) return '/placeholder-backdrop.jpg';
    return `${IMAGE_BASE_URL}/${size}${path}`;
  },

  // Get multiple movies by IDs
  getMoviesByIds: async (movieIds: number[]): Promise<MovieDetails[]> => {
    const moviePromises = movieIds.map(id => 
      tmdb.getMovieDetails(id).catch(() => null)
    );
    const movies = await Promise.all(moviePromises);
    return movies.filter((movie): movie is MovieDetails => movie !== null);
  },
};
