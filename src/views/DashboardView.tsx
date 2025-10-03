import {useEffect, useState} from "react";
import {Box, Title} from "@mantine/core";
import "@mantine/core/styles.css";
import {MovieCard} from "../components/MovieCard";
import TheatreAreas from "../components/TheatreAreasfromFinnkino";
import {fetchPopularMovies} from "../api/tmdb";
import type {TmdbMovie} from "../api/tmdb";
import {useLocation} from "wouter";

const DashboardView = () => {
    const [popularMovies, setPopularMovies] = useState<TmdbMovie[]>([]);
    const [, navigate] = useLocation();

    useEffect(() => {
        const loadPopularMovies = async () => {
            try {
                const data = await fetchPopularMovies()
                setPopularMovies(data.results)
            } catch (error) {
                console.error("Failed to fetch popular movies:", error)
            }
        }

        loadPopularMovies()
    }, [])

    return (
        <Box p={20}>
            <Title order={1} mb="xl">Movies</Title>

            <Title order={2} mb="lg">Popular Now</Title>
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
    )
}

export default DashboardView;
