import {Alert, Badge, Box, Button, Card, Group, Loader, Select, SimpleGrid, Stack, Text, Title,} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import {IconClock, IconMapPin, IconMovie} from "@tabler/icons-react";
import dayjs from "dayjs";
import {useEffect, useMemo, useState} from "react";
import {useLocation} from "wouter";
import {
    fetchFinnkinoMatch,
    fetchShowtimes,
    fetchTheatreAreas,
    type FinnkinoMatchPayload,
    type FinnkinoMatchResponse,
    type FinnkinoTheatreAreasResponse,
} from "../api/finnkinoapi";
import type {TmdbMovie} from "../api/tmdb";
import {getPosterUrl, searchMovieByTitle} from "../api/tmdb";
import {type FinnkinoShowtime, formatFinnkinoDuration, normalizeFinnkinoShowtimes,} from "../helpers/finnkinoHelpers";

type MatchStatus = "loading" | "success" | "empty" | "error";

interface MatchInfo {
    status: MatchStatus;
    tmdbId?: number;
    title?: string;
    overview?: string;
    releaseDate?: string;
    rating?: number;
    posterPath?: string | null;
    genres?: string[];
    message?: string;
}

interface UserFeedback {
    type: "success" | "error";
    message: string;
}

const getMatchKey = (show: FinnkinoShowtime) =>
    String(show.eventId ?? show.showId ?? show.id);

const normalizeMatchPayload = (payload?: FinnkinoMatchPayload | null) => {
    if (!payload) {
        return null;
    }

    const tmdbIdRaw = payload.tmdbId ?? payload.tmdb_id;
    const tmdbId = typeof tmdbIdRaw === "number" ? tmdbIdRaw : Number(tmdbIdRaw);
    const posterPathCandidate =
        typeof payload.poster_path === "string"
            ? payload.poster_path
            : typeof payload.posterPath === "string"
                ? payload.posterPath
                : null;

    const genres = Array.isArray(payload.genres)
        ? payload.genres
            .map((genre) => (typeof genre === "string" ? genre : genre?.name))
            .filter((genre): genre is string => Boolean(genre))
        : undefined;

    const ratingCandidate = payload.vote_average ?? payload.voteAverage;
    const rating = typeof ratingCandidate === "number" ? ratingCandidate : Number(ratingCandidate);

    return {
        tmdbId: Number.isFinite(tmdbId) ? tmdbId : undefined,
        title:
            (typeof payload.title === "string" && payload.title) ||
            (typeof payload.originalTitle === "string" && payload.originalTitle) ||
            (typeof payload.original_title === "string" && payload.original_title) ||
            undefined,
        overview: typeof payload.overview === "string" ? payload.overview : undefined,
        releaseDate:
            (typeof payload.release_date === "string" && payload.release_date) ||
            (typeof payload.releaseDate === "string" && payload.releaseDate) ||
            undefined,
        rating: Number.isFinite(rating) ? rating : undefined,
        posterPath: posterPathCandidate,
        genres,
    } satisfies Omit<MatchInfo, "status">;
};

