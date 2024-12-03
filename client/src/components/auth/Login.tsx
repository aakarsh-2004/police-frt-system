import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import config from '../../config/config';

export default function Login() {
    const [loginMethod, setLoginMethod] = useState<'credentials' | 'phone'>('credentials');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login, loginWithOTP } = useAuth();

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }

        try {
            await login(username, password);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Invalid credentials';
            setError(errorMessage);
        }
    };

    const handleSendOTP = async () => {
        try {
            await axios.post(`${config.apiUrl}/api/auth/send-otp`, { phone });
            setOtpSent(true);
            toast.success('OTP sent successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        }
    };

    const handleVerifyOTP = async () => {
        try {
            await loginWithOTP(phone, otp);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 to-blue-800">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <Shield className="w-16 h-16 text-amber-500 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900">MP Police</h1>
                    <p className="text-gray-600">Face Recognition System</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="flex justify-center mb-6">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setLoginMethod('credentials')}
                            className={`px-4 py-2 rounded ${
                                loginMethod === 'credentials' ? 'bg-blue-900 text-white' : 'bg-gray-100'
                            }`}
                        >
                            Username & Password
                        </button>
                        <button
                            onClick={() => setLoginMethod('phone')}
                            className={`px-4 py-2 rounded ${
                                loginMethod === 'phone' ? 'bg-blue-900 text-white' : 'bg-gray-100'
                            }`}
                        >
                            Phone Number
                        </button>
                    </div>
                </div>

                {loginMethod === 'credentials' ? (
                    <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full btn btn-primary"
                        >
                            Sign in
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <div className="mt-1 flex">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                        </div>

                        {!otpSent ? (
                            <button
                                onClick={handleSendOTP}
                                className="w-full btn btn-primary"
                                type="button"
                            >
                                Send OTP
                            </button>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Enter 6-digit OTP"
                                    />
                                </div>
                                <button
                                    onClick={handleVerifyOTP}
                                    className="w-full btn btn-primary"
                                    type="button"
                                >
                                    Verify OTP
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 