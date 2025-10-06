import { useState, useContext, createContext } from 'react'
import type { ReactNode } from 'react';
import { SignUpRequest, LoginRequest } from '../api/Auth.ts';
import type { UserType, SignUpType, LoginType } from '../types/user.ts';

interface AuthContextType extends UserType {
  Login: (userData: LoginType) => Promise<void>
  SignUp: (userData: SignUpType) => Promise<void>
  LogOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>(
    { user: null, SignUp: async () => {}, Login: async () => {}, LogOut: async () => {} }
)

export function UseAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({children}: {children: ReactNode}) {
    const userFromStorage = sessionStorage.getItem('user')

    // Get user from session storage if it exists
    const [user, setUser] = useState(userFromStorage ? JSON.parse(userFromStorage) : null)

    const SignUp = async (userData: SignUpType) => {
        await SignUpRequest(userData)
        setUser(null)
    }

    const Login = async (userData: LoginType) => {
        const response = await LoginRequest(userData) as { data: UserType }
        setUser(response.data)
        sessionStorage.setItem('user', JSON.stringify(response.data))
    }

    const LogOut = async () => {
        setUser(null)
        sessionStorage.removeItem('user')
    }

    
    return (
        <AuthContext.Provider value={{user, SignUp, Login, LogOut}}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext };