'use client';

import Link from 'next/link';
import { Search, Menu, X, Sparkles, LayoutDashboard, Film, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSelection } from './SelectionContext';

interface UserSession {
  id: string;
  email: string;
  name: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { selectedMovies, selectionMode } = useSelection();

  useEffect(() => {
    // Check session on mount
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setShowUserMenu(false);
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-3xl font-bold bg-yellow-400 text-black px-3 py-1 rounded flex items-center gap-1">
              <Film className="w-6 h-6" />
              DLM
            </div>
            <span className="text-white font-semibold hidden sm:block">Screenwriter</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-white hover:text-yellow-400 transition-colors font-medium">
              Discover
            </Link>
            <Link href="/popular" className="text-white hover:text-yellow-400 transition-colors font-medium">
              Popular
            </Link>
            <Link href="/top-rated" className="text-white hover:text-yellow-400 transition-colors font-medium">
              Top Rated
            </Link>
            <Link href="/curated" className="text-white hover:text-yellow-400 transition-colors font-medium">
              Curated
            </Link>
            
            {/* Screenwriter CTA */}
            {selectionMode && selectedMovies.length > 0 ? (
              <Link
                href="/screenwriter/new"
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Create Script ({selectedMovies.length})
              </Link>
            ) : (
              <Link
                href={user ? "/dashboard" : "/auth/login"}
                className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
              >
                <Sparkles className="w-4 h-4" />
                {user ? "My Scripts" : "Start Writing"}
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/search"
              className="text-white hover:text-yellow-400 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors"
                >
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-neutral-700">
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-neutral-400 text-sm">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-white hover:bg-neutral-800 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-neutral-800 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:flex items-center gap-2 text-white hover:text-yellow-400 transition-colors font-medium"
              >
                <User className="w-5 h-5" />
                Sign in
              </Link>
            )}

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
              Discover
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
              Curated
            </Link>
            
            <div className="pt-4 border-t border-neutral-800">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mt-4 flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Sign in to start writing
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
