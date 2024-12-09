import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config/config';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get<VerifyResponse>(
                    `${config.apiUrl}/api/auth/verify`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                
                setUser(response.data.user);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (error) {
                localStorage.removeItem('token');
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post<AuthResponse>(
                `${config.apiUrl}/api/auth/login`,
                { username, password }
            );
            
            const { token, user } = response.data;
            
            console.log('Login successful:', { user });
            console.log('Token received:', token);
            
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            
            console.log('Token in localStorage:', localStorage.getItem('token'));
            console.log('Authorization header:', axios.defaults.headers.common['Authorization']);
            
            toast.success('Successfully logged in!');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        try {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            toast.success('Successfully logged out');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Error during logout');
        }
    };

    const loginWithOTP = async (phone: string, otp: string) => {
        try {
            const response = await axios.post<AuthResponse>(`${config.apiUrl}/api/auth/verify-otp`, {
                phone,
                otp
            });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            toast.success('Login successful');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw error;
            }
            throw new Error('OTP verification failed');
        }
    };

    const loginWithPhone = async (phone: string, firebaseUid: string) => {
        try {
            // First verify if phone exists in database
            const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
            
            const loginResponse = await axios.post(`${config.apiUrl}/api/auth/login-with-phone`, {
                phone: formattedPhone,
                firebaseUid
            });

            const { token, user } = loginResponse.data;
            
            // Set token in axios headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Store token and user data
            localStorage.setItem('token', token);
            setUser(user);
            
            return user;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            throw new Error(message);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, loginWithOTP, loginWithPhone }}>
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