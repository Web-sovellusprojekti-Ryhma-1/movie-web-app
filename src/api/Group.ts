import type {ApiResponse, PostgresResult} from "../types/api"
import type {GroupMemberRecord, GroupRecord, GroupShowtimeRecord, UserGroupRow,} from "../types/group"
import {axiosPrivate} from "./Axios.ts"

interface CreateGroupPayload {
    group_name: string
}

interface AddGroupMemberPayload {
    member: {group_id: number; user_id: number}
}

interface CreateGroupShowtimePayload {
    showtime: {finnkino_db_id: string; area_id: string; dateofshow: string}
}

const normaliseRows = <T>(payload: PostgresResult<T> | T[] | null | undefined): T[] => {
    if (Array.isArray(payload)) {
        return payload as T[]
    }

    if (payload && typeof payload === "object" && "rows" in payload) {
        const rows = (payload as PostgresResult<T>).rows
        if (Array.isArray(rows)) {
            return rows
        }
    }

    return []
}

export const getGroupById = async (id: number): Promise<GroupRecord> => {
    const {data} = await axiosPrivate.get<ApiResponse<GroupRecord>>(`api/group/${id}`)
    return data.data
}

export const createGroup = async (payload: CreateGroupPayload): Promise<GroupRecord> => {
    const {data} = await axiosPrivate.post<ApiResponse<GroupRecord>>(`api/group`, payload)
    return data.data
}

export const deleteGroup = async (id: number): Promise<null> => {
    const {data} = await axiosPrivate.delete<ApiResponse<null>>(`api/group/${id}`)
    return data.data
}

export const listGroupMembers = async (groupId: number): Promise<GroupMemberRecord[]> => {
    const {data} = await axiosPrivate.get<ApiResponse<PostgresResult<GroupMemberRecord>>>(
        `api/group/${groupId}/members`,
    )
    return normaliseRows<GroupMemberRecord>(data.data)
}

export const listGroupsForUser = async (userId: number): Promise<UserGroupRow[]> => {
    const {data} = await axiosPrivate.get<ApiResponse<PostgresResult<UserGroupRow>>>(
        `api/group/user/${userId}/groups`,
    )
    return normaliseRows<UserGroupRow>(data.data)
}

export const acceptGroupMembership = async (groupId: number): Promise<GroupMemberRecord> => {
    const {data} = await axiosPrivate.put<ApiResponse<GroupMemberRecord>>(`api/group/${groupId}/members`)
    return data.data
}

export const inviteGroupMember = async (payload: AddGroupMemberPayload): Promise<GroupMemberRecord> => {
    const {data} = await axiosPrivate.post<ApiResponse<GroupMemberRecord>>(`api/group/members`, payload)
    return data.data
}

export const removeGroupMember = async (groupId: number, userId: number): Promise<GroupMemberRecord | null> => {
    const {data} = await axiosPrivate.delete<ApiResponse<GroupMemberRecord | null>>(
        `api/group/${groupId}/members/${userId}`,
    )
    return data.data
}

export const listGroupShowtimes = async (groupId: number): Promise<GroupShowtimeRecord[]> => {
    const {data} = await axiosPrivate.get<ApiResponse<PostgresResult<GroupShowtimeRecord>>>(
        `api/group/${groupId}/showtime`,
    )
    return normaliseRows<GroupShowtimeRecord>(data.data)
}

export const createGroupShowtime = async (
    groupId: number,
    payload: CreateGroupShowtimePayload,
): Promise<GroupShowtimeRecord> => {
    const {data} = await axiosPrivate.post<ApiResponse<GroupShowtimeRecord>>(
        `api/group/${groupId}/showtime`,
        payload,
    )
    return data.data
}

export const removeGroupShowtime = async (groupId: number, showtimeId: number): Promise<GroupShowtimeRecord | null> => {
    const {data} = await axiosPrivate.delete<ApiResponse<GroupShowtimeRecord | null>>(
        `api/group/${groupId}/showtime/${showtimeId}`,
    )
    return data.data
}
