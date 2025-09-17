import {Autocomplete, Box, Button, Group, Text, Modal,} from '@mantine/core';
import {IconSearch} from "@tabler/icons-react";
import * as React from "react";
import classes from './DefaultLayout.module.css';
import { LoginForm } from '../components/AuthenticationForm';
import { useDisclosure } from '@mantine/hooks';

const DefaultLayout = ({children}: React.PropsWithChildren) => {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
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
                            <Button variant="default" onClick={open}>Log in</Button>
                            <Button onClick={open}>Sign up</Button>
                        </Group>
                    </Group>
                </header>
                {children}
            </Box>
            <Modal opened={opened} onClose={close} title="Authentication">
                <LoginForm />
            </Modal>
        </>
    );
};

export default DefaultLayout;
