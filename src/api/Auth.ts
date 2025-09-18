import { axiosPrivate } from '../lib/Axios'
import type { SignUpType } from '../contexts/AuthProvider'

export const SignUpService = async (userData: SignUpType) => {
        return await axiosPrivate.post("/signup", userData)
}