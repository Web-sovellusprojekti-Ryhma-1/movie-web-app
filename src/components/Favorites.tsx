import React from "react";
import type { Movie } from "./Movies";
import { Button, Grid, Box, Text, Image, Flex, Paper } from "@mantine/core";

interface FavoritesProps {
  favorites: Movie[];
}

const Favorites: React.FC<FavoritesProps> = ({ favorites }) => {
  if (favorites.length === 0) return null;

  const movieClick = async (movieTitle: string) => {

  }

  return (
    <Paper withBorder h={210} shadow="sm">
        <Grid p="md" align="center">
                {favorites.map((fav) => (
                    <Grid.Col key={fav.id} span={{base: 2, sm: 2, md: 1, lg: 1}}>
                      
                        <Image onClick={() => { 
                          console.log(`Navigating to /movie/${fav.title}`);
                          movieClick(fav.title)
                        }} 
                        src={fav.image}
                        />
                      
                    </Grid.Col>
                ))}
                
                <Text>Show more</Text>
        </Grid>
    </Paper>
    
  )
}

export default Favorites;
