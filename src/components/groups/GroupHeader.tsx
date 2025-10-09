import {Badge, Button, Card, Group, Stack, Text, Title} from "@mantine/core"
import {IconCrown, IconSettings, IconUser} from "@tabler/icons-react"
import dayjs from "dayjs"
import type {GroupMemberProfile, GroupRecord} from "../../types/group"

interface GroupHeaderProps {
    group: GroupRecord
    owner?: GroupMemberProfile
    membershipStatus: "owner" | "member" | "invited" | "viewer"
    nextShowtimeLabel?: string
    onOpenSettings?: () => void
}

const membershipCopy: Record<GroupHeaderProps["membershipStatus"], string> = {
    owner: "You own this group",
    member: "You are an active member",
    invited: "You have been invited to join",
    viewer: "You are viewing this group",
}

export function GroupHeader({group, owner, membershipStatus, nextShowtimeLabel, onOpenSettings}: GroupHeaderProps) {
    const createdAt = group.created_at ? dayjs(group.created_at) : null

    return (
        <Card withBorder padding="lg" radius="lg" shadow="sm">
            <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                    <Stack gap={4}>
                        <Title order={2}>{group.group_name}</Title>
                        <Group gap="xs" align="center">
                            <IconUser size={16}/>
                            <Text size="sm" c="dimmed">
                                Owner: {owner?.username ?? "Unknown"}
                            </Text>
                            {owner?.isOwner && (
                                <Badge
                                    color="indigo" variant="light" leftSection={<IconCrown size={12}/>}
                                    fw={500} size="xs"
                                >
                                    Owner
                                </Badge>
                            )}
                        </Group>
                        {createdAt?.isValid() && (
                            <Text size="sm" c="dimmed">
                                Created on {createdAt.format("MMMM D, YYYY")}
                            </Text>
                        )}
                    </Stack>

                    {membershipStatus === "owner" && onOpenSettings && (
                        <Button variant="outline" leftSection={<IconSettings size={16}/>} onClick={onOpenSettings}>
                            Group settings
                        </Button>
                    )}
                </Group>

                {group.description && (
                    <Text>{group.description}</Text>
                )}

                <Text size="sm" c="dimmed">
                    {membershipCopy[membershipStatus]}
                    {nextShowtimeLabel ? ` • ${nextShowtimeLabel}` : ""}
                </Text>
            </Stack>
        </Card>
    )
}
