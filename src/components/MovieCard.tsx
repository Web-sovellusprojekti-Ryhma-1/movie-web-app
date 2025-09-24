import {Badge, Button, Card, Group, Image, Rating, Stack, Text, Tooltip} from "@mantine/core";
import {IconCalendar, IconClock} from "@tabler/icons-react";

interface MovieCardProps {
    title: string;
    poster: string;
    year: number;
    genre: string[];
    rating: number;
    duration?: number;
    description: string;
    director?: string;
    onDetailsClick?: () => void;
}

export function MovieCard({
                              title,
                              poster,
                              year,
                              genre,
                              rating,
                              duration,
                              description,
                              director,
                              onDetailsClick
                          }: MovieCardProps) {
    const ratingValue = rating / 2;

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
                <Image
                    src={poster}
                    height={400}
                    alt={`${title} poster`}
                    fallbackSrc="https://via.placeholder.com/350x400?text=No+Image"
                />
            </Card.Section>

            <Stack gap="sm" mt="md">
                <Text fw={500} size="lg" lineClamp={2}>
                    {title}
                </Text>
                <Tooltip label={`${rating.toFixed(1)} / 10`}>
                    <div>
                        <Rating value={ratingValue} fractions={2} readOnly/>
                    </div>
                </Tooltip>
                <Group gap="sm" align="center">
                    <Group gap={4} align="center">
                        <IconCalendar size={14} color="var(--mantine-color-dimmed)"/>
                        <Text size="sm" c="dimmed">{year}</Text>
                    </Group>
                    {typeof duration === "number" && (
                        <Group gap={4} align="center">
                            <IconClock size={14} color="var(--mantine-color-dimmed)"/>
                            <Text size="sm" c="dimmed">{Math.floor(duration / 60)}h {duration % 60}m</Text>
                        </Group>
                    )}
                </Group>

                {director && (
                    <Text size="sm" c="dimmed">
                        Directed by {director}
                    </Text>
                )}

                <Group gap="xs">
                    {genre.slice(0, 3).map((g, index) => (
                        <Badge key={index} variant="light" size="sm">{g}</Badge>
                    ))}
                    {genre.length > 3 && (
                        <Badge variant="light" size="sm" color="gray">+{genre.length - 3}</Badge>
                    )}
                </Group>

                <Text size="sm" c="dimmed" lineClamp={3}>
                    {description}
                </Text>

                <Group grow mt="sm">
                    <Button variant="outline" onClick={onDetailsClick}>
                        Details
                    </Button>
                </Group>
            </Stack>
        </Card>
    );
}
