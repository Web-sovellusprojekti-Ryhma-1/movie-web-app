import React from "react";
import type { Movie } from "./Movies";
import { Container, Grid, Box, Text, Image, Flex, Paper } from "@mantine/core";

interface FavoritesProps {
  favorites: Movie[];
}

const Favorites: React.FC<FavoritesProps> = ({ favorites }) => {
  if (favorites.length === 0) return null;

  return (
    <Paper withBorder h={210}>
      <Text ml="md" mb={10}>Favorites</Text>
        <Grid ml="md" align="center">
                {favorites.map((fav) => (
                    <Grid.Col key={fav.id} span={{base: 2, sm: 2, md: 1, lg: 1}}>
                        <Image src={fav.image}/>
                    </Grid.Col>
                ))}
                
                <Text>Show more</Text>
        </Grid>
    </Paper>
    
  )
}

export default Favorites;
