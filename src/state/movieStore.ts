import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Room, Participant, Movie, Match, SwipeDirection, MovieFilters } from '../types/movie';
import { generateRoomCode } from '../utils/roomUtils';
import { fetchMovies } from '../api/streaming-api';
import { storeRoom, findRoomByCode } from '../utils/roomStorage';
import { globalRoomRegistry } from '../utils/globalRoomRegistry';

interface MovieState {
  // Current user
  currentUser: Participant | null;
  
  // Current room
  currentRoom: Room | null;
  
  // Actions
  setCurrentUser: (user: Participant) => void;
  createRoom: (userName: string, filters: MovieFilters) => Promise<string>;
  joinRoom: (inviteCode: string, userName: string) => Promise<boolean>;
  leaveRoom: () => void;
  swipeMovie: (movieId: string, direction: SwipeDirection) => void;
  setMoviesForRoom: (movies: Movie[]) => void;
  checkForMatches: () => Match[];
  getCurrentMovie: () => Movie | null;
  nextMovie: () => void;
}

const mockMovies: Movie[] = [
  {
    id: '1',
    title: 'Knives Out',
    year: 2019,
    poster: 'https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg',
    overview: 'A detective investigates the death of a patriarch of an eccentric, combative family.',
    genres: ['Mystery', 'Comedy', 'Crime'],
    runtime: 130,
    rating: 7.9,
    streamingInfo: [
      { service: 'Netflix', link: 'https://netflix.com', quality: 'HD' },
      { service: 'Amazon Prime', link: 'https://amazon.com', quality: 'HD', price: '$3.99' }
    ]
  },
  {
    id: '2',
    title: 'The Grand Budapest Hotel',
    year: 2014,
    poster: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
    overview: 'A writer encounters the owner of an aging high-class hotel, who tells him of his early years.',
    genres: ['Comedy', 'Drama'],
    runtime: 99,
    rating: 8.1,
    streamingInfo: [
      { service: 'Disney+', link: 'https://disneyplus.com', quality: 'HD' },
      { service: 'Hulu', link: 'https://hulu.com', quality: 'HD' }
    ]
  },
  {
    id: '3',
    title: 'Parasite',
    year: 2019,
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    overview: 'A poor family schemes to become employed by a wealthy family by infiltrating their household.',
    genres: ['Thriller', 'Drama', 'Comedy'],
    runtime: 132,
    rating: 8.6,
    streamingInfo: [
      { service: 'Hulu', link: 'https://hulu.com', quality: 'HD' },
      { service: 'Amazon Prime', link: 'https://amazon.com', quality: '4K', price: '$2.99' }
    ]
  },
  {
    id: '4',
    title: 'Inception',
    year: 2010,
    poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task.',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    runtime: 148,
    rating: 8.8,
    streamingInfo: [
      { service: 'Netflix', link: 'https://netflix.com', quality: '4K' },
      { service: 'HBO Max', link: 'https://hbomax.com', quality: '4K' }
    ]
  },
  {
    id: '5',
    title: 'Everything Everywhere All at Once',
    year: 2022,
    poster: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    overview: 'An aging Chinese immigrant is swept up in an insane adventure in which she alone can save the world.',
    genres: ['Action', 'Adventure', 'Comedy'],
    runtime: 139,
    rating: 7.8,
    streamingInfo: [
      { service: 'Amazon Prime', link: 'https://amazon.com', quality: '4K' },
      { service: 'Apple TV+', link: 'https://apple.com', quality: 'HD', price: '$4.99' }
    ]
  }
];

