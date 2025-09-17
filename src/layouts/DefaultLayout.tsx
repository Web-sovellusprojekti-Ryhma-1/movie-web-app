import {Autocomplete, Box, Button, Group, Text, Modal,} from '@mantine/core';
import {IconSearch} from "@tabler/icons-react";
import * as React from "react";
import classes from './DefaultLayout.module.css';
import { AuthenticationForm } from '../components/AuthenticationForm.tsx';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

const DefaultLayout = ({children}: React.PropsWithChildren) => {
    const [opened, { open, close }] = useDisclosure(false);
    const [type, setType] = useState<'login' | 'register'>('login')

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
                            <Button variant="default" onClick={() => { setType('login'); open();}}>Log in</Button>
                            <Button onClick={() => { setType('register'); open();}}>Sign up</Button>
                        </Group>
                    </Group>
                </header>
                {children}
            </Box>
            <Modal opened={opened} onClose={close} title="Authentication">
                <AuthenticationForm initType={type} shadow="lg" />
            </Modal>
        </>
    );
};

export default DefaultLayout;