const TheatreAreas = () => {
    const [areas, setAreas] = useState<Array<{value: string; label: string}>>([]);
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(dayjs().format("YYYY-MM-DD"));
    const [showtimes, setShowtimes] = useState<FinnkinoShowtime[]>([]);
    const [showtimesLoading, setShowtimesLoading] = useState(false);
    const [showtimesError, setShowtimesError] = useState<string | null>(null);
    const [matchMap, setMatchMap] = useState<Record<string, MatchInfo>>({});
    const [detailsLoadingKey, setDetailsLoadingKey] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<UserFeedback | null>(null);
    const [, navigate] = useLocation();

    useEffect(() => {
        let isMounted = true;

        const loadAreas = async () => {
            try {
                const response = await fetchTheatreAreas<FinnkinoTheatreAreasResponse>();
                if (!isMounted) {
                    return;
                }

                const options =
                    response?.TheatreAreas?.TheatreArea?.map((area) => ({
                        value: String(area.ID),
                        label: area.Name,
                    })) ?? [];

                setAreas(options);
                setSelectedArea((current) => current ?? options[0]?.value ?? null);
            } catch (error) {
                console.error("Failed to load Finnkino theatre areas:", error);
                if (isMounted) {
                    setFeedback({
                        type: "error",
                        message: "Finnkino theatre areas are currently unavailable.",
                    });
                }
            }
        };

        void loadAreas();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!selectedArea || !selectedDate) {
            setShowtimes([]);
            return;
        }

        let isMounted = true;
        setShowtimesLoading(true);
        setShowtimesError(null);
        setFeedback(null);

        const loadShowtimes = async () => {
            try {
                const response = await fetchShowtimes(selectedArea, selectedDate);
                if (!isMounted) {
                    return;
                }
                const normalized = normalizeFinnkinoShowtimes(response);
                setShowtimes(normalized);
                if (!normalized.length) {
                    setFeedback({
                        type: "error",
                        message: "No showtimes were found for the selected theatre and date.",
                    });
                }
            } catch (error) {
                console.error("Failed to load Finnkino showtimes:", error);
                if (isMounted) {
                    setShowtimes([]);
                    setShowtimesError("Unable to load showtimes right now.");
                }
            } finally {
                if (isMounted) {
                    setShowtimesLoading(false);
                }
            }
        };

        void loadShowtimes();

        return () => {
            isMounted = false;
        };
    }, [selectedArea, selectedDate]);

    useEffect(() => {
        // Reset cached matches when showtimes list changes drastically (e.g., new theatre/date)
        setMatchMap((prev) => {
            const validKeys = new Set(
                showtimes
                    .map((show) => getMatchKey(show))
                    .filter((key): key is string => Boolean(key)),
            );

            const next: Record<string, MatchInfo> = {};
            validKeys.forEach((key) => {
                const cached = prev[key];
                if (cached?.status === "success") {
                    next[key] = cached;
                }
            });

            return next;
        });
    }, [showtimes]);

    const sortedShowtimes = useMemo(
        () =>
            [...showtimes].sort((a, b) => a.start.getTime() - b.start.getTime()),
        [showtimes],
    );

    const handleViewDetails = async (show: FinnkinoShowtime) => {
        const key = getMatchKey(show);
        const cached = matchMap[key];

        if (cached?.status === "success" && cached.tmdbId) {
            navigate(`/movie/${cached.tmdbId}`);
            return;
        }

        if (cached?.status === "loading") {
            return;
        }

        setDetailsLoadingKey(key);
        setFeedback(null);

        try {
            let matchResult: MatchInfo | undefined = cached;

            const shouldFetchMatch =
                !matchResult || matchResult.status === "error" || matchResult.status === "empty";

            if (shouldFetchMatch) {
                setMatchMap((prev) => ({
                    ...prev,
                    [key]: {status: "loading"},
                }));

                const response = await fetchFinnkinoMatch<FinnkinoMatchResponse>(key);

                const bestCandidate =
                    normalizeMatchPayload(response.match) ??
                    normalizeMatchPayload(response.candidates?.[0]);

                if (bestCandidate) {
                    matchResult = {
                        status: "success",
                        ...bestCandidate,
                    } satisfies MatchInfo;
                } else {
                    matchResult = {
                        status: "empty",
                        message: "No TMDB match was found yet.",
                    } satisfies MatchInfo;
                }

                setMatchMap((prev) => ({
                    ...prev,
                    [key]: matchResult as MatchInfo,
                }));
            }

            if (matchResult?.status === "success" && matchResult.tmdbId) {
                navigate(`/movie/${matchResult.tmdbId}`);
                return;
            }

            const searchResult = await searchMovieByTitle(show.title);
            const first = searchResult?.results?.[0] as TmdbMovie | undefined;
            if (first) {
                const fallbackMatch: MatchInfo = {
                    status: "success",
                    tmdbId: first.id,
                    title: first.title,
                    overview: first.overview,
                    releaseDate: first.release_date,
                    rating: first.vote_average,
                    posterPath: first.poster_path,
                };

                setMatchMap((prev) => ({
                    ...prev,
                    [key]: fallbackMatch,
                }));

                navigate(`/movie/${first.id}`);
                return;
            }

            setMatchMap((prev) => ({
                ...prev,
                [key]: {
                    status: "empty",
                    message: "No TMDB match found.",
                },
            }));

            setFeedback({
                type: "error",
                message: "We couldn't find TMDB details for this showtime yet.",
            });
        } catch (error) {
            console.error("Failed to open movie details from showtime:", error);
            setMatchMap((prev) => ({
                ...prev,
                [key]: {
                    status: "error",
                    message: "Matching service is temporarily unavailable.",
                },
            }));
            setFeedback({
                type: "error",
                message: "Opening movie details failed. Please try again shortly.",
            });
        } finally {
            setDetailsLoadingKey(null);
        }
    };

    return (
        <Box mt="xl">
            <Stack gap="md">
                <Box>
                    <Title order={2}>In theatres near you</Title>
                    <Text c="dimmed" size="sm">
                        Browse Finnkino showtimes and jump straight into TMDB-powered details.
                    </Text>
                </Box>

                {feedback && (
                    <Alert
                        color={feedback.type === "error" ? "red" : "green"}
                        variant="light"
                        title={feedback.type === "error" ? "Heads up" : "Success"}
                        onClose={() => setFeedback(null)}
                        withCloseButton
                    >
                        {feedback.message}
                    </Alert>
                )}

                <Group align="flex-end" gap="md" wrap="wrap">
                    <DatePickerInput
                        label="Date"
                        placeholder="Pick date"
                        value={selectedDate ? dayjs(selectedDate).toDate() : null}
                        onChange={(value: Date | string | null) => {
                            if (value instanceof Date && !Number.isNaN(value.getTime())) {
                                setSelectedDate(dayjs(value).format("YYYY-MM-DD"));
                                return;
                            }
                            if (typeof value === "string" && value.length > 0) {
                                const parsed = dayjs(value);
                                setSelectedDate(parsed.isValid() ? parsed.format("YYYY-MM-DD") : null);
                                return;
                            }
                            setSelectedDate(null);
                        }}
                        valueFormat="DD.MM.YYYY"
                        minDate={dayjs().startOf("day").toDate()}
                        maxDate={dayjs().add(30, "day").toDate()}
                        clearable
                    />
                    <Select
                        label="Finnkino theatre"
                        placeholder={areas.length ? "Select theatre" : "Loading theatres..."}
                        data={areas}
                        value={selectedArea}
                        onChange={setSelectedArea}
                        searchable
                        nothingFoundMessage="No theatres"
                        style={{minWidth: 260}}
                        disabled={!areas.length}
                    />
                </Group>

                <Box>
                    {showtimesLoading ? (
                        <Group gap="sm" align="center">
                            <Loader size="sm"/>
                            <Text size="sm" c="dimmed">
                                Fetching the latest showtimes…
                            </Text>
                        </Group>
                    ) : showtimesError ? (
                        <Alert color="red" variant="light" title="Finnkino unavailable">
                            {showtimesError}
                        </Alert>
                    ) : sortedShowtimes.length === 0 ? (
                        <Alert color="yellow" variant="light" title="No showtimes">
                            Choose another theatre or date to discover more screenings.
                        </Alert>
                    ) : (
                        <SimpleGrid cols={{base: 1, sm: 2, lg: 3}} spacing="lg">
                            {sortedShowtimes.map((show) => {
                                const key = getMatchKey(show);
                                const match = matchMap[key];

                                const fallbackPoster =
                                    show.imagePortrait ?? show.imageLandscape ?? "https://placehold.co/342x500?text=No+Image";
                                const posterUrl =
                                    match?.status === "success" && match.posterPath
                                        ? getPosterUrl(match.posterPath, "w342")
                                        : fallbackPoster;
                                const ratingLabel =
                                    match?.status === "success" && typeof match.rating === "number" && Number.isFinite(match.rating)
                                        ? `${match.rating.toFixed(1)} / 10`
                                        : undefined;
                                const genresLabel =
                                    match?.status === "success" && match.genres?.length
                                        ? match.genres.slice(0, 3).join(", ")
                                        : undefined;
                                const durationLabel = formatFinnkinoDuration(show.lengthInMinutes);
                                const isMatchLoading = match?.status === "loading";

                                return (
                                    <Card key={key} withBorder shadow="sm" radius="md" padding="md">
                                        <Stack gap="sm">
                                            <Group gap="sm" align="flex-start" wrap="nowrap">
                                                <Box style={{width: 100, flexShrink: 0}}>
                                                    <img
                                                        src={posterUrl}
                                                        alt={match?.title ?? show.title}
                                                        style={{
                                                            width: "100%",
                                                            borderRadius: "var(--mantine-radius-sm)",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                </Box>
                                                <Stack gap={4} style={{flexGrow: 1}}>
                                                    <Group justify="space-between" align="flex-start" gap="xs">
                                                        <Stack gap={2}>
                                                            <Text fw={600}>{match?.title ?? show.title}</Text>
                                                            <Text size="sm" c="dimmed">
                                                                {dayjs(show.start).format("dddd, DD.MM.YYYY HH:mm")}
                                                            </Text>
                                                        </Stack>
                                                        <Badge
                                                            variant="light" color="blue"
                                                            leftSection={<IconMovie size={14}/>}
                                                        >
                                                            Finnkino
                                                        </Badge>
                                                    </Group>

                                                    <Group gap="xs" align="center">
                                                        <IconMapPin size={16} color="var(--mantine-color-dimmed)"/>
                                                        <Text size="sm">
                                                            {show.theatre}
                                                            {show.auditorium ? ` • ${show.auditorium}` : ""}
                                                        </Text>
                                                    </Group>

                                                    <Group gap="xs" align="center">
                                                        <IconClock size={16} color="var(--mantine-color-dimmed)"/>
                                                        <Text size="sm">
                                                            {dayjs(show.start).format("HH:mm")}
                                                            {durationLabel ? ` • ${durationLabel}` : ""}
                                                        </Text>
                                                    </Group>

                                                    <Group gap="xs" wrap="wrap">
                                                        {show.presentationMethod && (
                                                            <Badge variant="light" size="sm">
                                                                {show.presentationMethod}
                                                            </Badge>
                                                        )}
                                                        {show.rating && (
                                                            <Badge variant="light" size="sm" color="grape">
                                                                {show.rating}
                                                            </Badge>
                                                        )}
                                                        {ratingLabel && (
                                                            <Badge variant="light" size="sm" color="yellow">
                                                                {ratingLabel}
                                                            </Badge>
                                                        )}
                                                    </Group>

                                                    {genresLabel && (
                                                        <Text size="sm" c="dimmed">
                                                            {genresLabel}
                                                        </Text>
                                                    )}

                                                    {match?.status === "success" && match.overview && (
                                                        <Text size="sm" c="dimmed" lineClamp={3}>
                                                            {match.overview}
                                                        </Text>
                                                    )}

                                                    {isMatchLoading ? (
                                                        <Group gap={6} align="center">
                                                            <Loader size="xs"/>
                                                            <Text size="xs" c="dimmed">
                                                                Matching with TMDB…
                                                            </Text>
                                                        </Group>
                                                    ) : match?.status === "error" ? (
                                                        <Text size="xs" c="red">
                                                            {match.message ?? "Matching unavailable."}
                                                        </Text>
                                                    ) : match?.status === "empty" ? (
                                                        <Text size="xs" c="dimmed">
                                                            We&apos;ll keep looking for a TMDB match.
                                                        </Text>
                                                    ) : null}

                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        onClick={() => void handleViewDetails(show)}
                                                        loading={detailsLoadingKey === key}
                                                    >
                                                        View movie details
                                                    </Button>
                                                </Stack>
                                            </Group>
                                        </Stack>
                                    </Card>
                                );
                            })}
                        </SimpleGrid>
                    )}
                </Box>
            </Stack>
        </Box>
    );
};

export default TheatreAreas;
