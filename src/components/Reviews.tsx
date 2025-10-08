import {Anchor, Box, Card, Paper, Rating, ScrollArea, Text, Modal} from "@mantine/core";
import React, { useEffect } from "react";
import type { ReviewType } from "../types/review";
import { ReviewModal } from "./ReviewModal";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";


interface ReviewProps {
    reviews: ReviewType[];
    goToMoviePage: boolean
}

const Reviews: React.FC<ReviewProps> = ({reviews, goToMoviePage}) => {
    const [openReview, setOpenReview] = useState<ReviewType>()
    const [opened, {open, close}] = useDisclosure(false);
    const [reviewsList, setReviewsList] = useState(reviews);

    useEffect(() => {
      setReviewsList(reviews);
    }, [reviews]);

    if (reviews.length === 0) return null;
    
    const handleDeletion = (id: number) => {
      setReviewsList((prev) => prev.filter((rev) => rev.tmdb_id !== id));
    }

    return (
        <>
            <Box>
                {goToMoviePage &&
                <Text>Reviews</Text>}
                
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
                            {reviewsList.map((rev) => (
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
                                            c="black" fz="lg" fw={600} mt="xs" ml="xs"
                                            onClick={() => {
                                              setOpenReview(rev)
                                              open()
                                            }}
                                            style={{
                                              display: 'block',
                                              width: 210,
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                            }}
                                            >
                                            {rev.title}
                                        </Anchor>
                                        <Text fz="xs" mt="auto" ml="xs">
                                          {rev.user_email}
                                        </Text>
                                    </Card.Section>

                                    <div style={{flex: 1}}>
                                        <Text fz="sm" mt="xs"
                                        lineClamp={5}
                                        >
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

            <Modal opened={opened} onClose={close} size="xl" title="Review">
                <ReviewModal review={openReview} closeReview={close} onDeletion={handleDeletion} viewMoviePage={goToMoviePage}/>
            </Modal>
        </>
    );
}

export default Reviews;
