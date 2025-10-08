import {Box, Button, Group, Modal, Space, Text} from "@mantine/core";
import {useDisclosure} from '@mantine/hooks';
import "@mantine/core/styles.css";
import {notifications} from "@mantine/notifications";
import {IconCheck} from "@tabler/icons-react";
import {useEffect, useState} from "react";
import {useLocation, useParams} from "wouter";
import {GetUserFavorites} from "../api/Favorite";
import {ReviewByUserId} from "../api/Review";
import {DeleteUserAccount, UserByIdRequest} from "../api/User";
import {ConfirmationWindow} from "../components/ConfirmationWindow";
import type { FavoriteType } from "../types/favorite";
import Favorites from "../components/Favorites";
import type { ReviewType } from "../types/review";
import Reviews from "../components/Reviews";
import {UseAuth} from "../context/AuthProvider";


interface UserTypeFromIdRequest {
    username: string
    email: string
}

const UserView = () => {
    const {id} = useParams()

    const {user, LogOut} = UseAuth()

    const [, setLocation] = useLocation();

    const [profileUser, setProfileUser] = useState<UserTypeFromIdRequest | null>(null)
    const [opened, {open, close}] = useDisclosure(false);
    const [Loading, setLoading] = useState(false);

    const [MovieReviews, setReviews] = useState<ReviewType[]>([]);
    const [UserFavorites, setFavorites] = useState<FavoriteType[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                // Fetch user
                const userId = Number(id)
                const response = await UserByIdRequest(userId) as {data: UserTypeFromIdRequest}
                const userData = response.data
                setProfileUser(userData)

                // Fetch user reviews, favorites
                const [reviews, favorites] = await Promise.all([
                    ReviewByUserId(userId) as Promise<{data: {rows: ReviewType[]}}>,
                    GetUserFavorites(userId) as Promise<{data: {rows: FavoriteType[]}}>
                ])
                setReviews(reviews.data.rows)
                setFavorites(favorites.data.rows)

                setLoading(false);

            } catch (err) {
                console.error("Failed to fetch user", err)
            }
        }

        fetchData();
    }, [id]);

    const handleResult = async (confirmed: boolean) => {
        close()
        if (confirmed) {
            await DeleteUserAccount()
            notifications.show({
                title: "Success",
                message: "Account deleted successfully",
                color: 'cyan',
                icon: <IconCheck size={18}/>,
            })
            LogOut()
            setLocation("/")
        }
    }

    const ShowUserDeletionButton = (
        <>
            {user?.id == id ? (
                <Button onClick={() => open()}>Delete my account</Button>
            ) : (
                null
            )}
        </>
    )

    if (Loading) return null;

    return (
        <>
            <Box>
                <Group p={20} ml="100" mr="110" justify="space-between">
                    <div>
                        <Text size="xl" fw={700}>{profileUser?.username || "Username"}</Text>
                        <Text c="dimmed">{profileUser?.email || "name@email.com"}</Text>
                    </div>
                    {ShowUserDeletionButton}
                </Group>
                
                <Group ml={120}>
                    
                    <Reviews reviews={MovieReviews} goToMoviePage={true}/>
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
