import {
    Bell, ChevronDown, HelpCircle, Languages,
    Moon, Plus, Search, Shield, Sun, User
} from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config/config';

interface SearchResult {
    id: string;
    firstName: string;
    lastName: string;
    personImageUrl: string;
    type: string;
    address: string;
}

export default function Navbar() {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const { currentLanguage, changeLanguage } = useLanguage();
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search function
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                performSearch();
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const performSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await axios.get<{ data: SearchResult[] }>(
                `${config.apiUrl}/api/persons/search?q=${encodeURIComponent(searchQuery)}`
            );
            setSearchResults(response.data.data);
            setShowResults(true);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleResultClick = (id: string) => {
        navigate(`/person/${id}`);
        setSearchQuery('');
        setShowResults(false);
    };

    const toggleLanguage = () => {
        changeLanguage(currentLanguage === 'en' ? 'hi' : 'en');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900 to-blue-800 dark:from-gray-900 dark:to-gray-800 text-white shadow-lg">
            <div className="max-w-[2000px] mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <Shield className="w-8 h-8 text-amber-400" />
                        <div>
                            <h1 className="text-lg font-bold">MP Police</h1>
                            <p className="text-xs text-amber-400">{t('nav.frs')}</p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-2xl mx-8" ref={searchRef}>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('nav.searchPlaceholder')}
                                className="w-full pl-10 pr-4 py-2 bg-blue-800/50 dark:bg-gray-800/50 border border-blue-700 dark:border-gray-700 rounded-lg 
                                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            {/* Search Results Dropdown */}
                            {showResults && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                                    {isSearching ? (
                                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                            Searching...
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {searchResults.map((result) => (
                                                <div
                                                    key={result.id}
                                                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                                    onClick={() => handleResultClick(result.id)}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <img
                                                            src={result.personImageUrl}
                                                            alt={`${result.firstName} ${result.lastName}`}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {result.firstName} {result.lastName}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {result.type.toUpperCase()} • {result.address}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                            No results found
                                        </div>
                                    )}
                                </div>
                            )}
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
                            {t('nav.newReport')}
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

                        <button 
                            onClick={toggleLanguage}
                            className="hover:text-amber-400 transition-colors"
                            title={currentLanguage === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
                        >
                            <Languages className="w-6 h-6" />
                        </button>

                        <div className="relative group">
                            <button 
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center space-x-3 hover:text-amber-400 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-400 bg-amber-500">
                                    <img 
                                        src={user.userImageUrl}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        className="w-full h-full object-cover"
                                        style={{ objectPosition: 'center' }}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                            const icon = document.createElement('div');
                                            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                                            target.parentElement?.appendChild(icon);
                                        }}
                                    />
                                </div>
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

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                                    <a 
                                        href="/settings" 
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        Profile
                                    </a>
                                    <a 
                                        href="/settings" 
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        Settings
                                    </a>
                                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                                    <button 
                                        onClick={() => {
                                            setShowDropdown(false);
                                            logout();
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}