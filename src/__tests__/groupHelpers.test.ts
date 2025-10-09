import dayjs from "dayjs"
import {describe, expect, it} from "vitest"
import {findNextShowtime, resolveMembershipStatus} from "../helpers/groupHelpers"
import type {GroupMemberProfile, GroupShowtimeDetail} from "../types/group"

describe("resolveMembershipStatus", () => {
    const baseMembers: GroupMemberProfile[] = [
        {userId: 1, username: "Owner", email: "owner@example.com", accepted: true, isOwner: true},
        {userId: 2, username: "Member", email: "member@example.com", accepted: true, isOwner: false},
        {userId: 3, username: "Invited", email: "invite@example.com", accepted: false, isOwner: false},
    ]

    it("returns 'unknown' when user id is missing", () => {
        expect(resolveMembershipStatus(baseMembers)).toBe("unknown")
    })

    it("returns 'owner' for the group owner", () => {
        expect(resolveMembershipStatus(baseMembers, 1)).toBe("owner")
    })

    it("returns 'member' for accepted members", () => {
        expect(resolveMembershipStatus(baseMembers, 2)).toBe("member")
    })

    it("returns 'invited' for pending invitations", () => {
        expect(resolveMembershipStatus(baseMembers, 3)).toBe("invited")
    })

    it("returns 'unknown' when the user is not part of the group", () => {
        expect(resolveMembershipStatus(baseMembers, 999)).toBe("unknown")
    })
})

describe("findNextShowtime", () => {
    const showtimes: GroupShowtimeDetail[] = [
        {id: 1, finnkinoDbId: "100", areaId: "10", dateOfShow: "2024-01-05", createdAt: null},
        {id: 2, finnkinoDbId: "200", areaId: "20", dateOfShow: "2025-05-10", createdAt: null},
        {id: 3, finnkinoDbId: "300", areaId: "30", dateOfShow: "2025-01-01", createdAt: null},
    ]

    it("returns null when no showtimes are provided", () => {
        expect(findNextShowtime([])).toBeNull()
    })

    it("returns the closest upcoming showtime relative to the reference date", () => {
        const reference = dayjs("2025-01-01")
        const result = findNextShowtime(showtimes, reference)
        expect(result?.id).toBe(3)
    })

    it("ignores past showtimes", () => {
        const reference = dayjs("2025-06-01")
        const result = findNextShowtime(showtimes, reference)
        expect(result).toBeNull()
    })
})
