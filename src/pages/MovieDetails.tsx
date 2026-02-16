import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { API_BASE_URL, API_OPTIONS } from '../api';
import type { MovieDetailsData } from '../types';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState<MovieDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/movie/${id}`, API_OPTIONS);
        if (!response.ok) throw new Error('Failed to fetch movie details');
        const data = await response.json();
        setMovie(data);
      } catch (err) {
        setError('Error loading movie details. Please try again later.');
        console.error('Error fetching movie details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <main>
        <div className="pattern" />
        <div className="wrapper">
          <Spinner />
        </div>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main>
        <div className="pattern" />
        <div className="wrapper">
          <Link to="/" className="inline-flex items-center gap-2 text-light-200 hover:text-white mb-8">
            <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Movies
          </Link>
          <p className="text-red-500">{error || 'Movie not found.'}</p>
        </div>
      </main>
    );
  }

  const {
    title, tagline, overview, poster_path, backdrop_path,
    vote_average, vote_count, runtime, release_date, status,
    genres, budget, revenue, production_companies, spoken_languages,
  } = movie;

  const formatCurrency = (amount: number) => {
    if (!amount) return 'N/A';
    return `$${amount.toLocaleString()}`;
  };

  const formatRuntime = (mins: number) => {
    if (!mins) return 'N/A';
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <main>
      <div className="pattern" />

      {/* Backdrop */}
      {backdrop_path && (
        <div className="absolute inset-0 z-0">
          <img
            src={`https://image.tmdb.org/t/p/original${backdrop_path}`}
            alt=""
            className="w-full h-[500px] object-cover"
          />
          <div className="absolute inset-0 h-[500px] bg-gradient-to-b from-primary/60 via-primary/80 to-primary" />
        </div>
      )}

      <div className="wrapper relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-light-200 hover:text-white mb-8 transition-colors">
          <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Movies
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0">
            <img
              src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : '/no-poster.png'}
              alt={title}
              className="w-full max-w-[300px] mx-auto md:mx-0 rounded-xl shadow-lg"
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="!text-left !text-4xl sm:!text-5xl">{title}</h1>
              {tagline && (
                <p className="text-light-200 italic mt-2 text-lg">"{tagline}"</p>
              )}
            </div>

            {/* Rating & Meta */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <img src="/star.svg" alt="Star" className="size-5" />
                <span className="text-white font-bold text-lg">
                  {vote_average ? vote_average.toFixed(1) : 'N/A'}
                </span>
                <span className="text-gray-100 text-sm">
                  ({vote_count?.toLocaleString()} votes)
                </span>
              </div>
              <span className="text-gray-100">|</span>
              <span className="text-white">{formatRuntime(runtime)}</span>
              <span className="text-gray-100">|</span>
              <span className="text-white">{release_date ? release_date.split('-')[0] : 'N/A'}</span>
              <span className="text-gray-100">|</span>
              <span className="text-light-200 text-sm">{status}</span>
            </div>

            {/* Genres */}
            {genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <span key={genre.id} className="px-3 py-1 rounded-full text-sm bg-light-100/10 text-light-100">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {overview && (
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Overview</h3>
                <p className="text-light-200 leading-relaxed">{overview}</p>
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
              <div>
                <p className="text-gray-100 text-sm">Budget</p>
                <p className="text-white font-medium">{formatCurrency(budget)}</p>
              </div>
              <div>
                <p className="text-gray-100 text-sm">Revenue</p>
                <p className="text-white font-medium">{formatCurrency(revenue)}</p>
              </div>
              <div>
                <p className="text-gray-100 text-sm">Release Date</p>
                <p className="text-white font-medium">{release_date || 'N/A'}</p>
              </div>
              {spoken_languages?.length > 0 && (
                <div>
                  <p className="text-gray-100 text-sm">Languages</p>
                  <p className="text-white font-medium">
                    {spoken_languages.map(l => l.english_name).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Production Companies */}
            {production_companies?.length > 0 && (
              <div>
                <h3 className="text-white font-bold text-lg mb-3">Production Companies</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  {production_companies.map((company) => (
                    <div key={company.id} className="flex items-center gap-2 bg-light-100/5 rounded-lg px-3 py-2">
                      {company.logo_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                          alt={company.name}
                          className="h-6 object-contain brightness-0 invert"
                        />
                      ) : (
                        <span className="text-light-200 text-sm">{company.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MovieDetails;
