export type GroupRole = "owner" | "admin" | "member"

export interface GroupMember {
  id: number
  name: string
  role: GroupRole
  avatarUrl?: string
  joinedAt: string
}

export interface GroupShowtime {
  id: string
  movieTitle: string
  theatre: string
  startsAt: string
  addedBy: number
  notes?: string
}

export interface GroupJoinRequest {
  id: string
  userId: number
  name: string
  requestedAt: string
  message?: string
}

export interface GroupSummary {
  id: number
  name: string
  description: string
  ownerId: number
  tags: string[]
  coverImage: string
  members: GroupMember[]
  showtimes: GroupShowtime[]
  pendingRequests: GroupJoinRequest[]
  createdAt: string
}
