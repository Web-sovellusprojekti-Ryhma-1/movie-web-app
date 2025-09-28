import React from "react";
import { Container, Grid, Box, Text, Image, Flex } from "@mantine/core";



interface ReviewProps {
  reviews: Movie[];
}

const Favorites: React.FC<FavoritesProps> = ({ favorites }) => {
  if (favorites.length === 0) return null;

  return (
    <Box >
      <Text mb={10}>Favorites</Text>
        <Grid justify="flex-start" align="center">
                {favorites.map((fav) => (
                    <Grid.Col key={fav.id} span={{base: 2, sm: 2, md: 1, lg: 1}}>
                        <Image src={fav.image}/>
                    </Grid.Col>
                ))}
                
                <Text>Show more</Text>
        </Grid>
    </Box>
    
  )
}

export default Favorites;
