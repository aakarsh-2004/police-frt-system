import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config/config';

interface User {
    id: string;
    username: string;
    role: string;
    firstName: string;
    lastName: string;
    email: string;
    userImageUrl: string | null;
}

interface AuthResponse {
    token: string;
    user: User;
}

interface VerifyResponse {
    user: User;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    loginWithOTP: (phone: string, otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            verifyToken(token);
        } else {
            setIsLoading(false);
        }
    }, []);

    const verifyToken = async (token: string) => {
        try {
            const response = await axios.get<VerifyResponse>(`${config.apiUrl}/api/auth/verify`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data.user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string) => {
        const response = await axios.post<AuthResponse>(`${config.apiUrl}/api/auth/login`, {
            username,
            password
        });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const loginWithOTP = async (phone: string, otp: string) => {
        const response = await axios.post<AuthResponse>(`${config.apiUrl}/api/auth/verify-otp`, {
            phone,
            otp
        });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, loginWithOTP }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 