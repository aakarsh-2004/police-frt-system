import React from 'react';
import {
    BarChart2, Camera, Search, Bell, FileText,
    Users, Settings, ChevronLeft, User, MapPin, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
    onPageChange: (page: string) => void;
    currentPage: string;
}

const menuItems = [
    { id: 'dashboard', icon: BarChart2, label: 'Dashboard', path: '/' },
    { id: 'monitoring', icon: Camera, label: 'Live Monitoring', path: '/monitoring' },
    { id: 'suspects', icon: User, label: 'Suspects', path: '/suspects' },
    { id: 'search', icon: Search, label: 'Search & Lookup', path: '/search' },
    { id: 'alerts', icon: Bell, label: 'Alerts', path: '/alerts' },
    { id: 'reports', icon: FileText, label: 'Reports', path: '/reports' },
    { id: 'mapview', icon: MapPin, label: 'Map View', path: '/mapview' },
    { id: 'users', icon: Users, label: 'User Management', path: '/users' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
    { id: 'requests', icon: Clock, label: 'Requests', path: '/requests', adminOnly: true }
];

export default function Sidebar({ onPageChange, currentPage }: SidebarProps) {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const visibleMenuItems = menuItems.filter(item => 
        (!item.adminOnly || user?.role === 'admin')
    );

    const handleNavigation = (page: string) => {
        onPageChange(page);
        navigate(`${page === 'dashboard' ? '/' : `/${page}`}`);
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
                        title={collapsed ? item.label : ''}
                    >
                        <item.icon className={`w-5 h-5 ${item.id === activePage ? 'text-amber-400' : ''}`} />
                        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </button>
                ))}
            </nav>
        </aside>
    );
}