import React from "react";

export interface CastMember {
  cast_id: number;
  name: string;
  character: string;
}

export interface MovieDetailsData {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string | null;
  credits?: {
    cast?: CastMember[];
  };
}

interface MovieDetailsProps {
  movie: MovieDetailsData | null;
  onClose: () => void;
  addToFavorites: (movie: MovieDetailsData) => void;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({
  movie,
  onClose,
  addToFavorites,
}) => {
  if (!movie) return null;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1em",
        marginTop: "1em",
      }}
    >
      <button onClick={onClose}>Go Back</button>
      <h2>{movie.title}</h2>
      {posterUrl && (
        <img src={posterUrl} alt={movie.title} style={{ maxWidth: "200px" }} />
      )}
      <p>
        <strong>Release Date:</strong> {movie.release_date}
      </p>
      <p>
        <strong>Overview:</strong> {movie.overview}
      </p>
      <h3>Top Cast:</h3>
      <ul>
        {movie.credits?.cast?.slice(0, 5).map((actor) => (
          <li key={actor.cast_id}>
            {actor.name} as <em>{actor.character}</em>
          </li>
        ))}
      </ul>
      <button onClick={() => addToFavorites(movie)}>⭐ Add to Favorites</button>
    </div>
  );
};

export default MovieDetails;
