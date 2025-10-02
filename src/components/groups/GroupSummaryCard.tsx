import { Avatar, Badge, Button, Card, Group, Image, Stack, Text, Tooltip } from "@mantine/core"
import { IconCalendarClock, IconChevronRight, IconUsers } from "@tabler/icons-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import type { GroupSummary } from "../../types/group"

dayjs.extend(relativeTime)

interface GroupSummaryCardProps {
  group: GroupSummary
  onViewGroup: (groupId: number) => void
}

export function GroupSummaryCard({ group, onViewGroup }: GroupSummaryCardProps) {
  const nextShowtime = [...group.showtimes]
    .sort((a, b) => dayjs(a.startsAt).valueOf() - dayjs(b.startsAt).valueOf())
    .find((showtime) => dayjs(showtime.startsAt).isAfter(dayjs()))

  return (
    <Card withBorder radius="lg" shadow="sm" padding="lg" h="100%">
      <Card.Section>
        <Image src={group.coverImage} h={160} alt={`${group.name} banner`} fit="cover" />
      </Card.Section>

      <Stack gap="md" mt="md" justify="space-between" h="calc(100% - 160px)">
        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={700} size="lg">
              {group.name}
            </Text>
            <Group gap="xs">
              <IconUsers size={16} stroke={1.8} />
              <Text size="sm" c="dimmed">
                {group.members.length} members
              </Text>
            </Group>
          </Group>

          <Text size="sm" c="dimmed" lineClamp={2}>
            {group.description}
          </Text>

          <Group gap="xs">
            {group.tags.map((tag) => (
              <Badge key={tag} variant="light" radius="sm" size="sm">
                {tag}
              </Badge>
            ))}
          </Group>
        </Stack>

        <Stack gap="sm">
          {nextShowtime ? (
            <Tooltip
              label={`${dayjs(nextShowtime.startsAt).format("dddd, MMM D YYYY HH:mm")} @ ${nextShowtime.theatre}`}
              withArrow
            >
              <Group gap="xs" align="center">
                <IconCalendarClock size={16} stroke={1.8} />
                <Text size="sm">
                  Next screening {dayjs(nextShowtime.startsAt).fromNow()}
                </Text>
              </Group>
            </Tooltip>
          ) : (
            <Group gap="xs" align="center">
              <IconCalendarClock size={16} stroke={1.8} />
              <Text size="sm" c="dimmed">
                No upcoming showtimes scheduled
              </Text>
            </Group>
          )}

          <Group gap="xs">
            {group.members.slice(0, 4).map((member) => (
              <Tooltip key={member.id} label={`${member.name} • ${member.role}`} withArrow>
                <Avatar src={member.avatarUrl} radius="xl" size="sm">
                  {member.name.at(0)}
                </Avatar>
              </Tooltip>
            ))}
            {group.members.length > 4 && (
              <Avatar radius="xl" size="sm" color="gray" variant="light">
                +{group.members.length - 4}
              </Avatar>
            )}
          </Group>

          <Button rightSection={<IconChevronRight size={16} />} onClick={() => onViewGroup(group.id)}>
            View group
          </Button>
        </Stack>
      </Stack>
    </Card>
  )
}
