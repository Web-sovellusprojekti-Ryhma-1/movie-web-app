import React, { useEffect, useState } from "react";
import type { Movie } from "./Movies";
import { Button, Grid, Box, Text, Image, Flex, Paper } from "@mantine/core";
import { getMovieDetails } from "../api/tmdb";

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

const Favorites: React.FC<FavoritesProps> = ({ favorites }) => {
  const [FavoritesList, setFavorites] = useState<FavoritesListType[]>([]);
  const [Loading, setLoading] = useState(false);

  const movieClick = async (movieId: number | null) => {

  }

  useEffect(() => {
    async function GetMoviePosters() {
      try {
        if (!favorites || favorites.length === 0){
          setFavorites([])
          return
        }

        setLoading(true);

        let movieList: FavoritesListType[] = [];
        
        for (let i = 0; i < favorites.length; i++) {
          let currentFavorite = favorites[i].tmdb_id
          let movieDetails = await getMovieDetails(currentFavorite.toString())
          console.log("Movie details: " + movieDetails)
          movieList.push({tmdb_id: favorites[0].tmdb_id, image: movieDetails.poster_path})
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
    <Paper withBorder h={210} shadow="sm">
        <Grid p="md" align="center">
                {FavoritesList.map((fav) => (
                    <Grid.Col key={fav.tmdb_id} span={{base: 2, sm: 2, md: 1, lg: 1}}>
                      
                        <Image onClick={() => { 
                          movieClick(fav.tmdb_id)
                        }} 
                        src={`https://image.tmdb.org/t/p/w500${fav.image}`}
                        />
                      
                    </Grid.Col>
                ))}
                
                <Text>Show more</Text>
        </Grid>
    </Paper>
    </Box>
  )
}

export default Favorites;
/*

*/