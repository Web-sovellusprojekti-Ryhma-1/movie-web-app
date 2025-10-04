import {Center, Box, Text, Group, Button, Modal, Space} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import "@mantine/core/styles.css";
import { useState, useEffect } from "react";
import { UserByIdRequest } from "../api/User";
import { ReviewByUserId } from "../api/Review";
import { GetUserFavorites } from "../api/Favorite";

import type { FavoriteType } from "../components/Favorites";
import type { ReviewType } from "../components/Reviews";
import Favorites from "../components/Favorites";
import Reviews from "../components/Reviews";
import Groups from "../components/Groups";
import { ConfirmationWindow } from "../components/ConfirmationWindow";

/*
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


interface UserTypeFromIdRequest {
    id: number
    username: string
    email: string
}

const UserView = ( { id }: { id: string }) => {
    const [user, setUser] = useState<UserTypeFromIdRequest | null>(null)
    const [opened, { open, close }] = useDisclosure(false);
    const [Loading, setLoading] = useState(false);

    const [MovieReviews, setReviews] = useState<ReviewType[]>([]);
    const [UserGroups, setGroups] = useState([]);
    const [UserFavorites, setFavorites] = useState<FavoriteType[]>([]);

    useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch user
        const response = await UserByIdRequest(Number(id)) as {data: UserTypeFromIdRequest}
        const userData = response.data
        setUser(userData)

        // Fetch user reviews, favorites and groups
        const [reviews, favorites] = await Promise.all([
            ReviewByUserId(userData.id) as Promise<{ data: { rows: ReviewType[]} }>,
            GetUserFavorites(userData.id) as Promise<{ data: { rows: FavoriteType[] } }>
        ])
        setReviews(reviews.data.rows)
        setFavorites(favorites.data.rows)

        setLoading(false);

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

  if(Loading) return null;

    return (
        <>
        <Box>
            <Group p={20} ml="100" mb="sm">
                <Text size="xl" fw={700} ta="center" >{user?.username || "Username"}</Text>
                <Text ml="80" c="dimmed">{user?.email || "name@email.com"}</Text>
                <Button ml={770} onClick={() => open()}>Delete my account</Button>
            </Group>

            <Group ml={120}>
            <Reviews reviews={MovieReviews}/>
            <Space h="md"/>
            <Favorites favorites={UserFavorites}/>
            </Group>
            
            
        </Box>

        <Modal opened={opened} onClose={close} size="xs" title="Delete user account">
            <ConfirmationWindow result={handleResult}/>
        </Modal>
        </>
        

    )
}

export default UserView;
