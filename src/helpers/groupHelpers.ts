import dayjs, {Dayjs} from "dayjs"
import type {GroupMemberProfile, GroupShowtimeDetail, MembershipStatus} from "../types/group"

export const resolveMembershipStatus = (
    members: GroupMemberProfile[],
    userId?: number,
): MembershipStatus => {
    if (!userId) {
        return "unknown"
    }

    const member = members.find((item) => item.userId === userId)
    if (!member) {
        return "unknown"
    }

    if (member.isOwner) {
        return "owner"
    }

    return member.accepted ? "member" : "invited"
}

export const findNextShowtime = (
    showtimes: GroupShowtimeDetail[],
    referenceDate: Dayjs = dayjs(),
): GroupShowtimeDetail | null => {
    if (showtimes.length === 0) {
        return null
    }

    const threshold = referenceDate.startOf("day")

    const ordered = showtimes
        .map((showtime) => ({showtime, date: dayjs(showtime.dateOfShow)}))
        .filter((item) => item.date.isValid())
        .filter((item) => item.date.isAfter(threshold.subtract(1, "day")))
        .sort((a, b) => a.date.valueOf() - b.date.valueOf())

    return ordered[0]?.showtime ?? null
}
