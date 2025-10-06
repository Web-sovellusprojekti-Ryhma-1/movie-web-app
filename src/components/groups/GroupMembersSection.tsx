import {ActionIcon, Avatar, Badge, Card, Group, Menu, Stack, Text, Title, Tooltip,} from "@mantine/core"
import {IconDotsVertical, IconLogout, IconUserMinus} from "@tabler/icons-react"
import type {GroupMember} from "../../types/group"

interface GroupMembersSectionProps {
    members: GroupMember[]
    currentUserId?: number
    isOwner: boolean
    onRemoveMember: (memberId: number) => void
    onLeaveGroup: () => void
}

const roleLabels: Record<GroupMember["role"], string> = {
    owner: "Owner",
    admin: "Admin",
    member: "Member",
}

export function GroupMembersSection({
                                        members,
                                        currentUserId,
                                        isOwner,
                                        onRemoveMember,
                                        onLeaveGroup,
                                    }: GroupMembersSectionProps) {
    return (
        <Card withBorder radius="lg" padding="lg" shadow="sm">
            <Group justify="space-between" mb="md">
                <Title order={3}>Members</Title>
                {currentUserId && (
                    <Tooltip label="Leave group" position="left" withArrow>
                        <ActionIcon color="red" variant="light" onClick={onLeaveGroup} aria-label="Leave group">
                            <IconLogout size={18}/>
                        </ActionIcon>
                    </Tooltip>
                )}
            </Group>

            <Stack gap="sm">
                {members.map((member) => {
                    const isCurrentUser = member.id === currentUserId
                    const canKick = isOwner && !isCurrentUser && member.role !== "owner"

                    return (
                        <Card key={member.id} withBorder padding="sm" radius="md" shadow="xs">
                            <Group justify="space-between">
                                <Group gap="md">
                                    <Avatar src={member.avatarUrl} radius="xl">
                                        {member.name.at(0)}
                                    </Avatar>
                                    <Stack gap={2}>
                                        <Text fw={600}>{member.name}</Text>
                                        <Group gap="xs">
                                            <Badge size="sm" variant="light">
                                                {roleLabels[member.role]}
                                            </Badge>
                                            <Text size="xs" c="dimmed">
                                                Joined {new Date(member.joinedAt).toLocaleDateString()}
                                            </Text>
                                            {isCurrentUser && (
                                                <Badge size="sm" color="blue" variant="light">
                                                    You
                                                </Badge>
                                            )}
                                        </Group>
                                    </Stack>
                                </Group>

                                {canKick && (
                                    <Menu position="bottom-end" withinPortal>
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" aria-label={`Manage ${member.name}`}>
                                                <IconDotsVertical size={18}/>
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item
                                                leftSection={<IconUserMinus size={16}/>}
                                                color="red"
                                                onClick={() => onRemoveMember(member.id)}
                                            >
                                                Remove from group
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                )}
                            </Group>
                        </Card>
                    )
                })}
            </Stack>
        </Card>
    )
}
