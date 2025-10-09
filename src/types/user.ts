export interface SignUpType {
    user: {username: string; email: string; password: string}
}

export interface LoginType {
    user: {email: string; password: string}
}

export interface UserType {
    user: {id: number; username: string; email: string; token: string} | null
}

export interface UserRecord {
    id: number
    username: string
    email: string
}
