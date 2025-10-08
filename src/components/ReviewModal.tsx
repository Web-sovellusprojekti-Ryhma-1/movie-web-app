import {Button, Group, Text, Title, Rating, Anchor} from "@mantine/core";
import type { ReviewType } from "../types/review";
import { useLocation } from "wouter";
import { DeleteReview } from "../api/Review";
import { UseAuth } from "../context/AuthProvider";

export function ReviewModal({ review, closeReview, onDeletion, viewMoviePage }: 
    { review?: ReviewType, closeReview: () => void, onDeletion: (id: number) => void, viewMoviePage: boolean}) {
    const [ , setLocation] = useLocation();
    const { user } = UseAuth();

    if (!review) return null

    const reviewDate = new Date(review.reviewed_at)

    const goToMoviePage = (movieId: number) => {
        setLocation(`/movie/${movieId}`)
    };

    const goToUserPage = (userId: number) => {
        setLocation(`/user/${userId}`)
    };

    const deleteCurrentReview = async (movieId: number) => {
        try {
            await DeleteReview(movieId)
            onDeletion(movieId)
            closeReview()
        } catch (error) {
            alert(error)
        }
    };

    return (
        <>

            <Title>
                {review.title}
            </Title>
            <Anchor fz="lg" c="black" mt="auto" 
            onClick={() => goToUserPage(review.user_id)}
            >
                {review.user_email}
            </Anchor>
            
            <Group mt="xl" mb="xl">
                
                <Text style={{ whiteSpace: 'pre-wrap' }}>
                    {review.body}
                </Text>
            </Group>
            <Rating mt="md" readOnly={true} value={review.rating}/>
            <Group justify="space-between">
                <Text>
                    {reviewDate.toLocaleDateString("en-US", {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                        })}
                </Text>
                <Group>
                    {viewMoviePage && 
                <Button onClick={() => goToMoviePage(review.tmdb_id)}>
                View movie page
                </Button>
                }
                {user?.id == review.user_id &&
                <Button color="red" onClick={() => deleteCurrentReview(review.tmdb_id)}>
                    Delete review
                </Button>
                }
                </Group>
                
            </Group>
            
        </>
    );
}
