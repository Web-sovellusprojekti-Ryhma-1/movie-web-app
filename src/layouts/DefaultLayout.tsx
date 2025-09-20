import {Autocomplete, Box, Button, Group, Text, Modal} from '@mantine/core';
import {IconSearch} from "@tabler/icons-react";
import * as React from "react";
import classes from './DefaultLayout.module.css';
import { AuthenticationForm } from '../components/AuthenticationForm.tsx';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { UseAuth } from '../contexts/AuthProvider.tsx';

const DefaultLayout = ({children}: React.PropsWithChildren) => {
    const [opened, { open, close }] = useDisclosure(false);
    const [type, setType] = useState<'login' | 'register'>('login')
    const [logOutButtonVisible, setLogOutButtonVisible] = useState(false);

    const { user, LogOut } = UseAuth()

    useEffect (() => {
        if (user !== null) {
            setLogOutButtonVisible(true)
        }
        else {
            setLogOutButtonVisible(false)
        }
    }, [user])

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
                            { !logOutButtonVisible && <Button variant="default" onClick={() => { setType('login'); open();}}>Log in</Button>}
                            { !logOutButtonVisible && <Button onClick={() => { setType('register'); open();}}>Sign up</Button>}
                            { logOutButtonVisible && <Button variant='transparent'>
                                <Text fw={700}>{user?.username}</Text> 
                            </Button>}
                            { logOutButtonVisible && <Button onClick={() => {LogOut()}}>Log out</Button>}
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
