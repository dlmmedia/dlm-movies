# DLM Movies 🎬

An IMDb-style movie discovery platform built with Next.js 15, featuring curated movie lists, advanced search, and beautiful UI with TMDB API integration.

## Features

- 🎥 **Hero Carousel**: Auto-playing slideshow of trending movies
- 🎯 **Curated Lists**: Hand-picked collections (Christmas movies, Entrepreneur films, Student favorites, etc.)
- 🔍 **Advanced Search**: Find any movie with real-time search
- 📱 **Responsive Design**: Works beautifully on all devices
- ⚡ **Server-Side Rendering**: Fast, SEO-optimized pages
- 🎨 **IMDb-style Design**: Dark theme with yellow accents
- ⭐ **Movie Details**: Full info including cast, trailers, ratings, and similar movies
- 📊 **Structured Data**: Rich snippets for better SEO

## Tech Stack

- Modern React framework with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Lucide React for icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- API key (already configured in `.env.local`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
dlm-movies/
├── app/
│   ├── layout.tsx          # Root layout with SEO metadata
│   ├── page.tsx            # Homepage with hero & carousels
│   ├── movie/[id]/         # Dynamic movie detail pages
│   ├── popular/            # Popular movies page
│   ├── top-rated/          # Top rated movies page
│   ├── now-playing/        # Now playing movies page
│   ├── search/             # Search functionality
│   ├── curated/            # Curated lists hub & pages
│   ├── sitemap.ts          # Dynamic sitemap generation
│   └── robots.ts           # Robots.txt configuration
├── components/
│   ├── Header.tsx          # Navigation header
│   ├── HeroSection.tsx     # Hero carousel component
│   ├── MovieCard.tsx       # Movie card with ratings
│   └── MovieCarousel.tsx   # Horizontal scrolling carousel
├── lib/
│   └── tmdb.ts            # TMDB API service functions
└── types/
    └── movie.ts           # TypeScript interfaces
```

## Features in Detail

### SEO Optimizations
- Server-side rendering for all pages
- Dynamic metadata generation
- Open Graph and Twitter Cards
- Structured data (Schema.org) for movies
- Dynamic sitemap with movie pages
- Robots.txt configuration

### Curated Lists
- Christmas Movies
- Movies for Entrepreneurs
- Movies for Students
- And more...

### Movie Detail Pages
- High-quality backdrop and poster images
- Ratings, runtime, and release year
- Full cast with photos
- Director information
- YouTube trailer integration
- Similar movie recommendations
- Structured data for SEO

## Deployment

The application is ready for deployment to any modern hosting platform that supports Node.js applications.

## Credits

Built with modern web technologies and best practices.
