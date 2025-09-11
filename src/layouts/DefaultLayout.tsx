import {Autocomplete, Box, Button, Group, Text,} from '@mantine/core';
import {IconSearch} from "@tabler/icons-react";
import * as React from "react";
import classes from './DefaultLayout.module.css';

const DefaultLayout = ({children}: React.PropsWithChildren) => {
    return (
        <Box pb={120}>
            <header className={classes.header}>
                <Group justify="space-between" h="100%">
                    <Text size="lg" fw={700}>Movie App</Text>
                    <Group h="100%" gap={10} visibleFrom="sm">
                        <Autocomplete
                            className={classes.search}
                            placeholder="Search for a movie"
                            leftSection={<IconSearch size={16} stroke={1.5} />}
                            data={[]}
                            visibleFrom="xs"
                        />
                        <Button variant="gradient">Search</Button>
                    </Group>
                    <Group visibleFrom="sm">
                        <Button variant="default">Log in</Button>
                        <Button>Sign up</Button>
                    </Group>
                </Group>
            </header>
            {children}
        </Box>
    );
};

export default DefaultLayout;
