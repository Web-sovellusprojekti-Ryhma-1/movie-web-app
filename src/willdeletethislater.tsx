import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";


import Movies from "./components/Movies";
import type { Movie } from "./components/Movies";
import MovieDetails from "./components/MovieDetails";
import type { MovieDetailsData } from "./components/MovieDetails";
import Favorites from "./components/Favorites";

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [query, setQuery] = useState<string>("Star Wars");
  const [selectedMovie, setSelectedMovie] = useState<MovieDetailsData | null>(
    null
  );
  const [favorites, setFavorites] = useState<Movie[]>([]);

  // backendistä haetaan elokuvat huom portti taikka osote
  const search = () => {
    fetch(
      `http://localhost:5000/api/tmdb/search?query=${encodeURIComponent(
        query
      )}&page=${page}`
    )
      .then((response) => response.json())
      .then((json) => {
        setMovies(json.results);
        setPageCount(json.total_pages);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // haetaan elokuvan tiedot backendistä idn mukaan
  const fetchMovieDetails = (id: number) => {
    fetch(`http://localhost:5000/api/tmdb/movie/${id}`)
      .then((response) => response.json())
      .then((json) => {
        setSelectedMovie(json);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // "favourites" listaan lisääminen
  const addToFavorites = (movie: Movie) => {
    if (!favorites.find((fav) => fav.id === movie.id)) {
      setFavorites([...favorites, movie]);
    }
  };

  useEffect(() => {
    search();
  }, [page]);

  return (
    <div id="container">
      <h3>Search Movies</h3>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={search} type="button">
        Search
      </button>

      {!selectedMovie ? (
        <>
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={(e) => setPage(e.selected + 1)}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel="<"
            renderOnZeroPageCount={null}
          />
          <Movies movies={movies} onSelect={fetchMovieDetails} />
        </>
      ) : (
        <MovieDetails
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          addToFavorites={addToFavorites}
        />
      )}

      <Favorites favorites={favorites} />
    </div>
  );
};

export default App;
