import {Box, Button, Modal, Title} from "@mantine/core";
import "@mantine/core/styles.css";
import {useEffect, useState} from "react";
import {useLocation} from "wouter";
import type {TmdbMovie} from "../api/tmdb";
import {fetchMovieById, fetchPopularMovies} from "../api/tmdb";
import {MovieCard} from "../components/MovieCard";
import TheatreAreas from "../components/TheatreAreasfromFinnkino";

const DashboardView = () => {
    const [popularMovies, setPopularMovies] = useState<TmdbMovie[]>([]);
    const [randomMovie, setRandomMovie] = useState<TmdbMovie | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [, navigate] = useLocation();

    useEffect(() => {
        const loadPopularMovies = async () => {
            try {
                const data = await fetchPopularMovies()
                const movies = Array.isArray(data?.results) ? data.results : []
                setPopularMovies(movies)
            } catch (error) {
                console.error("Failed to fetch popular movies:", error)
                setPopularMovies([])
            }
        }

        loadPopularMovies()
    }, [])

    const suggestRandomMovie = async () => {
        try {
            const randomId = Math.floor(Math.random() * 100000); // kokeillaan generoida satunnainen id
            const movie = await fetchMovieById(randomId);
            setRandomMovie(movie);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch random movie:", error);
        }
    };

    return (
        <Box p={20}>
            <Title order={1} mb="xl">Welcome to Movie App</Title>
            <Title order={2} mb="xl">Don't know what to watch?</Title>

            <Button onClick={suggestRandomMovie} style={{marginBottom: "1rem"}}>
                Suggest Random Movie
            </Button>

            <Modal
                opened={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Random Movie Suggestion"
            >
                {randomMovie && (
                    <div>
                        <Title order={4}>{randomMovie.title}</Title>
                        <img
                            src={
                                randomMovie.poster_path
                                    ? `https://image.tmdb.org/t/p/w342${randomMovie.poster_path}`
                                    : "https://placehold.co/342x500?text=No+Image"
                            }
                            alt={randomMovie.title}
                            style={{width: "100%", marginBottom: "1rem"}}
                        />
                        <p>{randomMovie.overview}</p>
                        <Button onClick={suggestRandomMovie} style={{marginRight: "1rem"}}>
                            Suggest Another Movie
                        </Button>
                        <Button onClick={() => navigate(`/movie/${randomMovie.id}`)}>
                            View More Details
                        </Button>
                    </div>
                )}
            </Modal>


            <Title order={3} mb="lg">Popular Now</Title>
            <Box
                style={{
                    display: "flex",
                    overflowX: "auto",
                    gap: "1rem",
                    padding: "1rem",
                    whiteSpace: "nowrap",
                }}
            >
                {popularMovies.map((movie, index) => (
                    <Box key={index} style={{flex: "0 0 auto", width: "200px"}}>
                        <MovieCard
                            title={movie.title}
                            poster={
                                movie.poster_path
                                    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                                    : "https://placehold.co/342x500?text=No+Image"
                            }
                            year={movie.release_date ? Number(movie.release_date.slice(0, 4)) : 0}
                            genre={[]}
                            rating={movie.vote_average}
                            description={movie.overview}
                            onDetailsClick={() => navigate(`/movie/${movie.id}`)}
                        />
                    </Box>
                ))}
            </Box>

            <TheatreAreas/>
        </Box>
    );
};

export default DashboardView;
