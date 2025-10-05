import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Box, Skeleton, Title, Container } from "@mantine/core";
import MovieDetails from "../components/MovieDetails";
import { transformTmdbMovie } from "../helpers/movieHelpers";
import { getMovieDetails } from "../api/tmdb";
import type { MovieDetails as MovieDetailsType } from "../helpers/movieHelpers";

const MovieDetailsView = () => {
  const [, params] = useRoute("/movie/:title");
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const title = params?.title;

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        if (!title) {
          throw new Error("Movie title is missing.");
        }
        const data = await getMovieDetails(title);
        if (!data || data.success === false) {
          throw new Error(data.status_message || "Failed to fetch movie details.");
        }
        const transformedData = transformTmdbMovie(data);
        setMovie(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [title]);

  if (isLoading) {
    return (
      <Box p={20}>
        <Skeleton height={50} mb={20} />
        <Skeleton height={300} mb={20} />
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} height={20} mb={10} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={20}>
        <Title order={2} style={{ color: "red" }}>
          Error
        </Title>
        <p>{error}</p>
      </Box>
    );
  }

  return (
    <Container size="lg" p={20}>
      {movie && (
        <MovieDetails
          movie={movie}
          onClose={() => window.history.back()}
          addToFavorites={(m) => console.log("Add to favorites", m)}
        />
      )}
    </Container>
  );
};

export default MovieDetailsView;