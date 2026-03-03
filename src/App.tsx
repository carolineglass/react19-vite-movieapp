import { useEffect, useState, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import Pagination from './components/Pagination';
import MovieDetails from './pages/MovieDetails';
import { useDebounce } from 'react-use';
import { updateSearchCount, getTrendingMovies } from './appwrite';
import { API_BASE_URL, API_OPTIONS } from './api';
import type { Movie, TrendingMovie, MovieListResponse } from './types';

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Ref for scrolling to "All Movies" section on page change
  const allMoviesRef = useRef<HTMLDivElement>(null);
  // Flag to only scroll after pagination clicks, not on initial load or search changes
  const shouldScrollRef = useRef(false);

  // Debounce the search term to avoid too many API calls when the user types quickly
  // useDebounce is a custom hook that delays the execution of a function
  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );

  const fetchMovies = async (query = '', page = 1, genre = '') => {
    setLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
        : `${API_BASE_URL}/discover/movie?sort_by=${encodeURIComponent(sortBy)}&page=${page}${genre ? `&with_genres=${genre}` : ''}`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data: MovieListResponse = await response.json();
      if (!data.results) {
        setErrorMessage('Failed to fetch movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results);
      // TMDB API errors beyond page 500, so cap it there
      setTotalPages(Math.min(data.total_pages || 0, 500));

      // Only track search analytics on page 1 to avoid duplicate counts per query
      if (query && data.results.length > 0 && page === 1) {
        const movie = data.results[0];
        await updateSearchCount(query, movie);
      }
    } catch (error) {
      setErrorMessage('Error fetching movies. Please try again later.');
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    }
  };

  const loadGenres = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/genre/movie/list?language=en-US`,
        API_OPTIONS
      );
      if (!res.ok) throw new Error('Failed to fetch genres');
      const data = await res.json();
      setGenres(data.genres || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  useEffect(() => {
    loadTrendingMovies();
    loadGenres();
  }, []);

  // Reset to page 1 whenever the search query changes
  useEffect(() => {
    setCurrentPage(1);
    fetchMovies(debouncedSearchTerm, 1, selectedGenre);
  }, [debouncedSearchTerm, selectedGenre, sortBy]);

  // Scroll to "All Movies" after loading completes, but only when triggered by pagination
  // (shouldScrollRef prevents scrolling on initial load or search changes)
  useEffect(() => {
    if (!loading && shouldScrollRef.current) {
      shouldScrollRef.current = false;
      allMoviesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading]);

  const handlePageChange = (page: number) => {
    shouldScrollRef.current = true;
    setCurrentPage(page);
    fetchMovies(debouncedSearchTerm, page, selectedGenre);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <main>
            <div className="pattern" />
            <div className="wrapper">
              <header>
                <img src="./hero-img.png" alt="Hero Banner" />
                <h1>
                  Find <span className="text-gradient">Movies</span> You'll
                  Enjoy Without the Hassle
                </h1>
                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              </header>
              {trendingMovies.length > 0 && (
                <section className="trending">
                  <h2>Trending Movies</h2>
                  <ul>
                    {trendingMovies.map((movie, index) => (
                      <li key={movie.$id}>
                        <p>{index + 1}</p>
                        <img src={movie.poster_url} alt={movie.title} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <div className="mt-4 w-full overflow-x-auto">
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setSelectedGenre('')}
                    className={`px-3 py-1 rounded-full border transition whitespace-nowrap ${selectedGenre === '' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent' : 'bg-white text-gray-700 border-gray-200'}`}
                  >
                    All
                  </button>
                  {genres.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGenre(String(g.id))}
                      className={`px-3 py-1 rounded-full border transition whitespace-nowrap ${selectedGenre === String(g.id) ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent' : 'bg-white text-gray-700 border-gray-200'}`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex gap-2 items-center">
                <span className="text-sm text-gray-600 mr-2">Sort:</span>
                <button
                  onClick={() => setSortBy('popularity.desc')}
                  className={`px-3 py-1 rounded-full border transition ${sortBy === 'popularity.desc' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent' : 'bg-white text-gray-700 border-gray-200'}`}
                >
                  Popularity
                </button>
                <button
                  onClick={() => setSortBy('vote_average.desc')}
                  className={`px-3 py-1 rounded-full border transition ${sortBy === 'vote_average.desc' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent' : 'bg-white text-gray-700 border-gray-200'}`}
                >
                  Rating
                </button>
              </div>
              <section className="all-movies">
                <div
                  className="flex items-center justify-between mt-[40px] scroll-mt-[40px]"
                  ref={allMoviesRef}
                >
                  <h2>All Movies</h2>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>

                {/* Show spinner only on initial load; on page changes, dim existing results instead */}
                {loading && movieList.length === 0 ? (
                  <Spinner />
                ) : errorMessage ? (
                  <p className="text-red-500">{errorMessage}</p>
                ) : (
                  <ul
                    className={loading ? 'opacity-50 pointer-events-none' : ''}
                  >
                    {movieList.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </ul>
                )}
                {!loading && totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </section>
            </div>
          </main>
        }
      />
      <Route path="/movie/:id" element={<MovieDetails />} />
    </Routes>
  );
};

export default App;
