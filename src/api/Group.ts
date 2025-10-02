import { axiosPrivate } from './Axios.ts'

interface memberType {
    member: {group_id: number, user_id: number}
}

// Group
export const GroupById = async (id: number) => {
        const response = await axiosPrivate.get(`api/group/${id}`)
        return response.data
}

export const PostGroup = async (groupName: string) => {
        const response = await axiosPrivate.post(`api/group`, groupName)
        return response.data
}

export const DeleteGroup = async (id: number) => {
        const response = await axiosPrivate.delete(`api/group/${id}`)
        return response.data
}

//Group members
export const GroupMembersByGroupId = async (id: number) => {
        const response = await axiosPrivate.get(`api/group/${id}/members`)
        return response.data
}

export const GroupsUserIsMemberOf = async (id: number) => {
        const response = await axiosPrivate.get(`api/group/user/${id}/groups`)
        return response.data
}

export const UpdateUserAccepted = async (id: number) => {
        const response = await axiosPrivate.put(`api/group/${id}/members`)
        return response.data
}

export const AddGroupMember = async (memberData: memberType) => {
        const response = await axiosPrivate.post(`api/group/members`, memberData)
        return response.data
}

export const RemoveMember = async (groupId: number, userId: number) => {
        const response = await axiosPrivate.delete(`api/group/${groupId}/members/${userId}`)
        return response.data
}