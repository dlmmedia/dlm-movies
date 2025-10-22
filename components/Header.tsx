'use client';

import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-3xl font-bold bg-yellow-400 text-black px-3 py-1 rounded">
              DLM
            </div>
            <span className="text-white font-semibold hidden sm:block">Movies</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-white hover:text-yellow-400 transition-colors font-medium">
              Home
            </Link>
            <Link href="/popular" className="text-white hover:text-yellow-400 transition-colors font-medium">
              Popular
            </Link>
            <Link href="/top-rated" className="text-white hover:text-yellow-400 transition-colors font-medium">
              Top Rated
            </Link>
            <Link href="/curated" className="text-white hover:text-yellow-400 transition-colors font-medium">
              Curated Lists
            </Link>
          </nav>

          {/* Search and Menu */}
          <div className="flex items-center gap-4">
            <Link
              href="/search"
              className="text-white hover:text-yellow-400 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-4 border-t border-neutral-800">
            <Link
              href="/"
              className="block text-white hover:text-yellow-400 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/popular"
              className="block text-white hover:text-yellow-400 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Popular
            </Link>
            <Link
              href="/top-rated"
              className="block text-white hover:text-yellow-400 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Top Rated
            </Link>
            <Link
              href="/curated"
              className="block text-white hover:text-yellow-400 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Curated Lists
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
