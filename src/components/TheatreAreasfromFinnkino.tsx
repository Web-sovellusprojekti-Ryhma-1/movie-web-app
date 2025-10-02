import React, { useEffect, useState } from 'react';
import { fetchTheatreAreas, fetchMoviesFromTheatre } from '../api/finnkinoapi';
import { Grid } from '@mantine/core';
import { MovieCard } from './MovieCard';
import './TheatreAreasfromFinnkino.css'; 

interface TheatreArea {
  ID: string
  Name: string
}

interface Movie {
  Title: string
  Theatre: string
  dttmShowStart: string
  LengthInMinutes: string
  ProductionYear: string
  Images?: {
    EventMediumImagePortrait?: string
  }
}

interface TheatreAreasResponse {
  TheatreAreas: {
    TheatreArea: TheatreArea[]
  }
}

interface MoviesResponse {
  Schedule: {
    Shows: {
      Show: Movie[]
    }
  }
}

const TheatreAreas: React.FC = () => {
  const [areas, setAreas] = useState<TheatreArea[]>([])
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  // haetaan teatterialueet
  useEffect(() => {
    fetchTheatreAreas<TheatreAreasResponse>()
      .then((data) => {
        const theatreAreas = data.TheatreAreas.TheatreArea;
        setAreas(theatreAreas);
      })
      .catch((error) => {
        console.error('Error loading areas: ', error)
        setError('Failed to load theatre areas')
      })
  }, [])

  // listataan elokuvat kun valitaan teatteri
  useEffect(() => {
    if (selectedArea) {
      setLoading(true)
      fetchMoviesFromTheatre<MoviesResponse>(selectedArea)
        .then((data) => {
          const shows = data.Schedule.Shows.Show || []
          setMovies(shows)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error loading movies:', error)
          setError('Failed to load movies')
          setLoading(false)
        })
    } else {
      setMovies([])
    }
  }, [selectedArea])

  return (
    <div className="theatre-areas-container">
      <label htmlFor="theatreSelect" className="theatre-label">
        Select theatre area:
      </label>
      <select
        id="theatreSelect"
        className="theatre-select"
        value={selectedArea}
        onChange={(e) => setSelectedArea(e.target.value)}
      >
        <option value="">-- Select theatre area --</option>
        {areas.map((area) => (
          <option key={area.ID} value={area.ID}>
            {area.Name}
          </option>
        ))}
      </select>

      {loading && <p>Loading movies...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div id="movieList">
        {selectedArea && movies.length === 0 && (
          <p>No movies found for this theatre.</p>
        )}

        <Grid>
          {movies.map((movie, index) => (
            <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <MovieCard
                title={movie.Title}
                poster={
                  movie.Images?.EventMediumImagePortrait ||
                  'https://placehold.co/342x500?text=No+Image'
                }
                year={parseInt(movie.ProductionYear) || 0}
                genre={[]} // Finnkino API does not provide genres
                rating={0} // Finnkino API does not provide ratings
                duration={parseInt(movie.LengthInMinutes) || undefined}
                description={`Showtime: ${movie.dttmShowStart}`}
                onDetailsClick={() =>
                  console.log(`Details clicked for ${movie.Title}`)
                }
              />
            </Grid.Col>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default TheatreAreas;
