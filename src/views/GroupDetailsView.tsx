import {
    Alert,
    Button,
    Container,
    Group,
    Loader,
    Modal,
    NumberInput,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
} from "@mantine/core"
import {DateInput} from "@mantine/dates"
import {useForm} from "@mantine/form"
import {useDisclosure} from "@mantine/hooks"
import {notifications} from "@mantine/notifications"
import {IconCalendarPlus, IconInfoCircle, IconTrash, IconUserPlus} from "@tabler/icons-react"
import dayjs from "dayjs"
import {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {useLocation, useRoute} from "wouter"
import {
    acceptGroupMembership,
    createGroupShowtime,
    deleteGroup,
    getGroupById,
    inviteGroupMember,
    listGroupMembers,
    listGroupShowtimes,
    removeGroupMember,
    removeGroupShowtime,
} from "../api/Group"
import {getUserById} from "../api/User"
import {GroupHeader} from "../components/groups/GroupHeader"
import {GroupMembersSection} from "../components/groups/GroupMembersSection"
import {GroupShowtimesSection} from "../components/groups/GroupShowtimesSection"
import {UseAuth} from "../context/AuthProvider"
import {findNextShowtime, resolveMembershipStatus} from "../helpers/groupHelpers"
import type {GroupDetails, GroupMemberProfile, GroupShowtimeDetail, MembershipStatus,} from "../types/group"
import type {UserRecord} from "../types/user"

const GroupDetailsView = () => {
    const [match, params] = useRoute("/groups/:id")
    const [, navigate] = useLocation()
    const groupId = params?.id ? Number(params.id) : undefined

    const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isBusy, setIsBusy] = useState(false)
    const [memberRemovalCandidate, setMemberRemovalCandidate] = useState<GroupMemberProfile | null>(null)
    const [showSettingsModal, settingsModalHandlers] = useDisclosure(false)
    const [inviteModalOpen, setInviteModalOpen] = useState(false)
    const [showtimeModalOpen, setShowtimeModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)

    const inviteForm = useForm({
        initialValues: {
            userId: undefined as number | undefined,
        },
        validate: {
            userId: (value) =>
                typeof value === "number" && Number.isInteger(value) && value > 0
                    ? null
                    : "Enter a valid user ID",
        },
    })

    const showtimeForm = useForm({
        initialValues: {
            finnkinoDbId: "",
            areaId: "",
            date: null as Date | null,
        },
        validate: {
            finnkinoDbId: (value) => (value.trim().length === 0 ? "Required" : null),
            areaId: (value) => (value.trim().length === 0 ? "Required" : null),
            date: (value) => (value ? null : "Select a date"),
        },
    })

    const userCacheRef = useRef<Map<number, UserRecord>>(new Map())

    const fetchUser = useCallback(async (userId: number) => {
        if (userCacheRef.current.has(userId)) {
            return userCacheRef.current.get(userId)!
        }
        const userRecord = await getUserById(userId)
        userCacheRef.current.set(userId, userRecord)
        return userRecord
    }, [])

    const {user} = UseAuth()

    const currentUserId = user?.id

    const membershipStatus: MembershipStatus = useMemo(
        () => resolveMembershipStatus(groupDetails?.members ?? [], currentUserId),
        [currentUserId, groupDetails?.members],
    )

    const isOwner = membershipStatus === "owner"

    const nextShowtime = useMemo(
        () => findNextShowtime(groupDetails?.showtimes ?? []),
        [groupDetails?.showtimes],
    )

    const nextShowtimeLabel = useMemo(() => {
        if (!groupDetails) return undefined
        if (!nextShowtime) {
            return groupDetails.showtimes.length > 0 ? "All listed screenings are in the past" : undefined
        }

        return `Next screening on ${dayjs(nextShowtime.dateOfShow).format("MMM D, YYYY")}`
    }, [groupDetails, nextShowtime])

    const loadGroupDetails = useCallback(async () => {
        if (!groupId || !match) {
            setGroupDetails(null)
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const group = await getGroupById(groupId)
            const [memberRows, showtimeRows] = await Promise.all([
                listGroupMembers(groupId),
                listGroupShowtimes(groupId),
            ])

            const memberProfiles: GroupMemberProfile[] = await Promise.all(
                memberRows.map(async (row) => {
                    const userRecord = await fetchUser(row.user_id)
                    return {
                        userId: row.user_id,
                        username: userRecord.username,
                        email: userRecord.email,
                        accepted: row.accepted,
                        isOwner: row.user_id === group.owner_id,
                    }
                }),
            )

            let ownerProfile = memberProfiles.find((member) => member.userId === group.owner_id)
            if (!ownerProfile) {
                const ownerUser = await fetchUser(group.owner_id)
                ownerProfile = {
                    userId: ownerUser.id,
                    username: ownerUser.username,
                    email: ownerUser.email,
                    accepted: true,
                    isOwner: true,
                }
                memberProfiles.push(ownerProfile)
            }

            const showtimes: GroupShowtimeDetail[] = showtimeRows.map((item) => ({
                id: item.id,
                finnkinoDbId: item.finnkino_db_id,
                areaId: item.area_id,
                dateOfShow: item.dateofshow,
                createdAt: item.created_at ?? null,
            }))

            setGroupDetails({
                group,
                members: memberProfiles,
                showtimes,
                owner: ownerProfile,
            })
        } catch (err) {
            console.error("Failed to load group", err)
            setError("We couldn't load this group right now. Please try again in a moment.")
            setGroupDetails(null)
        } finally {
            setIsLoading(false)
        }
    }, [fetchUser, groupId, match])

    useEffect(() => {
        loadGroupDetails()
    }, [loadGroupDetails])

    useEffect(() => {
        if (!groupId) {
            return
        }

        const handleShowtimeAdded = (event: Event) => {
            const customEvent = event as CustomEvent<{groupId?: number}>
            if (customEvent.detail?.groupId === groupId) {
                void loadGroupDetails()
            }
        }

        window.addEventListener("group-showtime-added", handleShowtimeAdded)
        return () => {
            window.removeEventListener("group-showtime-added", handleShowtimeAdded)
        }
    }, [groupId, loadGroupDetails])

    const handleRemoveShowtime = async (showtimeId: number) => {
        if (!groupId) return
        setIsBusy(true)
        try {
            await removeGroupShowtime(groupId, showtimeId)
            setGroupDetails((prev) => {
                if (!prev) return prev
                return {
                    ...prev,
                    showtimes: prev.showtimes.filter((show) => show.id !== showtimeId),
                }
            })
            notifications.show({
                title: "Showtime removed",
                message: "The showtime has been deleted from this group.",
                color: "teal",
            })
        } catch (err) {
            console.error("Failed to remove showtime", err)
            notifications.show({
                title: "Unable to remove showtime",
                message: "Please try again in a moment.",
                color: "red",
            })
        } finally {
            setIsBusy(false)
        }
    }

    const handleRemoveMember = async (memberId: number) => {
        if (!groupId) return
        setIsBusy(true)
        try {
            await removeGroupMember(groupId, memberId)
            setGroupDetails((prev) => {
                if (!prev) return prev
                return {
                    ...prev,
                    members: prev.members.filter((member) => member.userId !== memberId),
                }
            })
            notifications.show({
                title: "Member removed",
                message: "The member no longer has access to this group.",
                color: "teal",
            })
            setMemberRemovalCandidate(null)
        } catch (err) {
            console.error("Failed to remove member", err)
            notifications.show({
                title: "Unable to remove member",
                message: "Please try again in a moment.",
                color: "red",
            })
        } finally {
            setIsBusy(false)
        }
    }

    const handleAcceptInvitation = async () => {
        if (!groupId) return
        setIsBusy(true)
        try {
            await acceptGroupMembership(groupId)
            setGroupDetails((prev) => {
                if (!prev || !currentUserId) return prev
                return {
                    ...prev,
                    members: prev.members.map((member) =>
                        member.userId === currentUserId
                            ? {...member, accepted: true}
                            : member,
                    ),
                }
            })
            notifications.show({
                title: "Invitation accepted",
                message: "You are now an active member of this group.",
                color: "teal",
            })
        } catch (err) {
            console.error("Failed to accept invitation", err)
            notifications.show({
                title: "Unable to accept invitation",
                message: "Please try again in a moment.",
                color: "red",
            })
        } finally {
            setIsBusy(false)
        }
    }

    const handleInviteMember = async (values: typeof inviteForm.values) => {
        if (!groupId || values.userId === undefined) return
        setIsBusy(true)
        try {
            const record = await inviteGroupMember({member: {group_id: groupId, user_id: values.userId}})
            const userRecord = await fetchUser(record.user_id)
            setGroupDetails((prev) => {
                if (!prev) return prev
                if (prev.members.some((member) => member.userId === record.user_id)) {
                    return prev
                }
                const newMember: GroupMemberProfile = {
                    userId: record.user_id,
                    username: userRecord.username,
                    email: userRecord.email,
                    accepted: record.accepted,
                    isOwner: record.user_id === prev.group.owner_id,
                }
                return {
                    ...prev,
                    members: [...prev.members, newMember],
                }
            })
            notifications.show({
                title: "Invitation sent",
                message: "The user has been invited to your group.",
                color: "teal",
            })
            inviteForm.reset()
            setInviteModalOpen(false)
        } catch (err) {
            console.error("Failed to invite member", err)
            notifications.show({
                title: "Unable to invite member",
                message: "Please verify the user ID and try again.",
                color: "red",
            })
        } finally {
            setIsBusy(false)
        }
    }

    const handleAddShowtime = async (values: typeof showtimeForm.values) => {
        if (!groupId || !values.date) return
        setIsBusy(true)
        try {
            const formattedDate = dayjs(values.date).format("YYYY-MM-DD")
            const record = await createGroupShowtime(groupId, {
                showtime: {
                    finnkino_db_id: values.finnkinoDbId.trim(),
                    area_id: values.areaId.trim(),
                    dateofshow: formattedDate,
                },
            })
            setGroupDetails((prev) => {
                if (!prev) return prev
                const detail: GroupShowtimeDetail = {
                    id: record.id,
                    finnkinoDbId: record.finnkino_db_id,
                    areaId: record.area_id,
                    dateOfShow: record.dateofshow,
                    createdAt: record.created_at ?? null,
                }
                return {
                    ...prev,
                    showtimes: [...prev.showtimes, detail],
                }
            })
            notifications.show({
                title: "Showtime added",
                message: "The Finnkino screening has been scheduled.",
                color: "teal",
            })
            showtimeForm.reset()
            setShowtimeModalOpen(false)
        } catch (err) {
            console.error("Failed to add showtime", err)
            notifications.show({
                title: "Unable to add showtime",
                message: "Please verify the details and try again.",
                color: "red",
            })
        } finally {
            setIsBusy(false)
        }
    }

    const handleDeleteGroup = async () => {
        if (!groupId) return
        setIsBusy(true)
        try {
            await deleteGroup(groupId)
            notifications.show({
                title: "Group deleted",
                message: "The group has been removed successfully.",
                color: "teal",
            })
            setDeleteModalOpen(false)
            navigate("/groups")
        } catch (err) {
            console.error("Failed to delete group", err)
            notifications.show({
                title: "Unable to delete group",
                message: "Please try again in a moment.",
                color: "red",
            })
        } finally {
            setIsBusy(false)
        }
    }

    const handleLeaveGroup = async () => {
        if (!groupId || !currentUserId) return
        if (isOwner) {
            notifications.show({
                title: "Owners cannot leave",
                message: "Transfer ownership before leaving the group.",
                color: "yellow",
            })
            settingsModalHandlers.open()
            return
        }

        setIsBusy(true)
        try {
            await removeGroupMember(groupId, currentUserId)
            notifications.show({
                title: "You left the group",
                message: "You can join again if invited.",
                color: "teal",
            })
            navigate("/groups")
        } catch (err) {
            console.error("Failed to leave group", err)
            notifications.show({
                title: "Unable to leave",
                message: "Please try again in a moment.",
                color: "red",
            })
        } finally {
            setIsBusy(false)
        }
    }

    if (isLoading) {
        return (
            <Container size="lg" py="xl">
                <Group justify="center">
                    <Loader/>
                </Group>
            </Container>
        )
    }

    if (!groupDetails) {
        return (
            <Container size="lg" py="xl">
                <Alert color="red" variant="light" title="Group not found">
                    {error ?? "This group is unavailable."}
                </Alert>
            </Container>
        )
    }

    const currentMember = currentUserId
        ? groupDetails.members.find((member) => member.userId === currentUserId)
        : undefined

    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                {error && (
                    <Alert
                        color="yellow" variant="light" icon={<IconInfoCircle size={18}/>}
                        withCloseButton onClose={() => setError(null)}
                    >
                        {error}
                    </Alert>
                )}

                <GroupHeader
                    group={groupDetails.group}
                    owner={groupDetails.owner}
                    membershipStatus={membershipStatus === "unknown" ? "viewer" : membershipStatus}
                    nextShowtimeLabel={nextShowtimeLabel}
                    onOpenSettings={isOwner ? settingsModalHandlers.open : undefined}
                />

                {isOwner && (
                    <Group gap="sm">
                        <Button
                            leftSection={<IconCalendarPlus size={16}/>}
                            onClick={() => setShowtimeModalOpen(true)}
                            disabled={isBusy}
                        >
                            Schedule showtime
                        </Button>
                        <Button
                            variant="outline"
                            leftSection={<IconUserPlus size={16}/>}
                            onClick={() => setInviteModalOpen(true)}
                            disabled={isBusy}
                        >
                            Invite member
                        </Button>
                        <Button
                            variant="light"
                            color="red"
                            leftSection={<IconTrash size={16}/>}
                            onClick={() => setDeleteModalOpen(true)}
                            disabled={isBusy}
                        >
                            Delete group
                        </Button>
                    </Group>
                )}

                <SimpleGrid cols={{base: 1, md: 2}} spacing="xl">
                    <GroupShowtimesSection
                        showtimes={groupDetails.showtimes}
                        isOwner={isOwner}
                        isBusy={isBusy}
                        onRemoveShowtime={handleRemoveShowtime}
                    />
                    <GroupMembersSection
                        members={groupDetails.members}
                        ownerId={groupDetails.group.owner_id}
                        currentUserId={currentUserId}
                        isOwner={isOwner}
                        isBusy={isBusy}
                        onRemoveMember={(memberId) => {
                            const member = groupDetails.members.find((item) => item.userId === memberId)
                            if (!member) return
                            setMemberRemovalCandidate(member)
                        }}
                        onLeaveGroup={handleLeaveGroup}
                        onAcceptInvitation={currentMember && !currentMember.accepted ? handleAcceptInvitation : undefined}
                    />
                </SimpleGrid>
            </Stack>

            <Modal opened={showSettingsModal} onClose={settingsModalHandlers.close} title="Group settings">
                <Stack gap="sm">
                    <Text size="sm" c="dimmed">
                        Settings editing will arrive in a future update. For now you can manage invitations and
                        showtimes directly from this page.
                    </Text>
                    <Button onClick={settingsModalHandlers.close}>Close</Button>
                </Stack>
            </Modal>

            <Modal
                opened={inviteModalOpen}
                onClose={() => {
                    setInviteModalOpen(false)
                    inviteForm.reset()
                }}
                title="Invite a member"
            >
                <form onSubmit={inviteForm.onSubmit(handleInviteMember)}>
                    <Stack gap="md">
                        <NumberInput
                            label="User ID"
                            description="Provide the numeric ID of the user you want to invite."
                            withAsterisk
                            min={1}
                            clampBehavior="strict"
                            {...inviteForm.getInputProps("userId")}
                        />
                        <Group justify="flex-end">
                            <Button
                                type="button"
                                variant="subtle"
                                onClick={() => setInviteModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" loading={isBusy}>
                                Send invite
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            <Modal
                opened={showtimeModalOpen}
                onClose={() => {
                    setShowtimeModalOpen(false)
                    showtimeForm.reset()
                }}
                title="Schedule showtime"
            >
                <form onSubmit={showtimeForm.onSubmit(handleAddShowtime)}>
                    <Stack gap="md">
                        <TextInput
                            label="Finnkino event ID"
                            placeholder="123456"
                            withAsterisk
                            {...showtimeForm.getInputProps("finnkinoDbId")}
                        />
                        <TextInput
                            label="Area ID"
                            placeholder="1013"
                            withAsterisk
                            {...showtimeForm.getInputProps("areaId")}
                        />
                        <DateInput
                            label="Date of show"
                            valueFormat="YYYY-MM-DD"
                            withAsterisk
                            {...showtimeForm.getInputProps("date")}
                        />
                        <Group justify="flex-end">
                            <Button
                                type="button"
                                variant="subtle"
                                onClick={() => setShowtimeModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" loading={isBusy}>
                                Add showtime
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete group">
                <Stack gap="md">
                    <Alert color="red" icon={<IconInfoCircle size={18}/>} variant="light">
                        Deleting this group will remove pending invitations and scheduled showtimes. This action cannot
                        be undone.
                    </Alert>
                    <Group justify="flex-end">
                        <Button variant="subtle" onClick={() => setDeleteModalOpen(false)} disabled={isBusy}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={handleDeleteGroup} loading={isBusy}>
                            Delete group
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal
                opened={memberRemovalCandidate !== null}
                onClose={() => setMemberRemovalCandidate(null)}
                title="Remove member"
            >
                <Stack gap="md">
                    <Alert color="yellow" icon={<IconInfoCircle size={18}/>} variant="light">
                        Removing a member immediately revokes their access to this group.
                    </Alert>
                    <Text>
                        Do you want to remove {memberRemovalCandidate?.username} from the group?
                    </Text>
                    <Group justify="flex-end">
                        <Button variant="outline" onClick={() => setMemberRemovalCandidate(null)} disabled={isBusy}>
                            Cancel
                        </Button>
                        <Button
                            color="red"
                            onClick={() => memberRemovalCandidate && handleRemoveMember(memberRemovalCandidate.userId)}
                            disabled={isBusy}
                        >
                            Remove
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    )
}

export default GroupDetailsView
