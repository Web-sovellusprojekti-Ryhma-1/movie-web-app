import React from "react";

export interface Movie {
    id: number;
    title: string;
}
interface MoviesProps {
  movies: Movie[];
  onSelect: (id: number) => void;
}

const Movies: React.FC<MoviesProps> = ({ movies, onSelect }) => {
  return (
    <table>
      <tbody>
        {movies.map((movie) => (
          <tr
            key={movie.id}
            onClick={() => onSelect(movie.id)}
            style={{ cursor: "pointer" }}
          >
            <td>{movie.title}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Movies;