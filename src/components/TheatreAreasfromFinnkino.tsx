import React, { useContext, useEffect, useState } from 'react';
import { fetchTheatreAreas, fetchMoviesFromTheatre } from '../api/finnkinoapi';
import { searchMovieByTitle } from '../api/tmdb';
import { Grid, Box, Title, Select } from '@mantine/core';
import { useLocation } from 'wouter';
import { AuthContext } from '../context/AuthProvider';
import './TheatreAreasfromFinnkino.css';

interface TheatreArea {
  ID: string;
  Name: string;
}

interface Movie {
  title: string;
  showtime: string;
  length: number;
  theatre: string;
  auditorium: string;
  image?: string;
  genre: string;
  date: string;
  presentationMethod: string;
  rating: string;
}

interface TheatreAreasResponse {
  TheatreAreas: {
    TheatreArea: TheatreArea[];
  };
}

interface MoviesResponse {
  shows: Movie[];
}

const TheatreAreas: React.FC = () => {
  const [areas, setAreas] = useState<TheatreArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [, navigate] = useLocation();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchTheatreAreas<TheatreAreasResponse>()
      .then((data) => {
        setAreas(data.TheatreAreas.TheatreArea);
      })
      .catch((error) => {
        console.error('Error loading areas: ', error);
        setError('Failed to load theatre areas');
      });
  }, []);

  useEffect(() => {
    if (selectedArea) {
      setLoading(true);
      fetchMoviesFromTheatre<MoviesResponse>(selectedArea)
        .then((data) => {
          const sortedMovies = data.shows.sort((a: Movie, b: Movie) => new Date(a.showtime).getTime() - new Date(b.showtime).getTime());
          setMovies(sortedMovies);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error loading movies:', error);
          setError('Failed to load movies');
          setLoading(false);
        });
    } else {
      setMovies([]);
    }
  }, [selectedArea]);

  // haetaan elokuvan id sen titlen perusteella ja navigoidaan MovieDetailsView:iin
  const handleMoreDetails = async (title: string) => {
    try {
      const searchResults = await searchMovieByTitle(title);
      if (searchResults && searchResults.results.length > 0) {
        const movieId = searchResults.results[0].id;
        navigate(`/movie/${movieId}`);
      } else {
        console.error('No movie found with the given title.');
      }
    } catch (error) {
      console.error('Error fetching movie ID:', error);
    }
  };

  const handleAddToGroup = (movieTitle: string) => {
    console.log(`Add movie '${movieTitle}' to group`);
    // kunhan groupit on niin lisätään tähän logiikkaa elokuvan lisäämiseksi ryhmään
  };

  return (
    <div className="theatre-areas-container">
      <Title order={3} mb="lg">Select Theatre Area</Title>
      <Select
        placeholder="Select theatre area"
        data={areas.map((area) => ({ value: String(area.ID), label: area.Name }))}
        value={selectedArea}
        onChange={(value) => setSelectedArea(value || '')}
      />

      {loading && <p>Loading movies...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div id="movieList" style={{ marginTop: '2rem' }}>
        {selectedArea && movies.length === 0 && !loading && (
          <p>No movies found for this theatre.</p>
        )}

        <Grid>
          {movies.map((movie, index) => (
            <Grid.Col key={index} span={12}>
              <Box className="movie-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <img
                  src={movie.image || 'https://placehold.co/342x500?text=No+Image'}
                  alt={movie.title}
                  className="movie-image"
                  style={{ flexShrink: 0, width: '200px', height: '300px', objectFit: 'cover' }}
                />
                <Box className="movie-details" style={{ flexGrow: 1 }}>
                  <Title order={4} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {movie.title}
                    <button onClick={() => handleMoreDetails(movie.title)} style={{ marginLeft: '1rem', padding: '0.5rem 1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      More Details
                    </button>
                  </Title>
                  {user && (
                    <button onClick={() => handleAddToGroup(movie.title)} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Add Movie to Group
                    </button>
                  )}
                  <p><strong>Showtime:</strong> {new Date(movie.showtime).toLocaleTimeString()}</p>
                  <p><strong>Theatre:</strong> {movie.theatre}</p>
                  <p><strong>Auditorium:</strong> {movie.auditorium}</p>
                  <p><strong>Length:</strong> {movie.length} minutes</p>
                  <p><strong>Genre:</strong> {movie.genre}</p>
                  <p><strong>Presentation:</strong> {movie.presentationMethod}</p>
                  <p><strong>Rated:</strong> {movie.rating}</p>
                </Box>
              </Box>
            </Grid.Col>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default TheatreAreas;
