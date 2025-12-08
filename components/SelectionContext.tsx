'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Movie, MovieDetails } from '@/types/movie';

export interface SelectedMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genres?: { id: number; name: string }[];
  genre_ids?: number[];
}

interface SelectionContextType {
  selectedMovies: SelectedMovie[];
  isSelected: (movieId: number) => boolean;
  toggleSelection: (movie: Movie | MovieDetails) => void;
  addToSelection: (movie: Movie | MovieDetails) => void;
  removeFromSelection: (movieId: number) => void;
  clearSelection: () => void;
  selectionMode: boolean;
  setSelectionMode: (mode: boolean) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedMovies, setSelectedMovies] = useState<SelectedMovie[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const isSelected = useCallback((movieId: number) => {
    return selectedMovies.some(m => m.id === movieId);
  }, [selectedMovies]);

  const addToSelection = useCallback((movie: Movie | MovieDetails) => {
    setSelectedMovies(prev => {
      if (prev.some(m => m.id === movie.id)) return prev;
      if (prev.length >= 5) return prev; // Max 5 movies
      
      return [...prev, {
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genres: 'genres' in movie ? movie.genres : undefined,
        genre_ids: 'genre_ids' in movie ? movie.genre_ids : undefined,
      }];
    });
    setSelectionMode(true);
  }, []);

  const removeFromSelection = useCallback((movieId: number) => {
    setSelectedMovies(prev => {
      const filtered = prev.filter(m => m.id !== movieId);
      if (filtered.length === 0) {
        setSelectionMode(false);
      }
      return filtered;
    });
  }, []);

  const toggleSelection = useCallback((movie: Movie | MovieDetails) => {
    if (isSelected(movie.id)) {
      removeFromSelection(movie.id);
    } else {
      addToSelection(movie);
    }
  }, [isSelected, addToSelection, removeFromSelection]);

  const clearSelection = useCallback(() => {
    setSelectedMovies([]);
    setSelectionMode(false);
  }, []);

  return (
    <SelectionContext.Provider
      value={{
        selectedMovies,
        isSelected,
        toggleSelection,
        addToSelection,
        removeFromSelection,
        clearSelection,
        selectionMode,
        setSelectionMode,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}

