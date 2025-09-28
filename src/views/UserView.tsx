import {Box, Text, Group, Space} from "@mantine/core";
import "@mantine/core/styles.css";
import { useState, useEffect } from "react";
import { UserByIdRequest } from "../api/User";
import Favorites from "../components/Favorites";
import Reviews from "../components/Reviews";
import type { Movie } from "../components/Movies";
import type { Review } from "../components/Reviews";

const Movies: Movie[] = [
    {
        id: 1,
        title: "The Shawshank Redemption",
        image: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg"
    },
    {
        id: 2,
        title: "The Dark Knight",
        image: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg"
    },
    {
        id: 3,
        title: "The Dark Knight",
        image: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg"
    },
    {
        id: 4,
        title: "The Dark Knight",
        image: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg"
    },
    
]

const MovieReviews: Review[] = [
    {
        id: 1,
        title: "The Lego Movie",
        image: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
        body: "Awesome movie!",
        rating: 5,
        reviewed_at: "28/9/2025"
    },
    {
        id: 1,
        title: "The Dark Knight",
        image: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
        body: "Good movie!",
        rating: 4,
        reviewed_at: "28/9/2025"
    },
    {
        id: 1,
        title: "The Shawshank Redemption",
        image: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
        body: "Very bad movie!",
        rating: 1,
        reviewed_at: "28/9/2025"
    },
]

interface UserType {
    username: string
    email: string
}

const UserView = ( { id }: { id: String }) => {
    const [user, setUser] = useState<UserType | null>(null)

    useEffect(() => {
    async function fetchUser() {
      try {
        const response = await UserByIdRequest(id)
        setUser(response.data)
      } catch (err) {
        console.error("Failed to fetch user", err)
      }
    }
    fetchUser();
  }, []);

    return (
        <Box>
            <Group p={20} ml="80">
                <Text size="xl" fw={700} ta="center" >{user?.username || "Username"}</Text>
                <Text ml="80" c="dimmed">{user?.email || "name@email.com"}</Text>
            </Group>
            <Favorites favorites={Movies}/>
            <Space h="lg"/>
            <Reviews reviews={MovieReviews}/>
        </Box>
        

    )
}

export default UserView;
