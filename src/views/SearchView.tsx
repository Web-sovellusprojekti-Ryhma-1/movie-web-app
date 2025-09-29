import {
    Alert,
    Box,
    Center,
    Grid,
    Skeleton,
    Stack,
    Text,
    Title,
    RangeSlider,
    MultiSelect
} from "@mantine/core";
import {IconAlertCircle, IconMovieOff} from "@tabler/icons-react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useSearchParams, useLocation} from "wouter";
import {searchMovies, getGenres} from "../api/tmdb.ts";
import {MovieCard} from "../components/MovieCard.tsx";
import type {TmdbGenre, TmdbMovie} from "../api/tmdb";
// SearchViewiin lisäsin genre filtterin samalla kun piti muokata hieman api hommien takia koska korjasin linkityksen backendiin.
const PAGE_SIZE = 20; // TMDB default

const SearchView = () => {
    const [searchParams] = useSearchParams();
    const urlQuery = searchParams.get("q") || "";
    const [genres, setGenres] = useState<TmdbGenre[]>([]);
    const [results, setResults] = useState<TmdbMovie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [, setLocation] = useLocation();

    // Filter states
    const [rating, setRating] = useState<[number, number]>([0, 10]);
    const [year, setYear] = useState<[number, number]>([1900, new Date().getFullYear()]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    // Load genres from backend with debugging and error handling
    useEffect(() => {
        (async () => {
            try {
                const g = await getGenres();
                if (!g || g.length === 0) {
                    console.warn("No genres fetched from backend.");
                } else {
                    console.log("Fetched genres:", g);
                }
                setGenres(g || []); // Ensure genres is always an array
            } catch (e) {
                console.error("Failed to fetch genres:", e);
                setGenres([]); // Fallback to an empty array
            }
        })();
    }, []);

    const performSearch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await searchMovies({query: urlQuery.trim()});
            setResults(data.results);
        } catch (err) {
            setError("Failed to fetch movies. Please try again later.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [urlQuery]);

    useEffect(() => {
        void performSearch();
    }, [performSearch]);

    // Debugging: Log genres and movie.genre_ids
    useEffect(() => {
        console.log("Genres array:", genres);
    }, [genres]);

    // Log the rating state whenever it changes
    useEffect(() => {
        console.log("Rating state updated:", rating);
    }, [rating]);

    const filteredResults = useMemo(() => {
        if (!Array.isArray(genres) || genres.length === 0) {
            return results; // If genres are not loaded, return all results
        }

        return results.filter((movie) => {
            const movieYear = movie.release_date ? Number(movie.release_date.slice(0, 4)) : 0;
            const movieGenres = movie.genre_ids?.map((gid) => {
                const genre = genres.find((g) => g.id === gid);
                console.log(`Mapping genre ID ${gid} to name:`, genre?.name); // Debugging
                return genre?.name || "Unknown";
            }) || [];

            const matchesRating = movie.vote_average >= rating[0] && movie.vote_average <= rating[1];
            const matchesYear = movieYear >= year[0] && movieYear <= year[1];
            const matchesGenres = movieGenres.length > 0; // Ensure genres are considered

            return matchesRating && matchesYear && matchesGenres;
        });
    }, [results, rating, year, genres]);

    const renderResults = () => {
        if (isLoading) {
            return (
                <Grid>
                    {Array.from({length: PAGE_SIZE}).map((_, index) => (
                        <Grid.Col key={index} span={{base: 12, sm: 6, md: 4, lg: 3}}>
                            <Stack>
                                <Skeleton height={200}/>
                                <Skeleton height={20}/>
                                <Skeleton height={16} width="70%"/>
                            </Stack>
                        </Grid.Col>
                    ))}
                </Grid>
            );
        }

        if (error) {
            return <Alert
                icon={<IconAlertCircle size="1rem"/>} title="Error" color="red" variant="light"
            >{error}</Alert>;
        }

        if (filteredResults.length === 0) {
            return <Center>
                <IconMovieOff size="3rem"/>
                <Text>No movies found</Text>
            </Center>;
        }

        return (
            <Grid>
                {filteredResults.map((movie) => (
                    <Grid.Col key={movie.id} span={{base: 12, sm: 6, md: 4, lg: 3}}>
                        <MovieCard
                            title={movie.title}
                            poster={movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : "https://placehold.co/342x500?text=No+Image"}
                            year={movie.release_date ? Number(movie.release_date.slice(0, 4)) : 0}
                            genre={movie.genre_ids?.map((gid) => (genres || []).find((g) => g.id === gid)?.name || "Unknown") || []}
                            rating={movie.vote_average}
                            description={movie.overview}
                            onDetailsClick={() => setLocation(`/movie/${movie.id}`)}
                        />
                    </Grid.Col>
                ))}
            </Grid>
        );
    };

    return (
        <Box style={{ display: "flex" }}>
            {/* Sidebar for filters */}
            <Box style={{ width: "20%", paddingRight: "1rem" }}>
                <Title order={4}>Filters</Title>
                <Box mb="lg">
                    <RangeSlider
                        labelAlwaysOn
                        value={rating}
                        onChange={(value) => {
                            console.log("Rating slider value changed:", value); // Debugging
                            setRating(value);
                            console.log("Updated rating state:", rating); // Verify state update
                        }}
                        min={0}
                        max={10}
                        step={0.1}
                        label={(value) => `Rating: ${value}`}
                        style={{ marginBottom: "3rem", marginLeft: "1rem", marginRight: "1rem" }} // Add spacing below the slider
                    />
                    <RangeSlider
                        labelAlwaysOn
                        value={year}
                        onChange={(value) => setYear(value)}
                        min={1900}
                        max={new Date().getFullYear()}
                        step={1}
                        label={(value) => `Year: ${value}`}
                        style={{ marginBottom: "3rem", marginLeft: "1rem", marginRight: "1rem" }} // Add spacing below the slider
                    />
                    <MultiSelect
                        data={(genres || []).map((g) => ({ value: g.name, label: g.name }))}
                        value={selectedGenres}
                        onChange={setSelectedGenres}
                        placeholder="Select genres"
                        label="Genres"
                    />
                </Box>
            </Box>

            {/* Main content area */}
            <Box style={{ width: "80%" }}>
                <Title>Search Movies</Title>
                {renderResults()}
            </Box>
        </Box>
    );
};

export default SearchView;
