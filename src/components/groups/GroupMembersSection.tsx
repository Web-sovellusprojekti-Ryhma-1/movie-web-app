import {ActionIcon, Badge, Button, Card, Group, Menu, Stack, Text, Title, Tooltip} from "@mantine/core"
import {IconCircleCheck, IconDotsVertical, IconLogout, IconUserMinus} from "@tabler/icons-react"
import type {GroupMemberProfile} from "../../types/group"

interface GroupMembersSectionProps {
    members: GroupMemberProfile[]
    ownerId: number
    currentUserId?: number
    isOwner: boolean
    isBusy?: boolean
    onRemoveMember: (memberId: number) => void
    onLeaveGroup: () => void
    onAcceptInvitation?: () => void
}

export function GroupMembersSection({
                                        members,
                                        ownerId,
                                        currentUserId,
                                        isOwner,
                                        isBusy = false,
                                        onRemoveMember,
                                        onLeaveGroup,
                                        onAcceptInvitation,
                                    }: GroupMembersSectionProps) {
    const acceptedMembers = members.filter((member) => member.accepted)
    const pendingMembers = members.filter((member) => !member.accepted)
    const currentMember = members.find((member) => member.userId === currentUserId)
    const canLeave = Boolean(currentMember && currentMember.accepted && !currentMember.isOwner)
    const canAcceptInvite = Boolean(currentMember && !currentMember.accepted && onAcceptInvitation)

    return (
        <Card withBorder radius="lg" padding="lg" shadow="sm">
            <Group justify="space-between" mb="md">
                <Title order={3}>Members</Title>
                <Group gap="xs">
                    <Badge color="teal" variant="light">{acceptedMembers.length} active</Badge>
                    {pendingMembers.length > 0 && (
                        <Badge color="yellow" variant="light">{pendingMembers.length} pending</Badge>
                    )}
                    {canLeave && (
                        <Tooltip label="Leave group" position="left" withArrow>
                            <ActionIcon
                                color="red"
                                variant="light"
                                onClick={onLeaveGroup}
                                aria-label="Leave group"
                                disabled={isBusy}
                            >
                                <IconLogout size={18}/>
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            </Group>

            <Stack gap="sm">
                {acceptedMembers.map((member) => {
                    const isCurrentUser = member.userId === currentUserId
                    const isGroupOwner = member.userId === ownerId
                    const canKick = isOwner && !isGroupOwner && !isCurrentUser

                    return (
                        <Card key={member.userId} withBorder padding="sm" radius="md" shadow="xs">
                            <Group justify="space-between" align="flex-start">
                                <Stack gap={4}>
                                    <Text fw={600}>{member.username}</Text>
                                    <Text size="xs" c="dimmed">{member.email}</Text>
                                    <Group gap="xs">
                                        {isGroupOwner && (
                                            <Badge size="sm" color="indigo" variant="light">
                                                Owner
                                            </Badge>
                                        )}
                                        {isCurrentUser && (
                                            <Badge size="sm" color="blue" variant="light">
                                                You
                                            </Badge>
                                        )}
                                    </Group>
                                </Stack>

                                {canKick && (
                                    <Menu position="bottom-end" withinPortal>
                                        <Menu.Target>
                                            <ActionIcon
                                                variant="subtle"
                                                aria-label={`Remove ${member.username}`}
                                                disabled={isBusy}
                                            >
                                                <IconDotsVertical size={18}/>
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item
                                                leftSection={<IconUserMinus size={16}/>}
                                                color="red"
                                                onClick={() => onRemoveMember(member.userId)}
                                                disabled={isBusy}
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

            {pendingMembers.length > 0 && (
                <Stack gap="sm" mt="lg">
                    <Title order={4}>Pending invitations</Title>
                    {pendingMembers.map((member) => {
                        const isCurrentUser = member.userId === currentUserId
                        const canRemoveInvite = isOwner && !isCurrentUser

                        return (
                            <Card key={member.userId} withBorder padding="sm" radius="md" shadow="xs">
                                <Group justify="space-between" align="center">
                                    <Stack gap={4}>
                                        <Text fw={600}>{member.username}</Text>
                                        <Text size="xs" c="dimmed">{member.email}</Text>
                                        <Badge size="sm" color="yellow" variant="light">
                                            Invitation pending
                                        </Badge>
                                    </Stack>
                                    <Group gap="xs">
                                        {isCurrentUser && canAcceptInvite && (
                                            <Button
                                                size="xs"
                                                color="teal"
                                                leftSection={<IconCircleCheck size={14}/>}
                                                onClick={onAcceptInvitation}
                                                loading={isBusy}
                                            >
                                                Accept
                                            </Button>
                                        )}
                                        {canRemoveInvite && (
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                onClick={() => onRemoveMember(member.userId)}
                                                aria-label={`Remove ${member.username}`}
                                                disabled={isBusy}
                                            >
                                                <IconUserMinus size={16}/>
                                            </ActionIcon>
                                        )}
                                    </Group>
                                </Group>
                            </Card>
                        )
                    })}
                </Stack>
            )}
        </Card>
    )
}
