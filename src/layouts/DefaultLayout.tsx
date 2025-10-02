import {
    AppShell,
    Autocomplete,
    Box,
    Burger,
    Button,
    Drawer,
    Group,
    Modal,
    Stack,
    Text,
    UnstyledButton
} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {IconSearch} from "@tabler/icons-react";
import React, {useEffect, useState} from "react";
import {Link, useLocation, useSearchParams} from "wouter";
import {AuthenticationForm} from "../components/AuthenticationForm.tsx";
import {UseAuth} from "../context/AuthProvider.tsx";
import classes from "./DefaultLayout.module.css";

const DefaultLayout = ({children}: React.PropsWithChildren) => {
    const [drawerOpened, {toggle: toggleDrawer, close: closeDrawer}] = useDisclosure(false);
    const [modalOpened, {open: openModal, close: closeModal}] = useDisclosure(false);
    const [authType, setAuthType] = useState<"login" | "register">("login");
    const [, setLocation] = useLocation();
    const [searchParams] = useSearchParams();
    const urlQuery = searchParams.get("q") || "";
    const [searchQuery, setSearchQuery] = useState(urlQuery);

    const {user, LogOut} = UseAuth();
    const isAuthenticated = user !== null;

    useEffect(() => {
        setSearchQuery(urlQuery);
    }, [urlQuery]);

    const handleAuthClick = (type: "login" | "register") => {
        setAuthType(type);
        openModal();
        closeDrawer();
    };

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const trimmedQuery = searchQuery.trim();
        setLocation(`/search?q=${encodeURIComponent(trimmedQuery)}`);
        closeDrawer();
    };

    const NavigateToCurrentUser = () => {
        setLocation(`/user/${user?.id}`);
    }

    const authControls = (
        <>
            {isAuthenticated ? (
                <Group>
                    <Button variant="transparent" fw={700} size="sm" onClick={() => NavigateToCurrentUser()}>{user?.username}</Button>
                    <Button variant="default" onClick={() => LogOut()}>Log Out</Button>
                </Group>
            ) : (
                <Group>
                    <Button variant="default" onClick={() => handleAuthClick("login")}>Log in</Button>
                    <Button onClick={() => handleAuthClick("register")}>Sign up</Button>
                </Group>
            )}
        </>
    );

    const searchForm = (
        <form onSubmit={handleSearchSubmit}>
            <Group>
                <Autocomplete
                    className={classes.search}
                    placeholder="Search for a movie"
                    leftSection={<IconSearch size={16} stroke={1.5}/>}
                    data={[]}
                    value={searchQuery}
                    onChange={setSearchQuery}
                />
                <Button type="submit" variant="gradient">Search</Button>
            </Group>
        </form>
    );

    return (
        <>
            <AppShell header={{height: 60}} padding="md">
                <AppShell.Header className={classes.appShellHeader}>
                    <Group h="100%" px="md" justify="space-between">
                        <Group gap="lg" align="center">
                            <Link href="/">
                                <UnstyledButton>
                                    <Text size="lg" fw={700}>Movie App</Text>
                                </UnstyledButton>
                            </Link>
                            <Group gap="md" visibleFrom="md">
                                <Link href="/groups">
                                    <UnstyledButton>
                                        <Text size="sm" fw={600}>Groups</Text>
                                    </UnstyledButton>
                                </Link>
                            </Group>
                        </Group>
                        <Group visibleFrom="sm">{searchForm}</Group>
                        <Box visibleFrom="sm">{authControls}</Box>
                        <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" size="sm"/>
                    </Group>
                </AppShell.Header>
                <AppShell.Main>{children}</AppShell.Main>
            </AppShell>
            <Drawer opened={drawerOpened} onClose={closeDrawer} title="Navigation" padding="md" hiddenFrom="sm">
                <Stack>
                    <Link href="/groups">
                        <Button variant="subtle" onClick={closeDrawer}>Groups</Button>
                    </Link>
                    {searchForm}
                    {authControls}
                </Stack>
            </Drawer>
            <Modal opened={modalOpened} onClose={closeModal} title="Authentication">
                <AuthenticationForm initType={authType} shadow="lg" onClose={closeModal}/>
            </Modal>
        </>
    );
};

export default DefaultLayout;
