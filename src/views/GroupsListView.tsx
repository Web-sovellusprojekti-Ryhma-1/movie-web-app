import {
    Alert,
    Badge,
    Box,
    Button,
    Container,
    Group,
    Loader,
    Modal,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core"
import {useForm} from "@mantine/form"
import {notifications} from "@mantine/notifications"
import {IconInfoCircle} from "@tabler/icons-react"
import {useCallback, useEffect, useMemo, useState} from "react"
import {useLocation} from "wouter"
import {
    acceptGroupMembership,
    createGroup,
    getGroupById,
    listGroupMembers,
    listGroupsForUser,
    listGroupShowtimes,
} from "../api/Group"
import {getUserById} from "../api/User"
import {GroupSummaryCard} from "../components/groups/GroupSummaryCard"
import {UseAuth} from "../context/AuthProvider"
import {findNextShowtime, resolveMembershipStatus} from "../helpers/groupHelpers"
import type {GroupListItem, GroupMemberProfile, GroupShowtimeDetail, MembershipStatus} from "../types/group"
import type {UserRecord} from "../types/user"

const filters = [
    {label: "All groups", value: "all"},
    {label: "Owned by me", value: "owner"},
    {label: "Active member", value: "member"},
    {label: "Invited", value: "invited"},
]

type FilterValue = (typeof filters)[number]["value"]

const GroupsListView = () => {
    const [, navigate] = useLocation()
    const {user} = UseAuth()
    const [filter, setFilter] = useState<FilterValue>(filters[0].value)
    const [groups, setGroups] = useState<GroupListItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [acceptingGroupId, setAcceptingGroupId] = useState<number | null>(null)

    const createGroupForm = useForm({
        initialValues: {
            groupName: "",
        },
        validate: {
            groupName: (value) => (value.trim().length < 3 ? "Group name should be at least 3 characters" : null),
        },
    })

    const loadGroups = useCallback(async () => {
        if (!user) {
            setGroups([])
            setIsLoading(false)
            setError(null)
            return
        }

        setIsLoading(true)
        setError(null)

        const userCache = new Map<number, UserRecord>()
        const fetchUser = async (userId: number) => {
            if (userCache.has(userId)) {
                return userCache.get(userId)!
            }
            const record = await getUserById(userId)
            userCache.set(userId, record)
            return record
        }

        try {
            const groupRows = await listGroupsForUser(user.id)
            const items: GroupListItem[] = await Promise.all(
                groupRows.map(async (row) => {
                    const group = await getGroupById(row.id)
                    const [memberRows, showtimeRows] = await Promise.all([
                        listGroupMembers(row.id),
                        listGroupShowtimes(row.id),
                    ])

                    const memberProfiles: GroupMemberProfile[] = await Promise.all(
                        memberRows.map(async (memberRow) => {
                            const userRecord = await fetchUser(memberRow.user_id)
                            return {
                                userId: memberRow.user_id,
                                username: userRecord.username,
                                email: userRecord.email,
                                accepted: memberRow.accepted,
                                isOwner: memberRow.user_id === group.owner_id,
                            }
                        }),
                    )

                    let ownerName = memberProfiles.find((member) => member.userId === group.owner_id)?.username
                    if (!ownerName) {
                        ownerName = (await fetchUser(group.owner_id)).username
                    }

                    const acceptedMemberCount = memberProfiles.filter((member) => member.accepted).length
                    const pendingMemberCount = memberProfiles.length - acceptedMemberCount
                    const membershipStatus: MembershipStatus = resolveMembershipStatus(memberProfiles, user.id)

                    const showtimes: GroupShowtimeDetail[] = showtimeRows.map((item) => ({
                        id: item.id,
                        finnkinoDbId: item.finnkino_db_id,
                        areaId: item.area_id,
                        dateOfShow: item.dateofshow,
                        createdAt: item.created_at ?? null,
                    }))

                    const upcomingShowtime = findNextShowtime(showtimes)

                    return {
                        id: group.id,
                        name: group.group_name,
                        ownerId: group.owner_id,
                        ownerName,
                        memberCount: memberProfiles.length,
                        acceptedMemberCount,
                        pendingMemberCount,
                        membershipStatus,
                        nextShowtime: upcomingShowtime,
                    }
                }),
            )

            setGroups(items.sort((a, b) => a.name.localeCompare(b.name)))
        } catch (err) {
            console.error("Failed to load groups", err)
            setError("We couldn't load your groups right now. Please try again shortly.")
            setGroups([])
        } finally {
            setIsLoading(false)
        }
    }, [user])

    useEffect(() => {
        loadGroups()
    }, [loadGroups])

    const filteredGroups = useMemo(() => {
        if (!user) return []

        if (filter === "all") {
            return groups
        }

        return groups.filter((group) => group.membershipStatus === filter)
    }, [filter, groups, user])

    const handleCreateGroup = async (values: typeof createGroupForm.values) => {
        if (!user) return
        setIsSubmitting(true)
        try {
            const payload = await createGroup({group_name: values.groupName.trim()})
            notifications.show({
                title: "Group created",
                message: `“${payload.group_name}” is ready. Invite members to get started!`,
                color: "teal",
            })
            setIsCreateModalOpen(false)
            createGroupForm.reset()
            await loadGroups()
        } catch (err) {
            console.error("Failed to create group", err)
            notifications.show({
                title: "Unable to create group",
                message: "Please double-check the name and try again.",
                color: "red",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAcceptInvite = async (groupId: number) => {
        setAcceptingGroupId(groupId)
        try {
            await acceptGroupMembership(groupId)
            notifications.show({
                title: "Invitation accepted",
                message: "You're now an active member of this group.",
                color: "teal",
            })
            await loadGroups()
        } catch (err) {
            console.error("Failed to accept invitation", err)
            notifications.show({
                title: "Unable to accept invitation",
                message: "Please try again in a moment.",
                color: "red",
            })
        } finally {
            setAcceptingGroupId(null)
        }
    }

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
                    {user && (
                        <Badge size="lg" variant="light" color="blue">
                            {groups.length} {groups.length === 1 ? "group" : "groups"}
                        </Badge>
                    )}
                    {!user && (
                        <Badge size="lg" variant="light" color="blue">
                            Demo mode
                        </Badge>
                    )}
                </Group>

                {user && (
                    <Group justify="space-between">
                        <Button onClick={() => setIsCreateModalOpen(true)}>Create group</Button>
                        <Box hidden={groups.length > 0}>
                            <Text size="sm" c="dimmed">
                                You haven't joined any groups yet. Create one to get started.
                            </Text>
                        </Box>
                    </Group>
                )}

                <Box>
                    <SegmentedControl
                        value={filter}
                        onChange={(value) => setFilter(value as FilterValue)}
                        data={filters}
                        size="md"
                        disabled={!user || groups.length === 0}
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

                {user && isLoading && (
                    <Group justify="center" py="xl">
                        <Loader/>
                    </Group>
                )}

                {user && !isLoading && error && (
                    <Alert variant="light" color="red" title="Unable to load groups">
                        {error}
                    </Alert>
                )}

                {user && !isLoading && !error && filteredGroups.length === 0 && (
                    <Alert variant="light" color="gray" title="No groups found">
                        You don't have any groups that match this filter yet. Create a new group or ask an
                        existing owner to invite you.
                    </Alert>
                )}

                {user && !isLoading && !error && filteredGroups.length > 0 && (
                    <SimpleGrid cols={{base: 1, sm: 2, lg: 3}} spacing="lg">
                        {filteredGroups.map((group) => (
                            <GroupSummaryCard
                                key={group.id}
                                group={group}
                                onViewGroup={(id) => navigate(`/groups/${id}`)}
                                onAcceptInvitation={
                                    group.membershipStatus === "invited"
                                        ? () => handleAcceptInvite(group.id)
                                        : undefined
                                }
                                acceptInProgress={acceptingGroupId === group.id}
                            />
                        ))}
                    </SimpleGrid>
                )}
            </Stack>

            <Modal
                opened={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false)
                    createGroupForm.reset()
                }}
                title="Create a new group"
            >
                <form onSubmit={createGroupForm.onSubmit(handleCreateGroup)}>
                    <Stack gap="md">
                        <TextInput
                            label="Group name"
                            placeholder="Finnkino Fridays"
                            withAsterisk
                            {...createGroupForm.getInputProps("groupName")}
                        />
                        <Group justify="flex-end">
                            <Button variant="subtle" onClick={() => setIsCreateModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={isSubmitting}>
                                Create group
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Container>
    )
}

export default GroupsListView
