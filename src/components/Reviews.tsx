import {Anchor, Box, Card, Paper, Rating, ScrollArea, Text} from "@mantine/core";
import React from "react";
import {useLocation} from "wouter";

export interface ReviewType {
    user_id: number
    title: string
    body: string
    rating: number
    tmdb_id: number
    reviewed_at: string
}

interface ReviewProps {
    reviews: ReviewType[];
}

const Reviews: React.FC<ReviewProps> = ({reviews}) => {
    const [, setLocation] = useLocation();

    if (reviews.length === 0) return null;

    const titleClick = (movieId: number | null) => {
        setLocation(`/movie/${movieId}`)
    };

    return (
        <Box>
            <Text>Reviews</Text>

            <Paper withBorder shadow="sm" p="md" w={1200}>
                <ScrollArea
                    type="hover"
                    offsetScrollbars
                    scrollbarSize={8}
                    style={{width: '100%'}}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 16,
                        }}
                    >
                        {reviews.map((rev) => (
                            <Card
                                key={rev.tmdb_id}
                                shadow="xs"
                                withBorder
                                radius="md"
                                p="md"
                                style={{width: 220, height: 220, flex: '0 0 auto'}}
                            >
                                <Card.Section>
                                    <Anchor
                                        c="black" fz="lg" fw={600} mt="xs" ml="xs" onClick={() => {
                                        titleClick(rev.tmdb_id)
                                    }}
                                    >
                                        {rev.title}
                                    </Anchor>
                                </Card.Section>

                                <div style={{flex: 1}}>
                                    <Text fz="sm" mt="xs">
                                        {rev.body}
                                    </Text>
                                </div>

                                <Text mt="auto" c="dimmed">
                                    <Rating value={rev.rating} readOnly/>
                                </Text>

                                <Text fz="xs" mt="auto" c="dimmed">
                                    {rev.reviewed_at}
                                </Text>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </Paper>
        </Box>
    );
}

export default Reviews;
