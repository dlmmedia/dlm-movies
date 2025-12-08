export interface Project {
  id: string;
  userId: string;
  title: string;
  logline: string;
  synopsis: string;
  genre: string[];
  tone: string;
  referenceMovieIds: number[];
  posterUrl?: string;
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMetadata {
  id: string;
  userId: string;
  title: string;
  posterUrl?: string;
  status: Project['status'];
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  expiresAt: string;
}

