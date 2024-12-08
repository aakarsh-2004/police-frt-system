import { useState, useEffect, useRef } from 'react';
import { Shield, User, Lock, Eye, EyeOff, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import config from '../../config/config';
import { useLoginTheme } from '../../context/LoginThemeContext';
import { auth, getFirebaseErrorMessage } from '../../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

interface LocationState {
    from: {
        pathname: string;
    };
}

export default function NewLoginPage() {
    const { isDarkMode } = useLoginTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const { login, loginWithOTP, loginWithPhone } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as LocationState)?.from?.pathname || '/';

    const recaptchaContainerRef = useRef<HTMLDivElement>(null);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    useEffect(() => {
        // Cleanup function to remove existing reCAPTCHA
        const cleanup = () => {
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (error) {
                    console.error('Error clearing reCAPTCHA:', error);
                }
                window.recaptchaVerifier = null;
            }
        };

        // Initialize new reCAPTCHA
        const initRecaptcha = () => {
            cleanup();
            
            const verifier = new RecaptchaVerifier(auth, 'recaptcha', {
                size: 'invisible',
                callback: () => {
                    console.log('reCAPTCHA resolved');
                },
                'expired-callback': () => {
                    toast.error('reCAPTCHA expired. Please try again.');
                    setLoading(false);
                }
            });

            window.recaptchaVerifier = verifier;
        };

        initRecaptcha();
        return cleanup;
    }, []);

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
        console.log("phone", phone);
        
        // if (!phone) {
        //     setError('Please enter your phone number');
        //     return;
        // }

        // try {
        //     setLoading(true);
        //     setError(null);
        //     await axios.post(`${config.apiUrl}/api/auth/send-otp`, { phone });
        //     setOtpSent(true);
        // } catch (error: any) {
        //     setError(error.response?.data?.message || 'Failed to send OTP. Please check your phone number.');
        // } finally {
        //     setLoading(false);
        // }
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

    const sendFirebaseOTP = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!window.recaptchaVerifier) {
                throw new Error('reCAPTCHA not initialized');
            }

            const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

            // First verify if phone exists in our database
            await axios.post(`${config.apiUrl}/api/auth/verify-phone`, {
                phone: formattedPhone
            });

            // Render reCAPTCHA widget if needed
            await window.recaptchaVerifier.render();

            // Send OTP
            const confirmationResult = await signInWithPhoneNumber(
                auth,
                formattedPhone,
                window.recaptchaVerifier
            );

            window.confirmationResult = confirmationResult;
            setOtpSent(true);
            toast.success('OTP sent successfully!');

        } catch (error: any) {
            console.error('Firebase error:', error);
            const errorMessage = error.response?.data?.message || 
                (error.code ? getFirebaseErrorMessage(error.code) : 'Failed to send OTP');
            
            setError(errorMessage);
            toast.error(errorMessage);

            // Reset reCAPTCHA on error
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = null;
                } catch (e) {
                    console.error('Error clearing reCAPTCHA:', e);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const verifyFirebaseOTP = async () => {
        console.log("verifyFirebaseOTP");
        
        if (!otp) {
            toast.error('Please enter OTP');
            return;
        }

        console.log("otp", otp);
        

        try {
            setLoading(true);
            
            if (!window.confirmationResult) {
                throw new Error('No confirmation result found');
            }

            // Verify OTP
            const result = await window.confirmationResult.confirm(otp);
            console.log("result", result);
            
            if (!result.user) {
                throw new Error('No user data received');
            }

            // Login with backend
            // await loginWithPhone(phone, result.user.uid);
            
            toast.success('Successfully logged in!');
            navigate('/');

        } catch (error: any) {
            console.error('Verification error:', error);
            const errorMessage = error.response?.data?.message || 
                (error.code ? getFirebaseErrorMessage(error.code) : 'Invalid OTP');
            
            setError(errorMessage);
            toast.error(errorMessage);
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
        <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className='w-[65%]'>
                <img
                    src="https://res.cloudinary.com/dwbr9hz8y/image/upload/v1733462754/fgel9tfdohwh1xmbgft8.gif"
                    className="w-full h-full object-cover"
                    alt="Main Display"
                />
            </div>

            <div className={`flex flex-col items-center w-[35%] p-8 ${
                isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
            }`}>
                <div className='w-full'>
                    <div className='flex flex-col justify-center items-center relative'>
                        <img
                            src="https://res.cloudinary.com/dwbr9hz8y/image/upload/v1733422184/m73hlkm5oz1baurcxgns.png"
                            alt="Madhya Pradesh Map"
                            className='w-[70%] opacity-30'
                        />
                        <Shield
                            className={`absolute ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`}
                            size={55}
                            style={{ top: '45%', left: '50%', transform: 'translate(-50%, -50%)' }}
                        />
                        <h1 className={`absolute text-center ${isDarkMode ? 'text-white' : 'text-black'}`}
                            style={{
                                top: '58%', left: '50%', transform: 'translate(-50%, -50%)',
                                fontWeight: '700', letterSpacing: '2px'
                            }}>
                            BY TEAM HAXTERS
                        </h1>
                        <h1 className={`text-center mt-4 max-w-[305px] ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                            AI Powered Big Data Analysis and Criminal Search Technology
                        </h1>
                    </div>
                </div>

                <div className='mt-5 w-full max-w-md'>
                    <h1 className={`text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Sign In
                    </h1>

                    {error && (
                        <div className={`mt-4 p-3 ${
                            isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-700'
                        } border border-red-400 rounded relative`} role="alert">
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
                                ? 'border-yellow-400 text-gray-800 hover:text-black'
                                : 'border-transparent text-gray-500 hover:text-black'
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
                                ? 'border-yellow-400 text-gray-800 hover:text-black'
                                : 'border-transparent text-gray-500 hover:text-black'
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
                                    onChange={(e) => loginMethod === 'password' 
                                        ? setUsername(e.target.value) 
                                        : setPhone((e.target.value))}
                                    placeholder={loginMethod === 'password' ? 'Enter username...' : 'Enter phone number...'}
                                    className='w-full border pl-10 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all'
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
                                        className='w-full border pl-10 pr-10 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all'
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
                                        className='w-full border pl-10 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all'
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        )}

                        <div id="recaptcha" className="!invisible"></div>
                        <button
                            type={loginMethod === 'password' ? 'submit' : 'button'}
                            onClick={loginMethod === 'otp' ? (otpSent ? verifyFirebaseOTP : sendFirebaseOTP) : undefined}
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