import {Box, Grid, MantineProvider, Title} from "@mantine/core";
import "@mantine/core/styles.css";
import {MovieCard} from "./components/MovieCard.tsx";
import DefaultLayout from "./layouts/DefaultLayout.tsx";
import React from "react";
import TheatreAreas from "./components/TheatreAreasfromFinnkino.tsx";

const movies = [
    {
        title: "The Shawshank Redemption",
        poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
        year: 1994,
        genre: ["Drama", "Crime"],
        rating: 9.3,
        duration: 142,
        description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        director: "Frank Darabont"
    },
    {
        title: "The Dark Knight",
        poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
        year: 2008,
        genre: ["Action", "Crime", "Drama"],
        rating: 9.0,
        duration: 152,
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        director: "Christopher Nolan"
    },
];

function App() {
    return (
        <MantineProvider>
            <DefaultLayout>
                <Box p={20}>
                    <Title order={1} mb="xl">Movies</Title>
                    
                    <TheatreAreas />
                    <Grid>
                        {movies.map((movie, index) => (
                            <Grid.Col key={index} span={{base: 12, sm: 6, md: 4, lg: 3}}>
                                <MovieCard
                                    title={movie.title}
                                    poster={movie.poster}
                                    year={movie.year}
                                    genre={movie.genre}
                                    rating={movie.rating}
                                    duration={movie.duration}
                                    description={movie.description}
                                    director={movie.director}
                                    onDetailsClick={() => console.log(`Details clicked for ${movie.title}`)}
                                />
                            </Grid.Col>
                        ))}
                    </Grid>
                </Box>
            </DefaultLayout>
        </MantineProvider>
    )
}

export default App
