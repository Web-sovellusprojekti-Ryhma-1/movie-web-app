import React from "react";
import { Box, Text, Card, Rating, Paper, ScrollArea } from "@mantine/core";

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

      <Paper withBorder shadow="sm" p="md" w={1200}>
        <ScrollArea
          type="hover"
          offsetScrollbars
          scrollbarSize={8}
          style={{ width: '100%' }}
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
                style={{ width: 220, height: 220, flex: '0 0 auto' }}
              >
                <Card.Section>
                  <Text fz="lg" fw={500} mt="xs" ml="xs">
                    {rev.title}
                  </Text>
                </Card.Section>

                <div style={{ flex: 1 }}>
                  <Text fz="sm" mt="xs">
                    {rev.body}
                  </Text>
                </div>

                <Text mt="auto" c="dimmed">
                  <Rating value={rev.rating} readOnly />
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
