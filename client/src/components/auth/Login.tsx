import { useState } from 'react';
import { Shield, User, Lock, Eye, EyeOff, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import config from '../../config/config';

export default function NewLoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login, loginWithOTP } = useAuth();

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login(username, password);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Invalid credentials';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        if (!phone) {
            setError('Please enter your phone number');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await axios.post(`${config.apiUrl}/api/auth/send-otp`, { phone });
            setOtpSent(true);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to send OTP. Please check your phone number.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            setError('Please enter OTP');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await loginWithOTP(phone, otp);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setError(null);
        setOtpSent(false);
        setOtp('');
        setPhone('');
        setUsername('');
        setPassword('');
    };

    return (
        <div className="flex min-h-screen">
            <div className='w-[65%]'>
                <img
                    src="https://res-console.cloudinary.com/dwbr9hz8y/media_explorer_thumbnails/65c6f9c2f980461b8515c274f66e5c48/detailed"
                    className="w-full h-full object-cover"
                    alt="Main Display"
                />
            </div>

            <div className='flex flex-col items-center w-[35%] p-8'>
                <div className='w-full'>
                    <div className='flex flex-col justify-center items-center relative'>
                        <img
                            src="https://res.cloudinary.com/dwbr9hz8y/image/upload/v1733422184/m73hlkm5oz1baurcxgns.png"
                            alt="Madhya Pradesh Map"
                            className='w-[60%] opacity-30'
                        />
                        <Shield
                            className="absolute text-yellow-500"
                            size={50}
                            style={{ top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}
                        />
                        <h1 className="absolute text-black text-center dark:text-gray-300"
                            style={{
                                top: '54%', left: '50%', transform: 'translate(-50%, -50%)',
                                fontWeight: '500', letterSpacing: '2px'
                            }}>
                            BY TEAM HAXTERS
                        </h1>
                        <h1 className="text-center mt-4 max-w-[305px] text-gray-600 dark:text-gray-400">
                            AI Powered Big Data Analysis and Criminal Search Technology
                        </h1>
                    </div>
                </div>

                <div className='mt-5 w-full max-w-md'>
                    <h1 className='text-3xl font-semibold'>Sign in to MP Police FRT</h1>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                            <button 
                                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                                onClick={() => setError(null)}
                            >
                                <span className="text-xl">&times;</span>
                            </button>
                        </div>
                    )}

                    {otpSent && loginMethod === 'otp' && !error && (
                        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded relative" role="alert">
                            <span className="block sm:inline">OTP sent successfully! Please check your phone.</span>
                        </div>
                    )}

                    <div className="flex gap-4 mt-3">
                        <button
                            onClick={() => {
                                setLoginMethod('password');
                                resetForm();
                            }}
                            className={`text-sm pb-1 border-b-2 transition-all ${loginMethod === 'password'
                                ? 'border-yellow-400 text-gray-800 dark:text-gray-300 dark:hover:text-gray-300'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Username & Password
                        </button>
                        <button
                            onClick={() => {
                                setLoginMethod('otp');
                                resetForm();
                            }}
                            className={`text-sm pb-1 border-b-2 transition-all ${loginMethod === 'otp'
                                ? 'border-yellow-400 text-gray-800 dark:text-gray-300 dark:hover:text-gray-300'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Phone & OTP
                        </button>
                    </div>

                    <form onSubmit={handleCredentialsSubmit} className='mt-5'>
                        <div className='mt-2 flex flex-col gap-1'>
                            <label className="text-gray-600 text-sm">
                                {loginMethod === 'password' ? 'Username' : 'Phone Number'}
                            </label>
                            <div className="relative">
                                {loginMethod === 'password' ? (
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                ) : (
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                )}
                                <input
                                    type="text"
                                    value={loginMethod === 'password' ? username : phone}
                                    onChange={(e) => loginMethod === 'password' ? setUsername(e.target.value) : setPhone(e.target.value)}
                                    placeholder={loginMethod === 'password' ? 'Enter username...' : 'Enter phone number...'}
                                    className='w-full border pl-10 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all dark:bg-gray-800 dark:text-gray-300'
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {loginMethod === 'password' ? (
                            <div className='mt-4 flex flex-col gap-1'>
                                <label className="text-gray-600 text-sm">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder='Password...'
                                        className='w-full border pl-10 pr-10 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all dark:bg-gray-800 dark:text-gray-300'
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        ) : otpSent && (
                            <div className='mt-4 flex flex-col gap-1'>
                                <label className="text-gray-600 text-sm">OTP</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder='Enter OTP...'
                                        className='w-full border pl-10 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all dark:bg-gray-800 dark:text-gray-300'
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type={loginMethod === 'password' ? 'submit' : 'button'}
                            onClick={loginMethod === 'otp' ? (otpSent ? handleVerifyOTP : handleSendOTP) : undefined}
                            disabled={loading}
                            className='mt-4 bg-yellow-400 text-white rounded p-2 w-full hover:bg-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {loading ? 'Please wait...' : (
                                loginMethod === 'password' ? 'Sign In' :
                                    (otpSent ? 'Verify OTP' : 'Get OTP')
                            )}
                        </button>
                    </form>
                </div>

                <div className='mt-auto'>
                    <a href="#" className='mr-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'>Privacy Policy</a>
                    <a href="#" className='mr-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'>Terms Of Use</a>
                    <a href="#" className='text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'>Copyright 2024</a>
                </div>
            </div>
        </div>
    );
}