import {Badge, Button, Card, Group, Stack, Text} from "@mantine/core"
import {IconCalendarClock, IconChevronRight, IconUsers} from "@tabler/icons-react"
import dayjs from "dayjs"
import type {GroupListItem, MembershipStatus} from "../../types/group"

const membershipBadge: Record<MembershipStatus, {color: string; label: string}> = {
    owner: {color: "indigo", label: "Owner"},
    member: {color: "teal", label: "Member"},
    invited: {color: "yellow", label: "Invited"},
    unknown: {color: "gray", label: "Not joined"},
}

interface GroupSummaryCardProps {
    group: GroupListItem
    onViewGroup: (groupId: number) => void
    onAcceptInvitation?: () => void
    acceptInProgress?: boolean
}

export function GroupSummaryCard({group, onViewGroup, onAcceptInvitation, acceptInProgress}: GroupSummaryCardProps) {
    const membership = membershipBadge[group.membershipStatus]
    const nextShowtime = group.nextShowtime
    const nextShowtimeDate = nextShowtime && dayjs(nextShowtime.dateOfShow)
    const hasUpcomingShowtime = nextShowtimeDate ? nextShowtimeDate.isAfter(dayjs().subtract(1, "day")) : false

    return (
        <Card
            withBorder
            radius="lg"
            shadow="sm"
            padding="lg"
            style={{display: "flex", flexDirection: "column", height: "100%"}}
        >
            <Card.Section
                px="lg" py="md" style={{
                background: "linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-indigo-6))",
                color: "white",
            }}
            >
                <Stack gap={4}>
                    <Text fw={700} size="lg">
                        {group.name}
                    </Text>
                    <Text size="sm" c="white" style={{opacity: 0.85}}>
                        Owner: {group.ownerName ?? "Unknown"}
                    </Text>
                </Stack>
            </Card.Section>

            <Stack gap="md" mt="md" justify="space-between" style={{flexGrow: 1}}>
                <Stack gap="sm">
                    <Group gap="xs">
                        <Badge color={membership.color} variant="light">
                            {membership.label}
                        </Badge>
                        <Badge
                            leftSection={<IconUsers size={14}/>}
                            variant="light"
                            color="gray"
                        >
                            {group.acceptedMemberCount} members
                        </Badge>
                        {group.pendingMemberCount > 0 && (
                            <Badge color="yellow" variant="light">
                                {group.pendingMemberCount} pending
                            </Badge>
                        )}
                    </Group>

                    <Text size="sm" c="dimmed">
                        {group.memberCount} total people have access to this group.
                    </Text>
                </Stack>

                <Stack gap="sm">
                    <Group gap="xs" align="center">
                        <IconCalendarClock size={16} stroke={1.8}/>
                        <Text size="sm" c={hasUpcomingShowtime ? undefined : "dimmed"}>
                            {nextShowtime && nextShowtimeDate?.isValid()
                                ? `Next showtime ${nextShowtimeDate.format("MMM D, YYYY")}`
                                : "No upcoming showtimes scheduled"}
                        </Text>
                    </Group>

                    <Group gap="xs">
                        {group.membershipStatus === "invited" && onAcceptInvitation && (
                            <Button
                                variant="light"
                                color="teal"
                                onClick={onAcceptInvitation}
                                loading={acceptInProgress}
                            >
                                Accept invite
                            </Button>
                        )}
                        <Button
                            rightSection={<IconChevronRight size={16}/>}
                            onClick={() => onViewGroup(group.id)}
                        >
                            View group
                        </Button>
                    </Group>
                </Stack>
            </Stack>
        </Card>
    )
}
