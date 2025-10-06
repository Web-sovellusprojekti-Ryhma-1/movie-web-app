import {Badge, Button, Card, Group, Image, Stack, Text, Title} from "@mantine/core"
import {IconSettings} from "@tabler/icons-react"
import dayjs from "dayjs"
import type {GroupSummary} from "../../types/group"

interface GroupHeaderProps {
    group: GroupSummary
    nextShowtimeLabel: string
    isOwner: boolean
    onOpenSettings: () => void
}

export function GroupHeader({group, nextShowtimeLabel, isOwner, onOpenSettings}: GroupHeaderProps) {
    return (
        <Card withBorder padding="lg" radius="lg" shadow="sm">
            <Card.Section>
                <Image src={group.coverImage} alt={`${group.name} banner`} h={220} fit="cover"/>
            </Card.Section>

            <Stack gap="md" mt="md">
                <Group justify="space-between" align="flex-start">
                    <Stack gap={4}>
                        <Title order={2}>{group.name}</Title>
                        <Text size="sm" c="dimmed">
                            Founded {dayjs(group.createdAt).format("MMMM D, YYYY")}
                        </Text>
                    </Stack>
                    {isOwner && (
                        <Button variant="outline" leftSection={<IconSettings size={16}/>} onClick={onOpenSettings}>
                            Group settings
                        </Button>
                    )}
                </Group>

                <Text>{group.description}</Text>

                <Group gap="xs">
                    {group.tags.map((tag) => (
                        <Badge key={tag} variant="light" radius="sm">
                            {tag}
                        </Badge>
                    ))}
                </Group>

                <Text size="sm" c="dimmed">
                    {nextShowtimeLabel}
                </Text>
            </Stack>
        </Card>
    )
}
