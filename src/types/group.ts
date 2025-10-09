export interface GroupRecord {
    id: number
    group_name: string
    owner_id: number
    created_at?: string | null
    description?: string | null
}

export interface GroupMemberRecord {
    id: number
    group_id: number
    user_id: number
    accepted: boolean
    created_at?: string | null
}

export interface GroupMemberProfile {
    userId: number
    username: string
    email: string
    accepted: boolean
    isOwner: boolean
}

export interface GroupShowtimeRecord {
    id: number
    group_id: number
    finnkino_db_id: string
    area_id: string
    dateofshow: string
    created_at?: string | null
}

export interface GroupShowtimeDetail {
    id: number
    finnkinoDbId: string
    areaId: string
    dateOfShow: string
    createdAt?: string | null
    matchTitle?: string
    theatreName?: string
}

export type MembershipStatus = "owner" | "member" | "invited" | "unknown"

export interface GroupListItem {
    id: number
    name: string
    ownerId: number
    ownerName?: string
    memberCount: number
    acceptedMemberCount: number
    pendingMemberCount: number
    membershipStatus: MembershipStatus
    nextShowtime?: GroupShowtimeDetail | null
}

export interface GroupDetails {
    group: GroupRecord
    members: GroupMemberProfile[]
    showtimes: GroupShowtimeDetail[]
    owner?: GroupMemberProfile
}

export interface UserGroupRow {
    id: number
    group_name: string
    owner_id?: number
    accepted?: boolean
}
