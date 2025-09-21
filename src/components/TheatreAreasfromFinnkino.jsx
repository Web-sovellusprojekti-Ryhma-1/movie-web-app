import React, { useEffect, useState } from 'react';
import { fetchTheatreAreas, fetchMoviesFromTheatre } from './api/finnkinoapi';

const TheatreAreas = () => {
  const [areas, setAreas] = useState([])
  const [selectedArea, setSelectedArea] = useState('')
  const [movies, setMovies] = useState([])

  // haetaan teatterit
  useEffect(() => {
    fetchTheatreAreas()
      .then((data) => {
        const theatreAreas = data.TheatreAreas.TheatreArea
        setAreas(theatreAreas)
      })
      .catch((error) => console.error('Error loading areas: ', error))
  }, [])

  // haetaan elokuvat kun on valittu teatteri
  useEffect(() => {
    if (selectedArea) {
      fetchMoviesFromTheatre(selectedArea)
        .then((data) => {
          const shows = data.Schedule.Shows.Show || []
          setMovies(shows)
        })
        .catch((error) => console.error('Error loading movies:', error))
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
