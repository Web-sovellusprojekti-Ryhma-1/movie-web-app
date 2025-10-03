import React from "react";
import { Grid, Box, Text, Card, Rating, Paper } from "@mantine/core";

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

const Reviews: React.FC<ReviewProps> = ({ reviews }) => {
  if (reviews.length === 0) return null;

  return (
    <Box>
      <Text>Reviews</Text>
    <Paper withBorder shadow="sm">
      
        <Grid justify="flex-start" align="center" p="md">
                {reviews.map((rev) => (
                    <Grid.Col key={rev.tmdb_id} span={{base: 2, sm: 2, md: 1, lg: 2}}>
                        <Card shadow="xs" mb="md" withBorder radius="md" p="md" h={220} style={{ display: 'flex', flexDirection: 'column' }}>
                              <Card.Section>
                                  <Text ml="xs" mt="xs" fz="lg" fw={500}>
                                    {rev.title}
                                  </Text>
                              </Card.Section>

                              <div style={{ flex: 1 }}>
                                <Text fz="sm" mt="xs">
                                  {rev.body}
                                </Text>
                              </div>

                              <Text mt="auto"  c="dimmed">
                                <Rating value={rev.rating} readOnly />
                              </Text>
                              <Text fz="xs" mt="auto"  c="dimmed">
                                {rev.reviewed_at}
                              </Text>
                            </Card>
                    </Grid.Col>
                ))}
                
                <Text>Show more</Text>
        </Grid>
    </Paper>
    </Box>
  )
}

export default Reviews;
