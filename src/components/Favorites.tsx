import {Box, Flex, Image, Paper, ScrollArea, Text} from "@mantine/core";
import React, {useEffect, useState} from "react";
import {useLocation} from "wouter";
import {getMovieDetails} from "../api/tmdb";

export interface FavoriteType {
    user_id: number
    tmdb_id: number
}

interface FavoritesProps {
    favorites: FavoriteType[];
}

interface FavoritesListType {
    tmdb_id: number | null
    image: string | "https://placehold.co/342x500?text=No+Image" | null
}

const Favorites: React.FC<FavoritesProps> = ({favorites}) => {
    const [, setLocation] = useLocation();

    const [FavoritesList, setFavorites] = useState<FavoritesListType[]>([]);
    const [Loading, setLoading] = useState(false);


    const movieClick = (movieId: number | null) => {
        setLocation(`/movie/${movieId}`)
    }

    useEffect(() => {
        async function GetMoviePosters() {
            try {
                if (!favorites || favorites.length === 0) {
                    setFavorites([])
                    return
                }

                setLoading(true);

                const movieList: FavoritesListType[] = [];

                for (let i = 0; i < favorites.length; i++) {
                    const currentFavorite = favorites[i].tmdb_id
                    const movieDetails = await getMovieDetails(currentFavorite.toString())
                    console.log("Movie details: " + movieDetails)
                    movieList.push({tmdb_id: favorites[i].tmdb_id, image: movieDetails.poster_path})
                }

                setFavorites(movieList)

                setLoading(false);

            } catch (err) {
                console.error("Failed to fetch posters", err)
            }
        }

        GetMoviePosters()
    }, [favorites])

    if (favorites.length === 0) return null;
    if (Loading) return null;


    return (
        <Box>
            <Text>Favorites</Text>
            <Paper withBorder shadow="sm" w={1200} h="auto">
                <ScrollArea
                    type="hover"
                    offsetScrollbars
                    scrollbarSize={8}
                    style={{width: '100%'}}
                >

                    <Flex p="md" gap="md" mr="md">
                        {FavoritesList.map((fav) => (
                            <Image
                                key={fav.tmdb_id}
                                onClick={() => {
                                    movieClick(fav.tmdb_id)
                                }}
                                w={116}
                                h="auto"
                                src={`https://image.tmdb.org/t/p/w500${fav.image}`}
                            />
                        ))}
                    </Flex>

                </ScrollArea>
            </Paper>
        </Box>
    )
}

export default Favorites
