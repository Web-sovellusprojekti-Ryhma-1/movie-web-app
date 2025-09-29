import React from "react";
import { Card, Title, Grid, Box, Text, Image, Flex, Paper } from "@mantine/core";

export interface GroupType {
    id: number
    name: string
}

interface GroupProps {
  groups: GroupType[];
}

const Groups: React.FC<GroupProps> = ({ groups }) => {
  if (groups.length === 0) return null;

  return (
    <Paper withBorder h={210} shadow="sm">
      
        <Grid p="md" align="center">
                {groups.map((group) => (
                    <Grid.Col key={group.id} span={{base: 2, sm: 2, md: 1, lg: 2}}>
                        <Card shadow="xs" mb="md" withBorder radius="md" p="md" h={150}>
                            <Title>{group.name}</Title>
                        </Card>
                    </Grid.Col>
                ))}
                
                <Text>Show more</Text>
        </Grid>
    </Paper>
    
  )
}

export default Groups;
