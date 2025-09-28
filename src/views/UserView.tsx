import {Box, Text, Group} from "@mantine/core";
import "@mantine/core/styles.css";
import { useState, useEffect } from "react";
import { UserByIdRequest } from "../api/User";
import Favorites from "../components/Favorites";
import type { Movie } from "../components/Movies";

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
        </Box>
        

    )
}

export default UserView;
