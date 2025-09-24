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
import {discoverMovies, getGenres, getPosterUrl, searchMovies, type TmdbGenre, type TmdbMovie,} from "../api/tmdb.ts";
import {MovieCard} from "../components/MovieCard.tsx";

// Constants for UI
const DEFAULT_MIN_YEAR = 1950;
const DEFAULT_MAX_YEAR = new Date().getFullYear();

const PAGE_SIZE = 20; // TMDB default
type SortValue =
    | "vote_average.desc"
    | "vote_average.asc"
    | "primary_release_date.desc"
    | "primary_release_date.asc"
    | "original_title.asc"
    | "original_title.desc";
const SORT_OPTIONS: {value: SortValue; label: string}[] = [
    {value: "vote_average.desc", label: "Rating (high to low)"},
    {value: "vote_average.asc", label: "Rating (low to high)"},
    {value: "primary_release_date.desc", label: "Year (newest first)"},
    {value: "primary_release_date.asc", label: "Year (oldest first)"},
    {value: "original_title.asc", label: "Title (A-Z)"},
    {value: "original_title.desc", label: "Title (Z-A)"},
];

const SearchView = () => {
    const [, setLocation] = useLocation();
    const [searchParams] = useSearchParams();
    const urlQuery = searchParams.get("q") || "";
    const [genres, setGenres] = useState<TmdbGenre[]>([]);
    const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
    const [yearRange, setYearRange] = useState<[number, number]>([DEFAULT_MIN_YEAR, DEFAULT_MAX_YEAR]);
    const [ratingRange, setRatingRange] = useState<[number, number]>([0, 100]); // 0-100 to show slider, converted to 0-10
    const [sortBy, setSortBy] = useState<SortValue | null>(SORT_OPTIONS[0].value);
    const [activePage, setPage] = useState(1);
    const [tempYearRange, setTempYearRange] = useState<[number, number]>([DEFAULT_MIN_YEAR, DEFAULT_MAX_YEAR]);
    const [tempRatingRange, setTempRatingRange] = useState<[number, number]>([0, 100]);
    const [results, setResults] = useState<TmdbMovie[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setTempYearRange(yearRange);
    }, [yearRange]);

    useEffect(() => {
        setTempRatingRange(ratingRange);
    }, [ratingRange]);

    // Load TMDB genres on mount
    useEffect(() => {
        (async () => {
            try {
                const g = await getGenres();
                setGenres(g);
            } catch (e) {
                console.error(e);
            }
        })();
    }, []);

    const performSearch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const ratingGte = (ratingRange[0] / 10).toFixed(1);
            const ratingLte = (ratingRange[1] / 10).toFixed(1);
            const yearGte = `${yearRange[0]}-01-01`;
            const yearLte = `${yearRange[1]}-12-31`;

            if (urlQuery.trim()) {
                const data = await searchMovies({query: urlQuery.trim(), page: activePage});
                setResults(data.results);
                setTotalPages(data.total_pages);
            } else {
                const data = await discoverMovies({
                    page: activePage,
                    with_genres: selectedGenreIds,
                    "primary_release_date.gte": yearGte,
                    "primary_release_date.lte": yearLte,
                    "vote_average.gte": Number(ratingGte),
                    "vote_average.lte": Number(ratingLte),
                    sort_by: (sortBy ?? "vote_average.desc"),
                });
                setResults(data.results);
                setTotalPages(data.total_pages);
            }
        } catch (err) {
            setError("Failed to fetch movies. Please try again later.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [urlQuery, activePage, selectedGenreIds, yearRange, ratingRange, sortBy]);

    useEffect(() => {
        void performSearch();
    }, [performSearch]);

    const mappedResults = useMemo(() => {
        return results.map((m) => ({
            id: m.id,
            title: m.title,
            poster: getPosterUrl(m.poster_path, "w342"),
            year: m.release_date ? Number(m.release_date.slice(0, 4)) : 0,
            genre: m.genre_ids?.map((gid) => genres.find((g) => g.id === gid)?.name || "Unknown") || [],
            rating: m.vote_average,
            description: m.overview,
        }));
    }, [results, genres]);

    const handleResetFilters = () => {
        setSelectedGenreIds([]);
        setYearRange([DEFAULT_MIN_YEAR, DEFAULT_MAX_YEAR]);
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

        if (mappedResults.length === 0) {
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
                    <Text fw={500}>Page {activePage} of {Math.max(totalPages, 1)}</Text>
                    <Select
                        w={200}
                        label="Sort by"
                        data={SORT_OPTIONS}
                        value={sortBy}
                        onChange={(v) => {
                            setSortBy(v as SortValue | null);
                            setPage(1);
                        }}
                        allowDeselect={false}
                    />
                </Group>
                <Grid>
                    {mappedResults.map((movie) => (
                        <Grid.Col key={movie.id} span={{base: 12, sm: 6, md: 4, lg: 3}}>
                            <MovieCard
                                title={movie.title}
                                poster={movie.poster}
                                year={movie.year}
                                genre={movie.genre}
                                rating={movie.rating}
                                description={movie.description}
                                onDetailsClick={() => console.log(`Details for ${movie.title}`)}
                            />
                        </Grid.Col>
                    ))}
                </Grid>
                <Center mt="xl">
                    <Pagination
                        total={Math.min(totalPages, 500)}
                        value={activePage}
                        onChange={(p) => {
                            setPage(p);
                            // Keep filters but update URL query for search text stability
                            if (urlQuery) setLocation(`/search?q=${encodeURIComponent(urlQuery)}`);
                        }}
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
                            label="Genre"
                            placeholder="Select genres"
                            data={genres.map((g) => ({value: String(g.id), label: g.name}))}
                            value={selectedGenreIds.map(String)}
                            onChange={(vals) => {
                                setSelectedGenreIds(vals.map((v) => Number(v)));
                                setPage(1);
                            }}
                            searchable
                            clearable
                        />
                        <Box>
                            <Text size="sm" fw={500}>Year</Text>
                            <RangeSlider
                                value={tempYearRange}
                                onChange={setTempYearRange}
                                onChangeEnd={(v) => {
                                    setYearRange(v);
                                    setPage(1);
                                }}
                                min={DEFAULT_MIN_YEAR}
                                max={DEFAULT_MAX_YEAR}
                                step={1}
                                labelAlwaysOn
                            />
                        </Box>
                        <Box>
                            <Text size="sm" fw={500}>Rating</Text>
                            <RangeSlider
                                value={tempRatingRange}
                                onChange={setTempRatingRange}
                                onChangeEnd={(v) => {
                                    setRatingRange(v);
                                    setPage(1);
                                }}
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
