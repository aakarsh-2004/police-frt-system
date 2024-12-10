import {
    Bell, ChevronDown, HelpCircle, Languages,
    Moon, Plus, Search, Shield, Sun, User,
    GraduationCap, User as UserIcon
} from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config/config';
import NotificationDropdown from '../notification/NotificationDropdown';
import NotificationBadge from '../notification/NotificationBadge';

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
    const [imageError, setImageError] = useState(false);

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
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await axios.get<{ data: SearchResult[] }>(
                `${config.apiUrl}/api/persons/search?q=${encodeURIComponent(searchQuery)}`
            );
            
            // Filter results based on search query
            const filteredResults = response.data.data.filter(person => {
                const searchTerms = searchQuery.toLowerCase().split(' ');
                const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
                const address = person.address.toLowerCase();
                
                return searchTerms.every(term => 
                    fullName.includes(term) || 
                    address.includes(term)
                );
            });

            setSearchResults(filteredResults);
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

    const handleNewPerson = () => {
        navigate('/suspects/new');
    };

    // Reset image error when user changes
    useEffect(() => {
        setImageError(false);
    }, [user]);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900 to-blue-800 dark:from-gray-900 dark:to-gray-800 text-white shadow-lg">
            <div className="max-w-[2000px] mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div 
                        className="flex items-center space-x-4 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => navigate('/')}
                    >
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

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/tutorial')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-2"
                            title={currentLanguage === 'en' ? 'Tutorial Training' : 'ट्यूटोरियल प्रशिक्षण'}
                        >
                            <GraduationCap className="w-5 h-5" />
                            <span className="hidden md:inline">
                                {currentLanguage === 'en' ? 'Tutorial' : 'ट्यूटोरियल'}
                            </span>
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="hover:text-amber-400 transition-colors"
                        >
                            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                        </button>
                        <button
                            onClick={handleNewPerson}
                            className="btn btn-primary flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Person
                        </button>

                        <button 
                            onClick={() => navigate('/help')} 
                            className="hover:text-amber-400 transition-colors"
                        >
                            <HelpCircle className="w-6 h-6" />
                        </button>

                        <NotificationBadge />

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
                                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-400 bg-amber-500 flex items-center justify-center">
                                    {user?.userImageUrl && !imageError ? (
                                        <img 
                                            src={user.userImageUrl}
                                            alt={`${user.firstName} ${user.lastName}`}
                                            className="w-full h-full object-cover"
                                            style={{ objectPosition: 'center' }}
                                            onError={() => setImageError(true)}
                                        />
                                    ) : (
                                        <UserIcon className="w-5 h-5 text-white" />
                                    )}
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