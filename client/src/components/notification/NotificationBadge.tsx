import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Trash2, UserX, UserPlus } from 'lucide-react';
import axios from 'axios';
import config from '../../config/config';
import { getTimeAgo } from '../../utils/dateUtils';

interface Notification {
    id: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

export default function NotificationBadge() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, []);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/notifications`);
            setNotifications(response.data.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string, event?: React.MouseEvent) => {
        if (event) {
            event.stopPropagation();
        }
        try {
            await axios.put(`${config.apiUrl}/api/notifications/${id}/read`);
            await fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async (event: React.MouseEvent) => {
        event.stopPropagation();
        try {
            await axios.put(`${config.apiUrl}/api/notifications/mark-all-read`);
            await fetchNotifications();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className=" text-black" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 rounded-full "
            >
                <Bell className="w-6 h-6 text-white hover:text-amber-400" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No notifications</div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm dark:text-white">{notification.message}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {getTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <button
                                                onClick={(e) => markAsRead(notification.id, e)}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 dark:bg-gray-900 rounded-full dark:hover:bg-gray-600" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'request_approved':
            return <Check className="w-4 h-4 text-green-500" />;
        case 'request_rejected':
            return <X className="w-4 h-4 text-red-500" />;
        case 'person_deleted':
            return <Trash2 className="w-4 h-4 text-orange-500" />;
        case 'user_deleted':
            return <UserX className="w-4 h-4 text-red-500" />;
        case 'person_added':
            return <UserPlus className="w-4 h-4 text-green-500" />;
        case 'user_added':
            return <UserPlus className="w-4 h-4 text-blue-500" />;
        default:
            return <Bell className="w-4 h-4 text-gray-500" />;
    }
}; 