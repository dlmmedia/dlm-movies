export type ScreenplayElementType = 
  | 'scene_heading'
  | 'action'
  | 'character'
  | 'dialogue'
  | 'parenthetical'
  | 'transition'
  | 'shot'
  | 'text';

export interface ScreenplayElement {
  id: string;
  type: ScreenplayElementType;
  content: string;
  sceneNumber?: number;
  revision?: string;
}

export interface Screenplay {
  id: string;
  projectId: string;
  title: string;
  author: string;
  contact?: string;
  draftNumber?: string;
  date?: string;
  elements: ScreenplayElement[];
  pageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CastMember {
  id: string;
  projectId: string;
  characterName: string;
  description: string;
  role: 'lead' | 'supporting' | 'minor';
  arcSummary: string;
  actorType: string;
  portraitUrl?: string;
  generatedAt?: string;
}

export interface GeneratedAsset {
  id: string;
  projectId: string;
  type: 'poster' | 'portrait' | 'mood_board';
  url: string;
  prompt: string;
  style?: string;
  createdAt: string;
}

// Script generation request
export interface ScriptGenerationRequest {
  referenceMovies: ReferenceMovie[];
  customPrompt?: string;
  tone?: string;
  length?: 'short' | 'feature' | 'pilot';
}

export interface ReferenceMovie {
  id: number;
  title: string;
  overview: string;
  genres: string[];
  releaseYear: number;
  director?: string;
  cast?: string[];
  tagline?: string;
}

// Screenplay format constants
export const SCREENPLAY_MARGINS = {
  scene_heading: { left: 1.5, right: 1 },
  action: { left: 1.5, right: 1 },
  character: { left: 3.7, right: 0 },
  dialogue: { left: 2.5, right: 2 },
  parenthetical: { left: 3.1, right: 2.4 },
  transition: { left: 0, right: 1 },
  shot: { left: 1.5, right: 1 },
  text: { left: 1.5, right: 1 },
} as const;

export const ELEMENT_STYLES: Record<ScreenplayElementType, {
  uppercase?: boolean;
  centered?: boolean;
  indent?: number;
  maxWidth?: number;
}> = {
  scene_heading: { uppercase: true },
  action: {},
  character: { uppercase: true, indent: 22 },
  dialogue: { indent: 10, maxWidth: 35 },
  parenthetical: { indent: 15, maxWidth: 25 },
  transition: { uppercase: true },
  shot: { uppercase: true },
  text: {},
};