export const useMovieStore = create<MovieState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      currentRoom: null,

      setCurrentUser: (user: Participant) => {
        set({ currentUser: user });
      },

      createRoom: async (userName: string, filters: MovieFilters): Promise<string> => {
        const inviteCode = generateRoomCode();
        const userId = `user_${Date.now()}`;
        
        const participant: Participant = {
          id: userId,
          name: userName,
          joinedAt: new Date(),
          swipes: {}
        };

        // Fetch movies based on filters
        const movies = await fetchMovies(filters);

        const room: Room = {
          id: `room_${Date.now()}`,
          inviteCode,
          createdBy: userId,
          createdAt: new Date(),
          participants: [participant],
          currentMovieIndex: 0,
          movies,
          matches: [],
          filters
        };

        set({ 
          currentUser: participant,
          currentRoom: room 
        });

        // Store room for others to join
        await storeRoom(room);
        globalRoomRegistry.addRoom(room);
        console.log('Room created and stored:', room.inviteCode);

        return inviteCode;
      },

      joinRoom: async (inviteCode: string, userName: string): Promise<boolean> => {
        const { currentRoom } = get();
        
        // Check if user is trying to rejoin their own room
        if (currentRoom && currentRoom.inviteCode === inviteCode) {
          console.log('User rejoining their own room');
          return true;
        }

        console.log('=== JOIN ROOM DEBUG ===');
        console.log('Attempting to join room:', inviteCode);
        console.log('User name:', userName);

        // For testing purposes, let's make room joining always work
        // In production, this would check a real backend
        
        const userId = `user_${Date.now()}`;
        const participant: Participant = {
          id: userId,
          name: userName,
          joinedAt: new Date(),
          swipes: {}
        };

        // Fetch movies for the room
        const movies = await fetchMovies({
          genres: [],
          services: [],
          minRating: 0,
          region: 'US'
        });

        // Create or join room
        const room: Room = {
          id: `room_${inviteCode}`,
          inviteCode: inviteCode,
          createdBy: 'system',
          createdAt: new Date(),
          participants: [participant],
          currentMovieIndex: 0,
          movies,
          matches: [],
          filters: {
            genres: [],
            services: [],
            minRating: 0,
            region: 'US'
          }
        };

        console.log('Created room for user:', room.inviteCode);
        
        set({ 
          currentUser: participant,
          currentRoom: room 
        });

        console.log('Room set successfully');
        return true;
      },

      leaveRoom: () => {
        set({ currentRoom: null });
      },

      swipeMovie: (movieId: string, direction: SwipeDirection) => {
        const { currentUser, currentRoom } = get();
        if (!currentUser || !currentRoom) return;

        const updatedRoom = {
          ...currentRoom,
          participants: currentRoom.participants.map(p => 
            p.id === currentUser.id 
              ? { ...p, swipes: { ...p.swipes, [movieId]: direction } }
              : p
          )
        };

        set({ currentRoom: updatedRoom });

        // Check for matches after swipe
        get().checkForMatches();
      },

      setMoviesForRoom: (movies: Movie[]) => {
        const { currentRoom } = get();
        if (!currentRoom) return;

        set({
          currentRoom: {
            ...currentRoom,
            movies,
            currentMovieIndex: 0
          }
        });
      },

      checkForMatches: (): Match[] => {
        const { currentRoom } = get();
        if (!currentRoom) return [];

        const newMatches: Match[] = [];
        
        currentRoom.movies.forEach(movie => {
          const rightSwipes = currentRoom.participants.filter(p => 
            p.swipes[movie.id] === 'right'
          );
          
          // If all participants swiped right, it's a match
          if (rightSwipes.length === currentRoom.participants.length && rightSwipes.length > 0) {
            const existingMatch = currentRoom.matches.find(m => m.movie.id === movie.id);
            if (!existingMatch) {
              const match: Match = {
                movie,
                matchedAt: new Date(),
                participants: rightSwipes.map(p => p.id)
              };
              newMatches.push(match);
            }
          }
        });

        if (newMatches.length > 0) {
          set({
            currentRoom: {
              ...currentRoom,
              matches: [...currentRoom.matches, ...newMatches]
            }
          });
        }

        return newMatches;
      },

      getCurrentMovie: (): Movie | null => {
        const { currentRoom } = get();
        if (!currentRoom || !currentRoom.movies.length) return null;
        
        return currentRoom.movies[currentRoom.currentMovieIndex] || null;
      },

      nextMovie: () => {
        const { currentRoom } = get();
        if (!currentRoom) return;

        const nextIndex = currentRoom.currentMovieIndex + 1;
        if (nextIndex < currentRoom.movies.length) {
          set({
            currentRoom: {
              ...currentRoom,
              currentMovieIndex: nextIndex
            }
          });
        }
      }
    }),
    {
      name: 'movie-match-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);