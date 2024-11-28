import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield, User, Bell, Lock, Globe, Moon, HelpCircle } from 'lucide-react';
import { useTheme } from '../../context/themeContext';

export default function Settings() {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Settings</h1>

            {/* Profile Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Settings
                </h2>
                <div className="flex items-center space-x-4 mb-4">
                    {user?.userImageUrl ? (
                        <img 
                            src={user.userImageUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-20 h-20 rounded-full object-cover border-2 border-amber-400"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center">
                            <User className="w-10 h-10 text-white" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-medium">{user?.firstName} {user?.lastName}</h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <p className="text-xs text-amber-500">{user?.role}</p>
                    </div>
                </div>
                <button className="btn btn-secondary text-sm">
                    Update Profile
                </button>
            </div>

            {/* General Settings */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Security Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Security
                    </h2>
                    <div className="space-y-4">
                        <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between">
                            <div className="flex items-center">
                                <Lock className="w-5 h-5 mr-3 text-gray-400" />
                                <span>Change Password</span>
                            </div>
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between">
                            <div className="flex items-center">
                                <Bell className="w-5 h-5 mr-3 text-gray-400" />
                                <span>Notification Settings</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Preferences</h2>
                    <div className="space-y-4">
                        <button 
                            onClick={toggleTheme}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                <Moon className="w-5 h-5 mr-3 text-gray-400" />
                                <span>Dark Mode</span>
                            </div>
                            <div className={`w-11 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-amber-500' : 'bg-gray-200'} relative`}>
                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between">
                            <div className="flex items-center">
                                <Globe className="w-5 h-5 mr-3 text-gray-400" />
                                <span>Language</span>
                            </div>
                            <span className="text-sm text-gray-500">English</span>
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between">
                            <div className="flex items-center">
                                <HelpCircle className="w-5 h-5 mr-3 text-gray-400" />
                                <span>Help & Support</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <div className="mt-8">
                <button 
                    onClick={handleLogout}
                    className="w-full md:w-auto btn bg-red-500 hover:bg-red-600 text-white flex items-center justify-center space-x-2 px-6"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}