import React, { useState, useContext } from 'react'
import { SignUpService } from '../api/Auth.ts';

export interface SignUpType {
    user: {username: string; email: string; password: string }
}

interface AuthContextType {
  user: { username: string; email: string; password: string; token: string } | null;
  //Login: (userData: { email: string; password: string }) => Promise<void>;
  SignUp: (userData: SignUpType) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType>({user: null, SignUp: async () => {}})

export function UseAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({children}: {children: React.ReactNode}) {
    const userFromStorage = sessionStorage.getItem('user')

    const [user, setUser] = useState(userFromStorage ? JSON.parse(userFromStorage) : {username: '', email: '', password: ''})

    const SignUp = async (userData: SignUpType) => {
        const response = await SignUpService(userData)
        console.log(response)
        setUser({username: '', email: '', password: ''})
    }

    return (
        <AuthContext.Provider value={{user, SignUp}}>
            {children}
        </AuthContext.Provider>
    )
}