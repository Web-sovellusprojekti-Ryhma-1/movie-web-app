import {Badge, Button, Card, Group, Stack, Text, Title} from "@mantine/core"
import type {GroupJoinRequest} from "../../types/group"

interface GroupJoinRequestsSectionProps {
    requests: GroupJoinRequest[]
    onDecision: (requestId: string, action: "accept" | "decline") => void
    isOwner: boolean
}

export function GroupJoinRequestsSection({requests, onDecision, isOwner}: GroupJoinRequestsSectionProps) {
    if (!isOwner) {
        return null
    }

    return (
        <Card withBorder radius="lg" padding="lg" shadow="sm">
            <Group justify="space-between" mb="md">
                <Title order={3}>Pending requests</Title>
                <Badge variant="light" color={requests.length > 0 ? "yellow" : "gray"}>
                    {requests.length} waiting
                </Badge>
            </Group>

            {requests.length === 0 ? (
                <Text size="sm" c="dimmed">
                    No pending invitations right now. Share your invite link from the settings panel when you&apos;re
                    ready to
                    expand the crew.
                </Text>
            ) : (
                <Stack gap="sm">
                    {requests.map((request) => (
                        <Card key={request.id} withBorder padding="sm" radius="md" shadow="xs">
                            <Group justify="space-between" align="flex-start">
                                <Stack gap={4}>
                                    <Text fw={600}>{request.name}</Text>
                                    <Text size="xs" c="dimmed">
                                        Requested on {new Date(request.requestedAt).toLocaleString()}
                                    </Text>
                                    {request.message && (
                                        <Text size="sm" c="dimmed">
                                            “{request.message}”
                                        </Text>
                                    )}
                                </Stack>
                                <Group gap="xs">
                                    <Button
                                        size="xs" variant="outline" onClick={() => onDecision(request.id, "decline")}
                                    >
                                        Decline
                                    </Button>
                                    <Button size="xs" onClick={() => onDecision(request.id, "accept")}>
                                        Accept
                                    </Button>
                                </Group>
                            </Group>
                        </Card>
                    ))}
                </Stack>
            )}
        </Card>
    )
}
