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
    Title,
} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import {notifications} from "@mantine/notifications";
import {IconClock, IconMapPin} from "@tabler/icons-react";
import dayjs from "dayjs";
import React, {useEffect, useMemo, useState} from "react";
import {DeleteFavorite, GetUserFavorites, PostFavorite} from "../api/Favorite";
import {fetchShowtimes, fetchTheatreAreas, type FinnkinoTheatreAreasResponse,} from "../api/finnkinoapi";
import {createGroupShowtime, listGroupsForUser} from "../api/Group";
import {AllReviewsByTmdbId, PostReview} from "../api/Review";
import {UseAuth} from "../context/AuthProvider";
import {
    type FinnkinoShowtime,
    formatFinnkinoDuration,
    normalizeFinnkinoShowtimes,
    normalizeTitleForComparison,
} from "../helpers/finnkinoHelpers";
import type {MovieDetails as MovieDetailsType} from "../helpers/movieHelpers";
import type {FavoriteType} from "../types/favorite";
import type {UserGroupRow} from "../types/group";
import type {PostReviewType, ReviewType} from "../types/review";
import Reviews from "./Reviews";


interface MovieDetailsProps {
    movie: MovieDetailsType
    onClose: () => void
}

const MovieDetails: React.FC<MovieDetailsProps> = ({movie, onClose}) => {
    const [reviews, setReviews] = useState<ReviewType[]>([]) // arvostelut
    const [isModalOpen, setIsModalOpen] = useState(false) // modaalin näkyvyys jotta voidaan triggeröidä napista
    const [newReview, setNewReview] = useState("") // uusi arvostelu
    const [newRating, setNewRating] = useState<number>(0) // arvostelun arvosanan parametri
    const [selectedDate, setSelectedDate] = useState<string | null>(dayjs().format("YYYY-MM-DD"))
    const [theatreAreas, setTheatreAreas] = useState<Array<{value: string; label: string}>>([])
    const [selectedTheatreArea, setSelectedTheatreArea] = useState<string | null>(null)
    const [showtimes, setShowtimes] = useState<FinnkinoShowtime[]>([])
    const [showtimesLoading, setShowtimesLoading] = useState(false)
    const [showtimesError, setShowtimesError] = useState<string | null>(null)
    const [isFavorited, setIsFavorited] = useState(false)
    const [newReviewPosted, setNewReviewPosted] = useState(false)
    const [userGroups, setUserGroups] = useState<UserGroupRow[]>([])
    const [groupsLoading, setGroupsLoading] = useState(false)
    const [groupFetchError, setGroupFetchError] = useState<string | null>(null)
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
    const [scheduleTarget, setScheduleTarget] = useState<FinnkinoShowtime | null>(null)
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
    const [scheduleSubmitting, setScheduleSubmitting] = useState(false)

    const {user} = UseAuth();
    const isAuthenticated = user !== null;

    const addMovieToFavorites = async (movieId: number) => {
        try {
            await PostFavorite(movieId)
            setIsFavorited(true)
        } catch (error) {
            console.log(error)
        }
    }

    const removeMovieFromFavorites = async (movieId: number) => {
        try {
            await DeleteFavorite(movieId)
            setIsFavorited(false)
        } catch (error) {
            console.log(error)
        }
    }

    const postMovieReview = async (movieReview: PostReviewType) => {
        try {
            await PostReview(movieReview)
            setNewReviewPosted(true)
        } catch (error) {
            console.log(error)
        }
    }

    const WriteReviewButton = () => {
        if (isAuthenticated) {
            setIsModalOpen(true)
        } else {
            notifications.show({
                title: "Login required",
                message: "Please log in to write a review",
                color: "cyan",
                withCloseButton: false
            })
        }
    }

    useEffect(() => {
        setNewReviewPosted(false)

        const fetchMovieReviews = async () => {
            try {
                const response = await AllReviewsByTmdbId(movie.id) as {data: {rows: ReviewType[]}}
                setReviews(response.data.rows)
            } catch (error) {
                console.log(error)
            }
        }
        fetchMovieReviews()
    }, [newReviewPosted])

    useEffect(() => {
        if (!isAuthenticated) return;

        const isMovieFavorited = async () => {
            try {
                const response = await GetUserFavorites(user.id) as {data: {rows: FavoriteType[]}}

                const allUserFavorites = response.data.rows

                const isMovieFavorited = allUserFavorites.some(
                    (fav: {tmdb_id: number}) => fav.tmdb_id == movie.id
                )

                if (isMovieFavorited) {
                    setIsFavorited(true)
                }
            } catch (error) {
                console.log(error)
            }
        }
        isMovieFavorited()
    }, [])

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            setUserGroups([])
            setGroupFetchError(null)
            return
        }

        const userId = user.id
        let isMounted = true
        setGroupsLoading(true)
        setGroupFetchError(null)

        const loadGroups = async () => {
            try {
                const rows = await listGroupsForUser(userId)
                if (!isMounted) {
                    return
                }
                const acceptedGroups = rows.filter((row) => row.accepted !== false)
                setUserGroups(acceptedGroups)
            } catch (error) {
                if (!isMounted) {
                    return
                }
                console.error("Failed to load user groups", error)
                setUserGroups([])
                setGroupFetchError("We couldn't load your groups right now.")
            } finally {
                if (isMounted) {
                    setGroupsLoading(false)
                }
            }
        }

        void loadGroups()

        return () => {
            isMounted = false
        }
    }, [isAuthenticated, user?.id])

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

    const groupOptions = useMemo(
        () => userGroups.map((group) => ({
            value: group.id.toString(),
            label: group.group_name,
        })),
        [userGroups],
    )

    const hasAvailableGroups = groupOptions.length > 0

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
        if (newReview.trim() && newRating != 0) {
            postMovieReview({
                review: {
                    title: movie.title,
                    body: newReview,
                    rating: newRating,
                    tmdb_id: movie.id
                }
            })

            setNewReview("")
            setNewRating(0)
            setIsModalOpen(false)
        }
    }

    const closeScheduleModal = () => {
        setScheduleModalOpen(false)
        setScheduleTarget(null)
        setScheduleSubmitting(false)
        setSelectedGroupId(null)
    }

    const openScheduleModal = (show: FinnkinoShowtime) => {
        if (!isAuthenticated) {
            notifications.show({
                title: "Login required",
                message: "Sign in to add showtimes to your groups.",
                color: "cyan",
            })
            return
        }

        if (groupsLoading) {
            notifications.show({
                title: "Fetching groups",
                message: "Hold on a moment while we load your groups.",
                color: "blue",
            })
            return
        }

        if (!hasAvailableGroups) {
            notifications.show({
                title: "No groups available",
                message: "Create or join a group before scheduling showtimes.",
                color: "yellow",
            })
            return
        }

        const areaId = show.areaId ?? selectedTheatreArea
        if (!areaId) {
            notifications.show({
                title: "Select theatre area",
                message: "Choose a theatre area before adding this showtime to a group.",
                color: "yellow",
            })
            return
        }

        setScheduleTarget(show)
        setScheduleModalOpen(true)
        setSelectedGroupId((current) => {
            if (current && groupOptions.some((option) => option.value === current)) {
                return current
            }
            return groupOptions[0]?.value ?? null
        })
    }

    const handleScheduleShowtime = async () => {
        if (!scheduleTarget || !selectedGroupId) {
            return
        }

        const groupId = Number(selectedGroupId)
        if (!Number.isInteger(groupId)) {
            notifications.show({
                title: "Invalid group",
                message: "Please choose a valid group before continuing.",
                color: "red",
            })
            return
        }

        const finnkinoId = scheduleTarget.eventId ?? scheduleTarget.showId ?? scheduleTarget.id
        if (!finnkinoId) {
            notifications.show({
                title: "Missing Finnkino ID",
                message: "This showtime is missing an identifier. Try another screening.",
                color: "red",
            })
            return
        }

        const areaId = scheduleTarget.areaId ?? selectedTheatreArea
        if (!areaId) {
            notifications.show({
                title: "Select theatre area",
                message: "Choose a theatre area before adding this showtime to a group.",
                color: "yellow",
            })
            return
        }

        setScheduleSubmitting(true)
        try {
            await createGroupShowtime(groupId, {
                showtime: {
                    finnkino_db_id: finnkinoId,
                    area_id: areaId,
                    dateofshow: dayjs(scheduleTarget.start).format("YYYY-MM-DD"),
                },
            })
            const targetGroup = userGroups.find((group) => group.id === groupId)
            notifications.show({
                title: "Showtime added",
                message: targetGroup
                    ? `The screening is now listed in “${targetGroup.group_name}”.`
                    : "The screening is now listed in your group's upcoming theatre times.",
                color: "teal",
            })
            window.dispatchEvent(new CustomEvent("group-showtime-added", {detail: {groupId}}))
            closeScheduleModal()
        } catch (error) {
            console.error("Failed to add showtime to group", error)
            notifications.show({
                title: "Unable to add showtime",
                message: "Please try again in a moment.",
                color: "red",
            })
        } finally {
            setScheduleSubmitting(false)
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
            <>
                {isAuthenticated && !isFavorited && (
                    <Button
                        onClick={() => addMovieToFavorites(movie.id)}
                        style={{
                            position: "fixed",
                            top: "6.58rem",
                            right: "1rem",
                            zIndex: 1,
                        }}
                    >
                        Add to Favorites
                    </Button>
                )}

                {isAuthenticated && isFavorited && (
                    <Button
                        onClick={() => removeMovieFromFavorites(movie.id)}
                        style={{
                            position: "fixed",
                            top: "6.58rem",
                            right: "1rem",
                            zIndex: 1,
                        }}
                    >
                        Remove from favorites
                    </Button>
                )}
            </>


            {/* movie app arvostelu kenttä */}
            <Box>
                <Title mb="md" order={3} style={{marginTop: "2rem"}}>User Reviews</Title>

                {/* vieritys palkki jotta voi scrollailla arvosteluja */}
                <Reviews reviews={reviews} goToMoviePage={false}/>

                <Button style={{marginTop: "1rem"}} onClick={() => WriteReviewButton()}>
                    Write a review
                </Button> {/* modaalin triggeröivä nappi */}

                <Modal
                    opened={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add a Review"
                > {/* Modaali eli popup ikkuna arvostelun luontiin */}
                    <Text size="lg" fw={500}>
                        {movie.title}
                    </Text>
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
                                        <Stack gap="sm">
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
                                                        <Badge
                                                            variant="light" size="sm"
                                                        >{show.presentationMethod}</Badge>
                                                    )}
                                                    {show.rating && (
                                                        <Badge
                                                            variant="light" size="sm" color="grape"
                                                        >{show.rating}</Badge>
                                                    )}
                                                    {durationLabel && (
                                                        <Badge
                                                            variant="light" size="sm" color="blue"
                                                        >{durationLabel}</Badge>
                                                    )}
                                                </Group>
                                            </Group>

                                            {isAuthenticated ? (
                                                <Group gap="xs" align="center">
                                                    <Button
                                                        size="xs"
                                                        variant="light"
                                                        onClick={() => openScheduleModal(show)}
                                                        disabled={groupsLoading || !hasAvailableGroups}
                                                    >
                                                        Add to group
                                                    </Button>
                                                    {groupsLoading && <Loader size="xs"/>}
                                                    {!groupsLoading && !hasAvailableGroups && !groupFetchError && (
                                                        <Text size="xs" c="dimmed">
                                                            Create or join a group to schedule this showtime.
                                                        </Text>
                                                    )}
                                                    {groupFetchError && (
                                                        <Text size="xs" c="red">
                                                            {groupFetchError}
                                                        </Text>
                                                    )}
                                                </Group>
                                            ) : (
                                                <Text size="xs" c="dimmed">
                                                    Sign in to add this showtime to a group.
                                                </Text>
                                            )}
                                        </Stack>
                                    </Box>
                                )
                            })}
                        </Stack>
                    )}
                </Box>
            </Box>

            <Modal opened={scheduleModalOpen} onClose={closeScheduleModal} title="Add to group" size="md">
                {scheduleTarget ? (
                    <Stack gap="md">
                        <Box>
                            <Text fw={600}>{movie.title}</Text>
                            <Text size="sm" c="dimmed">
                                {dayjs(scheduleTarget.start).format("dddd, DD MMM YYYY • HH:mm")} • {scheduleTarget.theatre}
                                {scheduleTarget.auditorium ? ` (${scheduleTarget.auditorium})` : ""}
                            </Text>
                        </Box>
                        {groupFetchError && (
                            <Alert color="red" variant="light">
                                {groupFetchError}
                            </Alert>
                        )}
                        <Select
                            label="Choose group"
                            placeholder={groupsLoading ? "Loading groups..." : "Select a group"}
                            data={groupOptions}
                            value={selectedGroupId}
                            onChange={(value) => setSelectedGroupId(value)}
                            nothingFoundMessage="No groups available"
                            disabled={!hasAvailableGroups || groupsLoading}
                        />
                        <Group justify="flex-end" gap="sm">
                            <Button variant="subtle" type="button" onClick={closeScheduleModal}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleScheduleShowtime}
                                loading={scheduleSubmitting}
                                disabled={!hasAvailableGroups || groupsLoading}
                            >
                                Add showtime
                            </Button>
                        </Group>
                    </Stack>
                ) : (
                    <Group justify="center" py="md">
                        <Loader/>
                    </Group>
                )}
            </Modal>
        </Box>
    );
};

export default MovieDetails;
