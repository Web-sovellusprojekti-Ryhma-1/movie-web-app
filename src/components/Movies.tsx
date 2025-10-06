import React from "react";

export interface Movie {
    tmdb_id: number;
    title: string;
    image: string;
}

interface MoviesProps {
    movies: Movie[];
    onSelect: (id: number) => void;
}

const Movies: React.FC<MoviesProps> = ({movies, onSelect}) => {
    return (
        <table>
            <tbody>
                {movies.map((movie) => (
                    <tr
                        key={movie.tmdb_id}
                        onClick={() => onSelect(movie.tmdb_id)}
                        style={{cursor: "pointer"}}
                    >
                        <td>{movie.title}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Movies;
