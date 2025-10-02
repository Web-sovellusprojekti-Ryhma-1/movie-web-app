import React, { useEffect, useState } from "react";
import type { Movie } from "./Movies";
import { Button, Grid, Box, Text, Image, Flex, Paper } from "@mantine/core";

interface FavoriteType {
  tmdb_id: number
}

interface FavoritesProps {
  favorites: FavoriteType[];
}

interface FavoritesListType {
  tmdb_id: number
  image: string
}

const Favorites: React.FC<FavoritesProps> = ({ favorites }) => {
  const [FavoritesList, setFavorites] = useState([]);

  if (favorites.length === 0) return null;

  const movieClick = async (movieTitle: string) => {

  }

  useEffect(() => {
    
  })

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
                        src={fav.image}
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
