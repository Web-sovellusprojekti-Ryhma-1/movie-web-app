import {
    Alert,
    Badge,
    Box,
    Button,
    Group,
    Image,
    Loader,
    Modal,
    Rating,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import {IconClock, IconMapPin} from "@tabler/icons-react";
import dayjs from "dayjs";
import React, {useEffect, useMemo, useState} from "react";
import {fetchShowtimes, fetchTheatreAreas, type FinnkinoTheatreAreasResponse,} from "../api/finnkinoapi";
import {
    type FinnkinoShowtime,
    formatFinnkinoDuration,
    normalizeFinnkinoShowtimes,
    normalizeTitleForComparison,
} from "../helpers/finnkinoHelpers";
import type {MovieDetails as MovieDetailsType} from "../helpers/movieHelpers";

interface MovieDetailsProps {
    movie: MovieDetailsType
    onClose: () => void
    addToFavorites: (movie: MovieDetailsType) => void
}

const MovieDetails: React.FC<MovieDetailsProps> = ({movie, onClose, addToFavorites}) => {
    const [reviews, setReviews] = useState([
        {title: "Sample review 1", text: "This is a great movie!", rating: 4},
        {title: "Sample review 2", text: "Not bad, could be better.", rating: 3},
        {title: "Sample review 3", text: "I didn't like it that much.", rating: 2}
    ]) // arvostelut
    const [isModalOpen, setIsModalOpen] = useState(false) // modaalin näkyvyys jotta voidaan triggeröidä napista
    const [newReview, setNewReview] = useState("") // uusi arvostelu
    const [newReviewTitle, setNewReviewTitle] = useState("") // arvostelun otsikko
    const [newRating, setNewRating] = useState<number>(0) // arvostelun arvosanan parametri
    const [selectedDate, setSelectedDate] = useState<string | null>(dayjs().format("YYYY-MM-DD"))
    const [theatreAreas, setTheatreAreas] = useState<Array<{value: string; label: string}>>([])
    const [selectedTheatreArea, setSelectedTheatreArea] = useState<string | null>(null)
    const [showtimes, setShowtimes] = useState<FinnkinoShowtime[]>([])
    const [showtimesLoading, setShowtimesLoading] = useState(false)
    const [showtimesError, setShowtimesError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const loadAreas = async () => {
            try {
                const response = await fetchTheatreAreas<FinnkinoTheatreAreasResponse>()
                if (!isMounted) {
                    return
                }

                const options = response?.TheatreAreas?.TheatreArea?.map((area) => ({
                    value: String(area.ID),
                    label: area.Name,
                })) ?? []

                setTheatreAreas(options)
                setSelectedTheatreArea((current) => current ?? options[0]?.value ?? null)
            } catch (error) {
                console.error("Failed to load theatre areas:", error)
            }
        }

        void loadAreas()

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        if (!selectedTheatreArea || !selectedDate) {
            setShowtimes([])
            return
        }

        let isMounted = true
        setShowtimesLoading(true)
        setShowtimesError(null)

        const loadShowtimes = async () => {
            try {
                const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD")
                const response = await fetchShowtimes(selectedTheatreArea, formattedDate)
                if (!isMounted) {
                    return
                }
                setShowtimes(normalizeFinnkinoShowtimes(response))
            } catch (error) {
                if (!isMounted) {
                    return
                }
                console.error("Failed to load showtimes:", error)
                setShowtimes([])
                setShowtimesError("Unable to load showtimes right now. Please try another theatre or date.")
            } finally {
                if (isMounted) {
                    setShowtimesLoading(false)
                }
            }
        }

        void loadShowtimes()

        return () => {
            isMounted = false
        }
    }, [selectedTheatreArea, selectedDate])

    const movieTitleNormalized = useMemo(
        () => normalizeTitleForComparison(movie.title),
        [movie.title],
    )

    const movieOriginalTitleNormalized = useMemo(
        () => normalizeTitleForComparison(movie.originalTitle),
        [movie.originalTitle],
    )

    const movieReleaseYear = useMemo(() => {
        if (!movie.releaseDate) {
            return undefined
        }

        const year = Number(movie.releaseDate.slice(0, 4))
        return Number.isFinite(year) ? year : undefined
    }, [movie.releaseDate])

    const filteredShowtimes = useMemo(() => {
        if (!showtimes.length) {
            return []
        }

        const titleTargets = [movieTitleNormalized, movieOriginalTitleNormalized].filter(
            (value) => value && value.length > 0,
        ) as string[]

        if (!titleTargets.length) {
            return []
        }

        const matches = showtimes.filter((show) => {
            const candidates = [
                normalizeTitleForComparison(show.title),
                normalizeTitleForComparison(show.originalTitle),
            ].filter((value) => value && value.length > 0) as string[]

            if (!candidates.length) {
                return false
            }

            const hasExactMatch = candidates.some((candidate) =>
                titleTargets.includes(candidate),
            )

            const hasPartialMatch = candidates.some((candidate) =>
                titleTargets.some((target) => target.length > 3 && candidate.includes(target)),
            )

            if (!hasExactMatch && !hasPartialMatch) {
                return false
            }

            if (!movieReleaseYear) {
                return true
            }

            if (
                typeof show.productionYear === "number" &&
                Math.abs(show.productionYear - movieReleaseYear) > 1
            ) {
                return false
            }

            return true
        })

        return matches.sort((a, b) => a.start.getTime() - b.start.getTime())
    }, [showtimes, movieTitleNormalized, movieOriginalTitleNormalized, movieReleaseYear])
    // riviewille funktio parametrit
    const addReview = () => {
        if (newReview.trim() && newReviewTitle.trim()) {
            setReviews([
                ...reviews,
                {title: newReviewTitle, text: newReview, rating: newRating}
            ]) // uuen arvostelun lisäämisen kentät:
            setNewReview("")
            setNewReviewTitle("")
            setNewRating(0)
            setIsModalOpen(false)
        }
    }

    return (
        <Box>
            <Button onClick={onClose} mb="md">
                Go Back
            </Button>
            <Box
                style={{ // periaatteessa sen koko elokuva info osion sijainti sivulla
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: "2rem",
                    marginRight: "5px",
                    width: "150%",
                    maxWidth: "125%",
                }}
            >
                {/* kuva toki koko skaalautuu aiemman boxin mukaan joten width on hieman turha */}
                {movie.posterUrl && (
                    <Box style={{flexShrink: 0}}>
                        <Image
                            src={movie.posterUrl}
                            alt={movie.title}
                            width={150}
                        />
                    </Box>
                )}

                {/* elokuvien tiedot ja niiden stylet */}
                <Box style={{flex: 1, maxWidth: "80%", lineHeight: "1.8"}}>
                    <Title style={{fontSize: "2rem"}}>{movie.title}</Title>
                    {movie.originalTitle && movie.originalTitle !== movie.title && (
                        <Text size="sm" c="dimmed" mb="xs">
                            Original title: {movie.originalTitle}
                        </Text>
                    )}
                    <Group>
                        {movie.genres.map((genre, index) => (
                            <Badge key={index}>{genre}</Badge>
                        ))}
                    </Group>
                    <Text>{movie.overview}</Text>
                    <Text>
                        <strong>Duration:</strong> {movie.duration || "N/A"}
                    </Text>
                    <Text>
                        <strong>Director:</strong> {movie.director || "N/A"}
                    </Text>
                    <Text>
                        <strong>Release Date:</strong> {movie.releaseDate}
                    </Text>
                    <Text style={{marginBottom: "1.5rem"}}>
                        <strong>IMDB Rating:</strong> {movie.rating ? movie.rating.toFixed(1) : "N/A"} / 10
                    </Text>
                    <Title order={3}>Top Cast</Title>
                    <ul>
                        {movie.cast.slice(0, 5).map((actor, index) => (
                            <li key={index}>
                                {actor.name} as <em>{actor.character}</em>
                            </li>
                        ))}
                    </ul>
                </Box>
            </Box>
            {/* Add to Favorites napin positio sivulla */}
            <Button
                onClick={() => addToFavorites(movie)}
                style={{
                    position: "fixed",
                    top: "6.58rem",
                    right: "1rem",
                    zIndex: 1,
                }}
            >
                Add to Favorites
            </Button>
            {/* movie app arvostelu kenttä */}
            <Box>
                <Title order={3} style={{marginTop: "2rem"}}>Movie App User Reviews</Title>
                <Box
                    style={{display: "flex", overflowX: "auto", gap: "1rem", padding: "1rem", whiteSpace: "nowrap"}}
                > {/* vieritys palkki jotta voi scrollailla arvosteluja */}
                    {reviews.map((review, index) => (
                        <Box
                            key={index} style={{
                            display: "inline-block",
                            minWidth: "300px",
                            border: "1px solid #ccc",
                            padding: "1rem",
                            wordWrap: "break-word",
                            whiteSpace: "normal"
                        }}
                        >
                            <div>
                                <strong>{review.title}</strong>
                                <Rating
                                    value={review.rating} readOnly
                                /> {/* read onlyksi tähdet niin niitä ei voi muuttaa itse sivulla */}
                            </div>
                            {review.text}
                        </Box>
                    ))}
                </Box>
                <Button style={{marginTop: "1rem"}} onClick={() => setIsModalOpen(true)}>Add
                    Review</Button> {/* modaalin triggeröivä nappi */}

                <Modal
                    opened={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add a Review"
                > {/* Modaali eli popup ikkuna arvostelun luontiin */}
                    <TextInput
                        label="Title"
                        value={newReviewTitle}
                        onChange={(event) => setNewReviewTitle(event.currentTarget.value)}
                        size="sm"
                    />
                    <Textarea
                        label="Review"
                        value={newReview}
                        onChange={(event) => setNewReview(event.currentTarget.value)}
                        autosize
                        minRows={4}
                    />
                    <Rating
                        value={newRating}
                        onChange={setNewRating}
                    />
                    <Group mt="md">
                        <Button variant="default" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={addReview}>Post Review</Button>
                    </Group>
                </Modal>
            </Box>

            <Title order={3} style={{marginTop: "2rem"}}>Showtimes</Title>
            <Box style={{marginTop: "1rem"}}>
                <Group align="flex-end" gap="md" wrap="wrap">
                    <DatePickerInput
                        placeholder="Pick a date"
                        label="Select Date"
                        value={selectedDate ? dayjs(selectedDate).toDate() : null}
                        onChange={(value: Date | string | null) => {
                            if (value instanceof Date && !Number.isNaN(value.getTime())) {
                                setSelectedDate(dayjs(value).format("YYYY-MM-DD"))
                                return
                            }

                            if (typeof value === "string" && value.length > 0) {
                                const parsed = dayjs(value)
                                setSelectedDate(parsed.isValid() ? parsed.format("YYYY-MM-DD") : null)
                                return
                            }

                            setSelectedDate(null)
                        }}
                        valueFormat="DD.MM.YYYY"
                        minDate={dayjs().startOf("day").toDate()}
                        clearable
                    />
                    <Select
                        label="Select Theatre Area"
                        placeholder={
                            theatreAreas.length ? "Select theatre area" : "Loading theatre areas..."
                        }
                        data={theatreAreas}
                        value={selectedTheatreArea}
                        onChange={setSelectedTheatreArea}
                        searchable
                        nothingFoundMessage="No theatres"
                        style={{minWidth: 260}}
                        disabled={!theatreAreas.length}
                    />
                </Group>

                <Box style={{marginTop: "1rem"}}>
                    {showtimesLoading ? (
                        <Group gap="sm" align="center">
                            <Loader size="sm"/>
                            <Text size="sm" c="dimmed">Loading showtimes…</Text>
                        </Group>
                    ) : showtimesError ? (
                        <Alert color="red" variant="light" title="Finnkino unavailable">
                            {showtimesError}
                        </Alert>
                    ) : filteredShowtimes.length === 0 ? (
                        <Alert color="yellow" variant="light">
                            We couldn&apos;t find local showtimes for this movie on the selected date. Try a
                            different theatre or day.
                        </Alert>
                    ) : (
                        <Stack gap="sm">
                            {filteredShowtimes.map((show) => {
                                const durationLabel = formatFinnkinoDuration(show.lengthInMinutes)

                                return (
                                    <Box
                                        key={show.id}
                                        style={{
                                            border: "1px solid var(--mantine-color-gray-3)",
                                            borderRadius: "var(--mantine-radius-md)",
                                            padding: "1rem",
                                        }}
                                    >
                                        <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
                                            <Group gap="sm" align="center">
                                                <IconClock size={16}/>
                                                <Text fw={600}>{dayjs(show.start).format("HH:mm")}</Text>
                                            </Group>
                                            <Group gap="xs" align="center">
                                                <IconMapPin size={16} color="var(--mantine-color-dimmed)"/>
                                                <Text size="sm">
                                                    {show.theatre}
                                                    {show.auditorium ? ` • ${show.auditorium}` : ""}
                                                </Text>
                                            </Group>
                                            <Group gap="xs">
                                                {show.presentationMethod && (
                                                    <Badge variant="light" size="sm">{show.presentationMethod}</Badge>
                                                )}
                                                {show.rating && (
                                                    <Badge variant="light" size="sm" color="grape">{show.rating}</Badge>
                                                )}
                                                {durationLabel && (
                                                    <Badge
                                                        variant="light" size="sm" color="blue"
                                                    >{durationLabel}</Badge>
                                                )}
                                            </Group>
                                        </Group>
                                    </Box>
                                )
                            })}
                        </Stack>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default MovieDetails;
