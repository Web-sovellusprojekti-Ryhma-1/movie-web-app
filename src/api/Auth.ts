import { axiosPrivate } from './Axios.ts'
import type { SignUpType, LoginType } from '../contexts/AuthProvider'

export const SignUpService = async (userData: SignUpType) => {
        return await axiosPrivate.post("/signup", userData)
}

export const LoginService = async (userData: LoginType) => {
        return await axiosPrivate.post("/signin", userData)
}