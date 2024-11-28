import {
    Bell, ChevronDown, HelpCircle, Languages,
    Moon, Plus, Search, Shield, Sun, User
} from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900 to-blue-800 dark:from-gray-900 dark:to-gray-800 text-white shadow-lg">
            <div className="max-w-[2000px] mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        {/* <img
                            src="https://images.unsplash.com/photo-1592845697809-7b7b8c2e0b1f"
                            alt="MP Police Logo"
                            className="w-10 h-10 object-contain"
                        /> */}
                        <Shield className="w-8 h-8 text-amber-400" />
                        <div>
                            <h1 className="text-lg font-bold">MP Police</h1>
                            <p className="text-xs text-amber-400">Face Recognition System</p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-2xl mx-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search suspects, cases, or matches..."
                                className="w-full pl-10 pr-4 py-2 bg-blue-800/50 dark:bg-gray-800/50 border border-blue-700 dark:border-gray-700 rounded-lg 
                                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                                placeholder-gray-400 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <button
                            onClick={toggleTheme}
                            className="hover:text-amber-400 transition-colors"
                        >
                            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                        </button>
                        <button className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 
                            rounded-lg text-sm font-medium transition-colors">
                            <Plus className="w-4 h-4 mr-2" />
                            New Report
                        </button>

                        <button className="hover:text-amber-400 transition-colors">
                            <HelpCircle className="w-6 h-6" />
                        </button>

                        <div className="relative">
                            <button className="hover:text-amber-400 transition-colors">
                                <Bell className="w-6 h-6" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-4 h-4 
                                flex items-center justify-center">3</span>
                            </button>
                        </div>

                        <button className="hover:text-amber-400 transition-colors">
                            <Languages className="w-6 h-6" />
                        </button>

                        <div className="relative group">
                            <button 
                                onClick={logout}
                                className="flex items-center space-x-3 hover:text-amber-400 transition-colors"
                            >
                                {user?.userImageUrl ? (
                                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-400">
                                        <img 
                                            src={user.userImageUrl}
                                            alt={`${user.firstName} ${user.lastName}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback to user icon if image fails to load
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null; // Prevent infinite loop
                                                target.style.display = 'none';
                                                target.parentElement?.classList.add('bg-amber-500', 'flex', 'items-center', 'justify-center');
                                                const icon = document.createElement('div');
                                                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                                                target.parentElement?.appendChild(icon);
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                )}
                                <div className="text-left">
                                    <p className="text-sm font-medium text-primary text-white">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-xs text-amber-400">
                                        {user?.role}
                                    </p>
                                </div>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl opacity-0 invisible 
                                group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    Profile
                                </a>
                                <a href="#settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    Settings
                                </a>
                                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                                <button 
                                    onClick={logout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}