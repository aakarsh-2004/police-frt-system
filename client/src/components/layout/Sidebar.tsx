import React from 'react';
import {
    BarChart2, Camera, Search, Bell, FileText,
    Users, Settings, ChevronLeft, User, MapPin, Clock, GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
    onPageChange: (page: string) => void;
    currentPage: string;
}

const menuItems = [
    { id: 'dashboard', icon: BarChart2, translationKey: 'nav.dashboard', path: '/' },
    { id: 'monitoring', icon: Camera, translationKey: 'nav.monitoring', path: '/monitoring' },
    { id: 'suspects', icon: User, translationKey: 'nav.suspects', path: '/suspects' },
    { id: 'search', icon: Search, translationKey: 'nav.search', path: '/search' },
    { id: 'alerts', icon: Bell, translationKey: 'nav.alerts', path: '/alerts' },
    { id: 'reports', icon: FileText, translationKey: 'nav.reports', path: '/reports', adminOnly: true },
    { id: 'mapview', icon: MapPin, translationKey: 'nav.mapview', path: '/mapview' },
    { id: 'tutorial', icon: GraduationCap, translationKey: 'nav.tutorialTraining', path: '/tutorial' },
    { id: 'users', icon: Users, translationKey: 'nav.users', path: '/users', adminOnly: true },
    { id: 'settings', icon: Settings, translationKey: 'nav.settings', path: '/settings' },
    { id: 'requests', icon: Clock, translationKey: 'nav.requests', path: '/requests'}
];

export default function Sidebar({ onPageChange, currentPage }: SidebarProps) {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { t, ready } = useTranslation();
    const { currentLanguage } = useLanguage();

    if (!ready) {
        return <div>Loading...</div>;
    }

    const visibleMenuItems = menuItems.filter(item => 
        (!item.adminOnly || user?.role === 'admin')
    );

    const handleNavigation = (page: string) => {
        if (page === 'suspects/new') {
            navigate('/suspects/new', { 
                state: { 
                    defaultType: 'suspect'
                }
            });
        } else {
            onPageChange(page);
            navigate(`${page === 'dashboard' ? '/' : `/${page}`}`);
        }
    };

    // Get current active page from path
    const getCurrentPage = () => {
        const path = location.pathname;
        if (path === '/') return 'dashboard';
        return path.substring(1); // Remove leading slash
    };

    const activePage = getCurrentPage();

    return (
        <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex flex-col z-40
            ${collapsed ? 'w-20' : 'w-64'}`}>
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="self-end p-2 m-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
                <ChevronLeft className={`w-5 h-5 transition-transform duration-300 dark:text-white ${collapsed ? 'rotate-180' : ''}`} />
            </button>

            <nav className="flex-1 px-4">
                {visibleMenuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                            item.id === activePage
                                ? 'bg-blue-900 text-white dark:bg-blue-800'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                        title={collapsed ? t(item.translationKey) : ''}
                    >
                        <item.icon className={`w-5 h-5 ${item.id === activePage ? 'text-amber-400' : ''}`} />
                        {!collapsed && <span className="text-sm font-medium">{t(item.translationKey)}</span>}
                    </button>
                ))}
            </nav>
        </aside>
    );
}