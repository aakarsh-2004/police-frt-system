import { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config/config';
import { BarChart as ChartIcon } from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LabelList
} from 'recharts';
import { useTheme } from '../../context/themeContext';
import { useLanguage } from '../../context/LanguageContext';

interface LocationStats {
    location: string;
    count: number;
}

export default function DetectionsByLocation() {
    const [stats, setStats] = useState<LocationStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isDarkMode } = useTheme();
    const { currentLanguage } = useLanguage();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get<{ data: LocationStats[] }>(
                    `${config.apiUrl}/api/recognitions/stats/by-location`
                );
                if (response.data && Array.isArray(response.data.data)) {
                    setStats(response.data.data);
                } else {
                    setStats([]);
                }
                setError(null);
            } catch (err) {
                console.error('Error fetching location stats:', err);
                setError('Failed to load statistics');
                setStats([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                    <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
                <div className="text-red-500 text-center">{error}</div>
            </div>
        );
    }

    if (stats.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                    {currentLanguage === 'en' ? 'No detection data available' : 'कोई डिटेक्शन डेटा उपलब्ध नहीं है'}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2 dark:text-white">
                    <ChartIcon className="w-5 h-5 text-blue-500" />
                    <span>{currentLanguage === 'en' ? 'Detections by Location' : 'स्थान के अनुसार पहचान'}</span>
                </h2>
            </div>

            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        data={stats} 
                        margin={{ 
                            top: 20, 
                            right: 30, 
                            left: 20, 
                            bottom: 70
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="location" 
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                            height={60}
                            tick={{ 
                                fontSize: 12,
                                fill: isDarkMode ? '#9CA3AF' : '#4B5563'
                            }}
                        />
                        <YAxis 
                            tick={{ 
                                fontSize: 12,
                                fill: isDarkMode ? '#9CA3AF' : '#4B5563'
                            }}
                            label={{ 
                                value: 'Number of Detections', 
                                angle: -90, 
                                position: 'insideLeft',
                                style: { 
                                    textAnchor: 'middle',
                                    fill: isDarkMode ? '#9CA3AF' : '#4B5563'
                                }
                            }}
                        />
                        <Tooltip 
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-2 rounded shadow-lg border dark:bg-gray-800 dark:border-gray-700">
                                            <p className="text-sm font-medium dark:text-white">
                                                {payload[0].payload.location}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {payload[0].value} detections
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar 
                            dataKey="count" 
                            fill={isDarkMode ? '#3B82F6' : '#2563EB'}
                            radius={[4, 4, 0, 0]}
                        >
                            <LabelList 
                                dataKey="count" 
                                position="top" 
                                fill={isDarkMode ? '#9CA3AF' : '#4B5563'}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
} 