import {
    Alert,
    Box,
    Button,
    Center,
    Grid,
    Group,
    MultiSelect,
    Pagination,
    RangeSlider,
    Select,
    Skeleton,
    Stack,
    Text,
    Title
} from "@mantine/core";
import {IconAlertCircle, IconMovieOff} from "@tabler/icons-react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useLocation, useSearchParams} from "wouter";
import {MovieCard} from "../components/MovieCard.tsx";

// Interface for a single movie object, ensuring type safety.
interface Movie {
    title: string;
    poster: string;
    year: number;
    genre: string[];
    rating: number;
    duration: number;
    description: string;
    director: string;
}

// Static dataset for demonstration. In a real application, this would not exist.
const allMovies: Movie[] = [
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
    {
        title: "Pulp Fiction",
        poster: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
        year: 1994,
        genre: ["Crime", "Drama"],
        rating: 8.9,
        duration: 154,
        description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        director: "Quentin Tarantino"
    },
    {
        title: "Inception",
        poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
        year: 2010,
        genre: ["Action", "Adventure", "Sci-Fi"],
        rating: 8.8,
        duration: 148,
        description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        director: "Christopher Nolan"
    }
];

// Constants derived from the dataset to populate filter controls.
const ALL_GENRES = [...new Set(allMovies.flatMap(movie => movie.genre))].sort();
const MIN_YEAR = Math.min(...allMovies.map(movie => movie.year));
const MAX_YEAR = Math.max(...allMovies.map(movie => movie.year));

/**
 * Simulates an API call to fetch and filter movies.
 * @returns A promise that resolves to an array of filtered movies.
 */
const fetchMovies = async (
    query: string,
    genres: string[],
    yearRange: [number, number],
    ratingRange: [number, number]
): Promise<Movie[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const lowercasedQuery = query.toLowerCase();
            const filtered = allMovies.filter(movie => {
                const queryMatch =
                    query.trim() === "" ||
                    movie.title.toLowerCase().includes(lowercasedQuery) ||
                    movie.description.toLowerCase().includes(lowercasedQuery);
                const genreMatch =
                    genres.length === 0 ||
                    genres.every(genre => movie.genre.includes(genre));
                const yearMatch = movie.year >= yearRange[0] && movie.year <= yearRange[1];
                const ratingMatch = movie.rating >= ratingRange[0] && movie.rating <= ratingRange[1];
                return queryMatch && genreMatch && yearMatch && ratingMatch;
            });
            resolve(filtered);
        }, 800);
    });
};

const PAGE_SIZE = 8;
const SORT_OPTIONS = [
    {value: "rating-desc", label: "Rating (high to low)"},
    {value: "rating-asc", label: "Rating (low to high)"},
    {value: "year-desc", label: "Year (newest first)"},
    {value: "year-asc", label: "Year (oldest first)"},
    {value: "title-asc", label: "Title (A-Z)"},
    {value: "title-desc", label: "Title (Z-A)"},
];

