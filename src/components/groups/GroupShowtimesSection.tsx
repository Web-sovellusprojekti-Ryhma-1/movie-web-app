import {ActionIcon, Card, Group, Stack, Text, Title, Tooltip} from "@mantine/core"
import {IconExternalLink, IconTrash} from "@tabler/icons-react"
import dayjs from "dayjs"
import type {GroupShowtimeDetail} from "../../types/group"

interface GroupShowtimesSectionProps {
    showtimes: GroupShowtimeDetail[]
    isOwner: boolean
    isBusy?: boolean
    onRemoveShowtime: (id: number) => void
}

const getFinnkinoUrl = (eventId: string) =>
    `https://www.finnkino.fi/eng/Event/${encodeURIComponent(eventId)}`

export function GroupShowtimesSection({
                                          showtimes,
                                          isOwner,
                                          isBusy = false,
                                          onRemoveShowtime
                                      }: GroupShowtimesSectionProps) {
    if (showtimes.length === 0) {
        return (
            <Card withBorder radius="lg" padding="lg" shadow="sm">
                <Title order={3} mb="xs">
                    Upcoming theatre times
                </Title>
                <Text size="sm" c="dimmed">
                    {isOwner
                        ? "No screenings scheduled yet. Use \"Schedule showtime\" to add the first screening."
                        : "No screenings scheduled yet. Check back once the owner adds one."}
                </Text>
            </Card>
        )
    }

    const sortedShowtimes = [...showtimes].sort((a, b) => dayjs(a.dateOfShow).valueOf() - dayjs(b.dateOfShow).valueOf())

    return (
        <Card withBorder radius="lg" padding="lg" shadow="sm">
            <Title order={3} mb="md">
                Upcoming theatre times
            </Title>

            <Stack gap="md">
                {sortedShowtimes.map((showtime) => {
                    const date = dayjs(showtime.dateOfShow)
                    return (
                        <Card key={showtime.id} withBorder padding="md" radius="md" shadow="xs">
                            <Group justify="space-between" align="flex-start">
                                <Stack gap={4}>
                                    <Text
                                        fw={600}
                                    >{showtime.matchTitle ?? `Finnkino event ${showtime.finnkinoDbId}`}</Text>
                                    <Text size="sm" c="dimmed">
                                        Area {showtime.areaId}
                                    </Text>
                                    <Text size="sm">
                                        {date.isValid() ? date.format("dddd, MMM D YYYY") : showtime.dateOfShow}
                                    </Text>
                                    {showtime.theatreName && (
                                        <Text size="xs" c="dimmed">{showtime.theatreName}</Text>
                                    )}
                                </Stack>
                                <Group gap="xs">
                                    <Tooltip label="Open in Finnkino" withArrow>
                                        <ActionIcon
                                            component="a"
                                            href={getFinnkinoUrl(showtime.finnkinoDbId)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variant="subtle"
                                            aria-label="Open showtime on Finnkino"
                                        >
                                            <IconExternalLink size={18}/>
                                        </ActionIcon>
                                    </Tooltip>
                                    {isOwner && (
                                        <Tooltip label="Remove showtime" withArrow>
                                            <ActionIcon
                                                variant="light"
                                                color="red"
                                                onClick={() => onRemoveShowtime(showtime.id)}
                                                aria-label="Remove showtime"
                                                disabled={isBusy}
                                            >
                                                <IconTrash size={18}/>
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </Group>
                            </Group>
                        </Card>
                    )
                })}
            </Stack>
        </Card>
    )
}
