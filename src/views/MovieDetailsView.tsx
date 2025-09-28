import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Box, Skeleton, Title, Container } from "@mantine/core";
import MovieDetails from "../components/MovieDetails";
import { transformTmdbMovie } from "../helpers/movieHelpers";
import { getMovieDetails } from "../api/tmdb";
import type { MovieDetails as MovieDetailsType } from "../helpers/movieHelpers";

const MovieDetailsView = () => {
  const [match, params] = useRoute("/movie/:id")
  console.log("MovieDetailsView: useRoute match:", match, "params:", params)

  const id = params?.id
  console.log("MovieDetailsView: Extracted ID from URL:", id)

  const [movie, setMovie] = useState<MovieDetailsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const data = await getMovieDetails(id!)
        if (!data || data.success === false) {
          console.error("API Error:", data) // debuggausta jotta nähdään saadaanko data backendistä
          throw new Error(data.status_message || "Failed to fetch movie details.")
        }
        console.log("Raw API data:", data)
        const transformedData = transformTmdbMovie(data)
        console.log("Transformed movie data:", transformedData)
        setMovie(transformedData)
        console.log("Movie state set to:", transformedData)
      } catch (err) {
        console.error("Error fetching movie details:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovieDetails()
  }, [id])

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
    <Container
      size="lg"
      p={20}
      style={{
        marginLeft: "8rem", // tässä stylellä voi muuttaa koko elokuvatiedon sijaintia sivulla
      }}
    >
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