const SearchView = () => {
    const [, setLocation] = useLocation();
    const [searchParams] = useSearchParams();
    const urlQuery = searchParams.get("q") || "";
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [yearRange, setYearRange] = useState<[number, number]>([MIN_YEAR, MAX_YEAR]);
    const [ratingRange, setRatingRange] = useState<[number, number]>([0, 100]);
    const [sortBy, setSortBy] = useState<string | null>(SORT_OPTIONS[0].value);
    const [activePage, setPage] = useState(1);
    const [tempYearRange, setTempYearRange] = useState<[number, number]>(yearRange);
    const [tempRatingRange, setTempRatingRange] = useState<[number, number]>(ratingRange);
    const [allResults, setAllResults] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setTempYearRange(yearRange);
    }, [yearRange]);

    useEffect(() => {
        setTempRatingRange(ratingRange);
    }, [ratingRange]);

    const performSearch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setPage(1);
        try {
            const decimalRatingRange: [number, number] = [ratingRange[0] / 10, ratingRange[1] / 10];
            const results = await fetchMovies(urlQuery, selectedGenres, yearRange, decimalRatingRange);
            setAllResults(results);
        } catch (err) {
            setError("Failed to fetch movies. Please try again later.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [urlQuery, selectedGenres, yearRange, ratingRange]);

    useEffect(() => {
        void performSearch();
    }, [performSearch]);

    const sortedAndPaginatedResults = useMemo(() => {
        const sorted = [...allResults].sort((a, b) => {
            const [field, direction] = sortBy?.split("-") || ["rating", "desc"];
            const dir = direction === "asc" ? 1 : -1;
            if (field === "title") return a.title.localeCompare(b.title) * dir;
            if (field === "year") return (a.year - b.year) * dir;
            return (a.rating - b.rating) * dir;
        });
        const startIndex = (activePage - 1) * PAGE_SIZE;
        return sorted.slice(startIndex, startIndex + PAGE_SIZE);
    }, [allResults, sortBy, activePage]);

    const handleResetFilters = () => {
        setSelectedGenres([]);
        setYearRange([MIN_YEAR, MAX_YEAR]);
        setRatingRange([0, 100]);
        setSortBy(SORT_OPTIONS[0].value);
        setPage(1);
        setLocation("/search?q=");
    };

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

        if (allResults.length === 0) {
            return (
                <Center h={400}>
                    <Stack align="center">
                        <IconMovieOff size={48} stroke={1.5}/>
                        <Title order={4}>No Movies Found</Title>
                        <Text c="dimmed">Your search for "{urlQuery}" did not return any results.</Text>
                    </Stack>
                </Center>
            );
        }

        return (
            <Stack>
                <Group justify="space-between">
                    <Text fw={500}>Found {allResults.length} movies</Text>
                    <Select
                        w={200}
                        label="Sort by"
                        data={SORT_OPTIONS}
                        value={sortBy}
                        onChange={setSortBy}
                        allowDeselect={false}
                    />
                </Group>
                <Grid>
                    {sortedAndPaginatedResults.map((movie) => (
                        <Grid.Col key={movie.title} span={{base: 12, sm: 6, md: 4, lg: 3}}>
                            <MovieCard {...movie} onDetailsClick={() => console.log(`Details for ${movie.title}`)}/>
                        </Grid.Col>
                    ))}
                </Grid>
                <Center mt="xl">
                    <Pagination
                        total={Math.ceil(allResults.length / PAGE_SIZE)}
                        value={activePage}
                        onChange={setPage}
                    />
                </Center>
            </Stack>
        );
    };

    return (
        <Box p={20}>
            <Title order={1} mb="xl">
                {urlQuery ? `Search results for "${urlQuery}"` : "All movies"}
            </Title>
            <Grid>
                <Grid.Col span={{base: 12, md: 3}}>
                    <Stack>
                        <Group justify="space-between">
                            <Title order={4}>Filters</Title>
                            <Button variant="subtle" size="xs" onClick={handleResetFilters}>Reset</Button>
                        </Group>
                        <MultiSelect
                            label="Genre" placeholder="Select genres" data={ALL_GENRES} value={selectedGenres}
                            onChange={setSelectedGenres} searchable clearable
                        />
                        <Box>
                            <Text size="sm" fw={500}>Year</Text>
                            <RangeSlider
                                value={tempYearRange}
                                onChange={setTempYearRange}
                                onChangeEnd={setYearRange}
                                min={MIN_YEAR}
                                max={MAX_YEAR}
                                step={1}
                                labelAlwaysOn
                            />
                        </Box>
                        <Box>
                            <Text size="sm" fw={500}>Rating</Text>
                            <RangeSlider
                                value={tempRatingRange}
                                onChange={setTempRatingRange}
                                onChangeEnd={setRatingRange}
                                min={0}
                                max={100}
                                step={1}
                                labelAlwaysOn
                                label={value => (value / 10).toFixed(1)}
                            />
                        </Box>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={{base: 12, md: 9}}>
                    {renderResults()}
                </Grid.Col>
            </Grid>
        </Box>
    );
};

export default SearchView;
