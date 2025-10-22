import Link from 'next/link';
import { Film, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-3xl font-bold bg-yellow-400 text-black px-3 py-1 rounded">
                DLM
              </div>
              <span className="text-white font-semibold">Movies</span>
            </Link>
            <p className="text-neutral-400 text-sm">
              Your ultimate destination for discovering, exploring, and tracking movies from around the world.
            </p>
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              <span>for movie lovers</span>
            </div>
          </div>

          {/* Movies */}
          <div>
            <h3 className="text-white font-semibold mb-4">Movies</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/popular" className="text-neutral-400 hover:text-yellow-400 transition-colors text-sm">
                  Popular
                </Link>
              </li>
              <li>
                <Link href="/top-rated" className="text-neutral-400 hover:text-yellow-400 transition-colors text-sm">
                  Top Rated
                </Link>
              </li>
              <li>
                <Link href="/now-playing" className="text-neutral-400 hover:text-yellow-400 transition-colors text-sm">
                  Now Playing
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-neutral-400 hover:text-yellow-400 transition-colors text-sm">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Curated Lists */}
          <div>
            <h3 className="text-white font-semibold mb-4">Curated Lists</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/curated/christmas" className="text-neutral-400 hover:text-yellow-400 transition-colors text-sm">
                  Christmas Movies
                </Link>
              </li>
              <li>
                <Link href="/curated/entrepreneurs" className="text-neutral-400 hover:text-yellow-400 transition-colors text-sm">
                  For Entrepreneurs
                </Link>
              </li>
              <li>
                <Link href="/curated/students" className="text-neutral-400 hover:text-yellow-400 transition-colors text-sm">
                  For Students
                </Link>
              </li>
              <li>
                <Link href="/curated" className="text-neutral-400 hover:text-yellow-400 transition-colors text-sm">
                  View All Lists
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-neutral-400 hover:text-yellow-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-400 hover:text-yellow-400 transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-neutral-400 hover:text-yellow-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-neutral-400 hover:text-yellow-400 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <p className="text-neutral-500 text-sm text-center">
            © {currentYear} DLM Movies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
