import {
  Alert,
  Button,
  Container,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useRoute } from "wouter"
import { IconCheck, IconInfoCircle } from "@tabler/icons-react"
import { UseAuth } from "../context/AuthProvider"
import { mockGroups } from "../data/mockGroups"
import type { GroupMember, GroupSummary } from "../types/group"
import { GroupHeader } from "../components/groups/GroupHeader"
import { GroupShowtimesSection } from "../components/groups/GroupShowtimesSection"
import { GroupMembersSection } from "../components/groups/GroupMembersSection"
import { GroupJoinRequestsSection } from "../components/groups/GroupJoinRequestsSection"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

const GroupDetailsView = () => {
  const [match, params] = useRoute("/groups/:id")
  const [, navigate] = useLocation()
  const groupId = params?.id ? Number(params.id) : undefined

  const [group, setGroup] = useState<GroupSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [showSettingsModal, settingsModalHandlers] = useDisclosure(false)
  const [memberRemovalCandidate, setMemberRemovalCandidate] = useState<GroupMember | null>(null)

  const { user } = UseAuth()

  useEffect(() => {
    if (!match || !groupId) {
      setIsLoading(false)
      return
    }

  const existingGroup = mockGroups.find((item) => item.id === groupId) ?? null
  setGroup(existingGroup ? JSON.parse(JSON.stringify(existingGroup)) : null)
    setIsLoading(false)
  }, [groupId, match])

  const currentUserId = useMemo(() => {
    if (user) return user.id
    return group?.ownerId
  }, [group?.ownerId, user])

  const isOwner = group ? currentUserId === group.ownerId : false

  const nextShowtimeLabel = useMemo(() => {
    if (!group || group.showtimes.length === 0) {
      return "No upcoming theatre times yet"
    }

    const next = [...group.showtimes]
      .sort((a, b) => dayjs(a.startsAt).valueOf() - dayjs(b.startsAt).valueOf())
      .find((item) => dayjs(item.startsAt).isAfter(dayjs()))

    if (!next) {
      return "All listed screenings are in the past"
    }

    return `Next screening ${dayjs(next.startsAt).fromNow()} at ${next.theatre}`
  }, [group])

  const handleRemoveShowtime = (showtimeId: string) => {
    setGroup((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        showtimes: prev.showtimes.filter((show) => show.id !== showtimeId),
      }
    })
    setFeedback({ type: "success", message: "Showtime removed from the agenda." })
  }

  const handleRemoveMember = (memberId: number) => {
    setGroup((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        members: prev.members.filter((member) => member.id !== memberId),
      }
    })
    setFeedback({ type: "success", message: "Member removed from the group." })
    setMemberRemovalCandidate(null)
  }

  const handleJoinRequestDecision = (requestId: string, decision: "accept" | "decline") => {
    setGroup((prev) => {
      if (!prev) return prev
      const request = prev.pendingRequests.find((item) => item.id === requestId)
      if (!request) return prev

      const updatedRequests = prev.pendingRequests.filter((item) => item.id !== requestId)

      if (decision === "decline") {
        setFeedback({ type: "success", message: `${request.name} has been declined.` })
        return {
          ...prev,
          pendingRequests: updatedRequests,
        }
      }

      const newMember: GroupMember = {
        id: request.userId,
        name: request.name,
        role: "member",
        joinedAt: new Date().toISOString(),
      }

      setFeedback({ type: "success", message: `${request.name} is now part of the group!` })

      return {
        ...prev,
        pendingRequests: updatedRequests,
        members: [...prev.members, newMember],
      }
    })
  }

  const handleLeaveGroup = () => {
    if (!currentUserId || !group) return

    if (isOwner) {
      setFeedback({ type: "error", message: "Group owners can transfer ownership in settings before leaving." })
      settingsModalHandlers.open()
      return
    }

    setGroup((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        members: prev.members.filter((member) => member.id !== currentUserId),
      }
    })
    setFeedback({ type: "success", message: "You have left the group." })
    navigate("/groups")
  }

  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <Group justify="center">
          <Loader />
        </Group>
      </Container>
    )
  }

  if (!group) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red" variant="light" title="Group not found">
          This group doesn&apos;t exist in our demo data yet. Return to the groups overview to try another one.
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {feedback && (
          <Alert
            color={feedback.type === "success" ? "teal" : "red"}
            icon={<IconCheck size={18} />}
            withCloseButton
            onClose={() => setFeedback(null)}
            variant="light"
          >
            {feedback.message}
          </Alert>
        )}

        <GroupHeader
          group={group}
          nextShowtimeLabel={nextShowtimeLabel}
          isOwner={isOwner}
          onOpenSettings={settingsModalHandlers.open}
        />

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <GroupShowtimesSection
            showtimes={group.showtimes}
            members={group.members}
            isOwner={isOwner}
            onRemoveShowtime={handleRemoveShowtime}
          />
          <Stack gap="xl">
            <GroupMembersSection
              members={group.members}
              currentUserId={currentUserId}
              isOwner={isOwner}
              onRemoveMember={(memberId) => {
                const member = group.members.find((person) => person.id === memberId)
                if (!member) return
                setMemberRemovalCandidate(member)
              }}
              onLeaveGroup={handleLeaveGroup}
            />
            <GroupJoinRequestsSection
              requests={group.pendingRequests}
              onDecision={handleJoinRequestDecision}
              isOwner={isOwner}
            />
          </Stack>
        </SimpleGrid>
      </Stack>

      <Modal opened={showSettingsModal} onClose={settingsModalHandlers.close} title="Group settings">
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            Settings editing is not wired to the backend yet. You can imagine controls for invite links, ownership
            transfer, and notification schedules here.
          </Text>
          <Button onClick={settingsModalHandlers.close}>Close</Button>
        </Stack>
      </Modal>

      <Modal
        opened={memberRemovalCandidate !== null}
        onClose={() => setMemberRemovalCandidate(null)}
        title="Remove member"
      >
        <Stack gap="md">
          <Alert color="yellow" icon={<IconInfoCircle size={18} />} variant="light">
            Removing a member is immediate in this demo. In production this will call the backend.
          </Alert>
          <Text>
            Do you want to remove {memberRemovalCandidate?.name} from the group?
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setMemberRemovalCandidate(null)}>
              Cancel
            </Button>
            <Button color="red" onClick={() => memberRemovalCandidate && handleRemoveMember(memberRemovalCandidate.id)}>
              Remove
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}

export default GroupDetailsView
