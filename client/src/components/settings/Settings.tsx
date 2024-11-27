import { useState } from 'react';
import {
    Settings as SettingsIcon, Moon, Sun, Bell, Lock,
    Monitor, Database, Key, Save
} from 'lucide-react';
import { useTheme } from '../../context/themeContext';

interface LanguageOption {
    value: string;
    label: string;
    nativeLabel: string;
}

const languages: LanguageOption[] = [
    { value: 'en', label: 'English', nativeLabel: 'English' },
    { value: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' }
];

export default function Settings() {
    const { isDarkMode, toggleTheme } = useTheme();

    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [notifications, setNotifications] = useState({
        alerts: true,
        updates: true,
        reports: true
    });
    const [security, setSecurity] = useState({
        twoFactor: true,
        sessionTimeout: 30,
        passwordExpiry: 90
    });

    const handleLanguageChange = (lang: string) => {
        setSelectedLanguage(lang);
        document.documentElement.setAttribute('lang', lang);
    };

    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="flex items-center space-x-3 mb-6">
                    <SettingsIcon className="w-6 h-6 text-blue-900 dark:text-blue-400" />
                    <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center dark:text-white">
                            <Monitor className="w-5 h-5 mr-2" />
                            Appearance
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="font-medium dark:text-white">Dark Mode</label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Toggle dark mode appearance
                                    </p>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className={`p-2 rounded-lg ${isDarkMode
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center dark:text-white">
                            <Bell className="w-5 h-5 mr-2" />
                            Notifications
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="font-medium dark:text-white">Alert Notifications</label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Receive notifications for new alerts
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications.alerts}
                                        onChange={(e) => setNotifications(prev => ({
                                            ...prev,
                                            alerts: e.target.checked
                                        }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                               peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full 
                               peer dark:bg-gray-700 peer-checked:after:translate-x-full 
                               peer-checked:after:border-white after:content-[''] after:absolute 
                               after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
                               after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                               dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center dark:text-white">
                            <Lock className="w-5 h-5 mr-2" />
                            Security
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="font-medium dark:text-white">Two-Factor Authentication</label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Enable 2FA for additional security
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={security.twoFactor}
                                        onChange={(e) => setSecurity(prev => ({
                                            ...prev,
                                            twoFactor: e.target.checked
                                        }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                               peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full 
                               peer dark:bg-gray-700 peer-checked:after:translate-x-full 
                               peer-checked:after:border-white after:content-[''] after:absolute 
                               after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
                               after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                               dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div>
                                <label className="font-medium dark:text-white">Session Timeout (minutes)</label>
                                <input
                                    type="number"
                                    value={security.sessionTimeout}
                                    onChange={(e) => setSecurity(prev => ({
                                        ...prev,
                                        sessionTimeout: parseInt(e.target.value)
                                    }))}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border 
                           border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                           dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center dark:text-white">
                            <Database className="w-5 h-5 mr-2" />
                            System
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="font-medium dark:text-white">API Key</label>
                                <div className="mt-1 flex">
                                    <input
                                        type="password"
                                        value="************************"
                                        readOnly
                                        className="block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 
                             border border-gray-300 dark:border-gray-600 rounded-l-md 
                             shadow-sm focus:outline-none dark:text-white"
                                    />
                                    <button className="px-4 bg-blue-600 text-white rounded-r-md 
                                 hover:bg-blue-700 flex items-center">
                                        <Key className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="font-medium dark:text-white">System Language</label>
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 
                           border border-gray-300 dark:border-gray-600 rounded-md 
                           shadow-sm focus:outline-none focus:ring-blue-500 
                           focus:border-blue-500 dark:text-white"
                                >
                                    {languages.map(lang => (
                                        <option key={lang.value} value={lang.value}>
                                            {lang.label} ({lang.nativeLabel})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button className="btn btn-primary">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}