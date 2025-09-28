import { axiosPrivate } from './Axios.ts'
import type { SignUpType, LoginType } from '../context/AuthProvider.tsx'

export const SignUpRequest = async (userData: SignUpType) => {
        const response = await axiosPrivate.post("user/signup", userData)
        return response.data
}

export const LoginRequest = async (userData: LoginType) => {
        const response = await axiosPrivate.post("user/signin", userData)
        return response.data
}