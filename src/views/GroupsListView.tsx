import {Alert, Badge, Box, Container, Group, SegmentedControl, SimpleGrid, Stack, Text, Title} from "@mantine/core"
import {IconInfoCircle} from "@tabler/icons-react"
import {useMemo, useState} from "react"
import {useLocation} from "wouter"
import {GroupSummaryCard} from "../components/groups/GroupSummaryCard"
import {UseAuth} from "../context/AuthProvider"
import {mockGroups} from "../data/mockGroups"

const filters = [
    {label: "All groups", value: "all"},
    {label: "I'm owner", value: "owner"},
    {label: "I'm a member", value: "member"},
]

const GroupsListView = () => {
    const [, navigate] = useLocation()
    const {user} = UseAuth()
    const [filter, setFilter] = useState<string>(filters[0].value)

    const filteredGroups = useMemo(() => {
        if (!user) return mockGroups

        if (filter === "owner") {
            return mockGroups.filter((group) => group.ownerId === user.id)
        }

        if (filter === "member") {
            return mockGroups.filter((group) =>
                group.members.some((member) => member.id === user.id && member.role !== "owner")
            )
        }

        return mockGroups
    }, [filter, user])

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <Group justify="space-between" align="flex-end">
                    <div>
                        <Title order={1}>My groups</Title>
                        <Text size="sm" c="dimmed">
                            Discover and manage your cinema crews
                        </Text>
                    </div>
                    <Badge size="lg" variant="light" color="blue">
                        {mockGroups.length} active groups
                    </Badge>
                </Group>

                <Box>
                    <SegmentedControl
                        value={filter}
                        onChange={setFilter}
                        data={filters}
                        size="md"
                    />
                    {!user && (
                        <Alert
                            mt="md"
                            variant="light"
                            color="blue"
                            icon={<IconInfoCircle size={18}/>}
                            title="Not logged in"
                        >
                            Sign in to see your personal groups.
                        </Alert>
                    )}
                </Box>

                {filteredGroups.length === 0 ? (
                    <Alert variant="light" color="gray" title="No groups found">
                        You don&apos;t have any groups that match this filter yet. Create one from the mobile app or ask
                        an
                        existing owner to invite you.
                    </Alert>
                ) : (
                    <SimpleGrid cols={{base: 1, sm: 2, lg: 3}} spacing="lg">
                        {filteredGroups.map((group) => (
                            <GroupSummaryCard
                                key={group.id}
                                group={group}
                                onViewGroup={(id) => navigate(`/groups/${id}`)}
                            />
                        ))}
                    </SimpleGrid>
                )}
            </Stack>
        </Container>
    )
}

export default GroupsListView
