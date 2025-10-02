import { ActionIcon, Card, Group, Stack, Text, Title, Tooltip } from "@mantine/core"
import { IconTrash } from "@tabler/icons-react"
import dayjs from "dayjs"
import type { GroupMember, GroupShowtime } from "../../types/group"

interface GroupShowtimesSectionProps {
  showtimes: GroupShowtime[]
  members: GroupMember[]
  isOwner: boolean
  onRemoveShowtime: (id: string) => void
}

export function GroupShowtimesSection({ showtimes, members, isOwner, onRemoveShowtime }: GroupShowtimesSectionProps) {
  const memberById = new Map(members.map((member) => [member.id, member]))

  if (showtimes.length === 0) {
    return (
      <Card withBorder radius="lg" padding="lg" shadow="sm">
        <Title order={3} mb="xs">
          Upcoming theatre times
        </Title>
        <Text size="sm" c="dimmed">
          No screenings scheduled yet. Share a Finnkino link with the group to get started.
        </Text>
      </Card>
    )
  }

  return (
    <Card withBorder radius="lg" padding="lg" shadow="sm">
      <Title order={3} mb="md">
        Upcoming theatre times
      </Title>

      <Stack gap="md">
        {showtimes.map((showtime) => {
          const addedBy = memberById.get(showtime.addedBy)
          return (
            <Card key={showtime.id} withBorder padding="md" radius="md" shadow="xs">
              <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                  <Text fw={600}>{showtime.movieTitle}</Text>
                  <Text size="sm" c="dimmed">
                    {showtime.theatre}
                  </Text>
                  <Text size="sm">{dayjs(showtime.startsAt).format("dddd, MMM D YYYY HH:mm")}</Text>
                  <Text size="xs" c="dimmed">
                    Added by {addedBy?.name ?? "Member"}
                  </Text>
                  {showtime.notes && (
                    <Text size="sm" c="dimmed">
                      {showtime.notes}
                    </Text>
                  )}
                </Stack>
                {isOwner && (
                  <Tooltip label="Remove showtime" withArrow>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => onRemoveShowtime(showtime.id)}
                      aria-label="Remove showtime"
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Card>
          )
        })}
      </Stack>
    </Card>
  )
}
