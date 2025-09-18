import React, { useState, useContext } from 'react'
import { SignUpService, LoginService } from '../api/Auth.ts';

export interface SignUpType {
    user: { username: string; email: string; password: string }
}

export interface LoginType {
    user: { email: string; password: string }
}

interface AuthContextType {
  user: { id: number; username: string; email: string; password: string; token: string } | null;
  Login: (userData: LoginType) => Promise<void>;
  SignUp: (userData: SignUpType) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType>({ user: null, SignUp: async () => {}, Login: async () => {} })

export function UseAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({children}: {children: React.ReactNode}) {
    const userFromStorage = sessionStorage.getItem('user')

    const [user, setUser] = useState(userFromStorage ? JSON.parse(userFromStorage) : {id: '', username: '', email: '', password: '', token: ''})

    const SignUp = async (userData: SignUpType) => {
        await SignUpService(userData)
        setUser({username: '', email: '', password: ''})
    }

    const Login = async (userData: LoginType) => {
        const response = await LoginService(userData)
        setUser(response.data.data)
        sessionStorage.setItem('user', response.data.data)
    }

    return (
        <AuthContext.Provider value={{user, SignUp, Login}}>
            {children}
        </AuthContext.Provider>
    )
}