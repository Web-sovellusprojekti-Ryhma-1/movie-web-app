import {Box, Text, Group, Space, Button, Modal, List} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import "@mantine/core/styles.css";
import { useState, useEffect } from "react";
import { UserByIdRequest } from "../api/User";
import { ReviewByUserId } from "../api/Review";


import Favorites from "../components/Favorites";
import Reviews from "../components/Reviews";
import type { Movie } from "../components/Movies";
import type { Review } from "../components/Reviews";
import type { GroupType } from "../components/Groups";
import Groups from "../components/Groups";
import { ConfirmationWindow } from "../components/ConfirmationWindow";
/*
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
        id: 2,
        title: "The Dark Knight",
        image: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
        body: "Good movie!",
        rating: 4,
        reviewed_at: "28/9/2025"
    },
    {
        id: 3,
        title: "The Shawshank Redemption",
        image: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
        body: "I didn't like this movie.",
        rating: 1,
        reviewed_at: "28/9/2025"
    },
]

const UserGroups: GroupType[] = [
    {
        id: 1,
        name: "mygroup1"
    },
    {
        id: 2,
        name: "Superman Fan Club"
    },
]
*/


interface UserType {
    id: number
    username: string
    email: string
}

const UserView = ( { id }: { id: String }) => {
    const [user, setUser] = useState<UserType | null>(null)
    const [opened, { open, close }] = useDisclosure(false);

    const [MovieReviews, setReviews] = useState([]);
    const [UserGroups, setGroups] = useState([]);
    const [UserFavorites, setFavorites] = useState([]);

    useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user
        const response = await UserByIdRequest(id)
        const userData = response.data
        setUser(userData)

        // Fetch user reviews, favorites and groups
        const review = await ReviewByUserId(userData.id)
        console.log(review)
        setReviews(review.data.rows)
      } catch (err) {
        console.error("Failed to fetch user", err)
      }
    }
    fetchData();
  }, []);

  const handleResult = (confirmed: boolean) => {
    close()
    if (confirmed) {
      console.log("Delete Account");
    }
  }

    return (
        <>
        <Box>
            <Group p={20} ml="50" mb="sm">
                <Text size="xl" fw={700} ta="center" >{user?.username || "Username"}</Text>
                <Text ml="80" c="dimmed">{user?.email || "name@email.com"}</Text>
                <Button ml={820} onClick={() => open()}>Delete my account</Button>
            </Group>
            <Reviews reviews={MovieReviews}/>
            <Favorites favorites={UserFavorites}/>
            <Groups groups={UserGroups}/>
        </Box>
        <Modal opened={opened} onClose={close} size="xs" title="Delete user account">
            <ConfirmationWindow result={handleResult}/>
        </Modal>
        </>
        

    )
}

export default UserView;
