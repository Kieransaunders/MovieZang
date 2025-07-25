import { Movie, MovieFilters } from '../types/movie';

// Mock data for demonstration - replace with real API calls
const MOCK_MOVIES: Movie[] = [
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
  },
  {
    id: '6',
    title: 'The Batman',
    year: 2022,
    poster: 'https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
    overview: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate.',
    genres: ['Action', 'Crime', 'Drama'],
    runtime: 176,
    rating: 7.8,
    streamingInfo: [
      { service: 'HBO Max', link: 'https://hbomax.com', quality: '4K' },
      { service: 'Amazon Prime', link: 'https://amazon.com', quality: 'HD', price: '$5.99' }
    ]
  },
  {
    id: '7',
    title: 'Dune',
    year: 2021,
    poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    overview: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding.",
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    runtime: 155,
    rating: 8.0,
    streamingInfo: [
      { service: 'HBO Max', link: 'https://hbomax.com', quality: '4K' },
      { service: 'Amazon Prime', link: 'https://amazon.com', quality: '4K', price: '$3.99' }
    ]
  },
  {
    id: '8',
    title: 'Spider-Man: No Way Home',
    year: 2021,
    poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    overview: "Spider-Man's identity is revealed, and he asks Doctor Strange for help.",
    genres: ['Action', 'Adventure', 'Fantasy'],
    runtime: 148,
    rating: 8.4,
    streamingInfo: [
      { service: 'Netflix', link: 'https://netflix.com', quality: '4K' },
      { service: 'Disney+', link: 'https://disneyplus.com', quality: '4K' }
    ]
  }
];

/**
 * Fetch movies based on filters
 * In a real implementation, this would call the Streaming Availability API
 */
export async function fetchMovies(filters: MovieFilters): Promise<Movie[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let filteredMovies = [...MOCK_MOVIES];
  
  // Filter by genres
  if (filters.genres.length > 0) {
    filteredMovies = filteredMovies.filter(movie =>
      movie.genres.some(genre => filters.genres.includes(genre))
    );
  }
  
  // Filter by minimum rating
  if (filters.minRating > 0) {
    filteredMovies = filteredMovies.filter(movie => movie.rating >= filters.minRating);
  }
  
  // Filter by max runtime
  if (filters.maxRuntime) {
    filteredMovies = filteredMovies.filter(movie => movie.runtime <= filters.maxRuntime!);
  }
  
  // Filter by streaming services
  if (filters.services.length > 0) {
    filteredMovies = filteredMovies.filter(movie =>
      movie.streamingInfo.some(platform => 
        filters.services.includes(platform.service)
      )
    );
  }
  
  // Shuffle array for variety
  return filteredMovies.sort(() => Math.random() - 0.5);
}

/**
 * Get movie details by ID
 * In a real implementation, this would call the Streaming Availability API
 */
export async function getMovieById(id: string): Promise<Movie | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return MOCK_MOVIES.find(movie => movie.id === id) || null;
}

/**
 * Real API implementation example (commented out)
 * Uncomment and replace with actual API key when ready
 */
/*
const STREAMING_API_KEY = process.env.STREAMING_AVAILABILITY_API_KEY;
const STREAMING_API_BASE = 'https://streaming-availability.p.rapidapi.com';

export async function fetchMoviesFromAPI(filters: MovieFilters): Promise<Movie[]> {
  try {
    const response = await fetch(`${STREAMING_API_BASE}/shows/search/filters`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': STREAMING_API_KEY!,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
      },
      // Add query parameters based on filters
    });
    
    const data = await response.json();
    
    // Transform API response to our Movie interface
    return data.shows.map(transformApiResponseToMovie);
  } catch (error) {
    console.error('Error fetching movies from API:', error);
    throw error;
  }
}

function transformApiResponseToMovie(apiMovie: any): Movie {
  return {
    id: apiMovie.id,
    title: apiMovie.title,
    year: apiMovie.year,
    poster: apiMovie.imageSet.verticalPoster.w480,
    overview: apiMovie.overview || '',
    genres: apiMovie.genres || [],
    runtime: apiMovie.runtime || 0,
    rating: apiMovie.rating || 0,
    streamingInfo: Object.values(apiMovie.streamingOptions).flat().map((option: any) => ({
      service: option.service.name,
      link: option.link,
      quality: option.quality,
      price: option.price?.formatted
    }))
  };
}
*/