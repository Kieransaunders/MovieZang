export interface Movie {
  id: string;
  title: string;
  year: number;
  poster: string;
  overview: string;
  genres: string[];
  runtime: number;
  rating: number;
  streamingInfo: StreamingPlatform[];
}

export interface StreamingPlatform {
  service: string;
  link: string;
  quality: string;
  price?: string;
}

export interface Room {
  id: string;
  inviteCode: string;
  createdBy: string;
  createdAt: Date;
  participants: Participant[];
  currentMovieIndex: number;
  movies: Movie[];
  matches: Match[];
  filters: MovieFilters;
}

export interface Participant {
  id: string;
  name: string;
  joinedAt: Date;
  swipes: Record<string, SwipeDirection>;
}

export interface Match {
  movie: Movie;
  matchedAt: Date;
  participants: string[];
}

export interface MovieFilters {
  genres: string[];
  services: string[];
  minRating: number;
  maxRuntime?: number;
  region: string;
}

export type SwipeDirection = 'left' | 'right';

export interface SwipeData {
  movieId: string;
  direction: SwipeDirection;
  participantId: string;
  timestamp: Date;
}