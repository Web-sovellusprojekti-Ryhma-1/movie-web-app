import { axiosPrivate } from './Axios.ts'
import type { SignUpType, LoginType } from '../types/user.ts'

export const SignUpRequest = async (userData: SignUpType) => {
        const response = await axiosPrivate.post("api/user/signup", userData)
        return response.data
}

export const LoginRequest = async (userData: LoginType) => {
        const response = await axiosPrivate.post("api/user/signin", userData)
        return response.data
}