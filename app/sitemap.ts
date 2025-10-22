import { MetadataRoute } from 'next';
import { tmdb } from '@/lib/tmdb';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://dlmmovies.com';

  // Static routes
  const routes = [
    '',
    '/popular',
    '/top-rated',
    '/now-playing',
    '/curated',
    '/curated/christmas',
    '/curated/entrepreneurs',
    '/curated/students',
    '/search',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic movie routes (sample of popular movies)
  try {
    const popular = await tmdb.getPopular(1);
    const movieRoutes = popular.results.slice(0, 50).map((movie) => ({
      url: `${baseUrl}/movie/${movie.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...routes, ...movieRoutes];
  } catch {
    return routes;
  }
}
