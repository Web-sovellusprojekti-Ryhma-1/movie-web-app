import React, { useEffect, useState } from 'react';
import { fetchTheatreAreas, fetchMoviesFromTheatre } from '../api/finnkinoapi';

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

  // haetaan teatterit
  useEffect(() => {
    fetchTheatreAreas<TheatreAreasResponse>()
      .then((data) => {
        const theatreAreas = data.TheatreAreas.TheatreArea
        setAreas(theatreAreas)
      })
      .catch((error) => {
      console.error('Error loading areas: ', error)
      setError('Failed to load theatre areas')
      })
  }, [])

  // haetaan elokuvat kun on valittu teatteri
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
    }
    else{
        setMovies([])
    }
  }, [selectedArea])

  return (
    <div>
      <label htmlFor="theatreSelect">Select theatre area:</label>
      <select
        id="theatreSelect"
        value={selectedArea}
        onChange={(e) => setSelectedArea(e.target.value)}>
            
        <option value="">-- Select theatre area --</option>
        {areas.map((area) => (
          <option key={area.ID} value={area.ID}>
            {area.Name}
          </option>
        ))}
      </select>

      {loading && <p>Loading movies..</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div id="movieList">
        {selectedArea && movies.length === 0 && (
          <p>No movies found for this theatre.</p>
        )}

        {movies.map((movie, index) => (
          <div key={index} className="movie" style={{ marginBottom: "1rem" }}>
            {movie.Images?.EventMediumImagePortrait && (
              <img
                src={movie.Images.EventMediumImagePortrait}
                alt={movie.Title}
                style={{ width: "120px", marginRight: "1rem" }}
              />
            )}

            <div className="movie-info">
              <h2>{movie.Title}</h2>
              <p>
                Year: {movie.ProductionYear || "N/A"}, Length:{" "}
                {movie.LengthInMinutes || "N/A"} min
              </p>
              <p>Theatre: {movie.Theatre}</p>
              <p>Showtime: {movie.dttmShowStart}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TheatreAreas;
