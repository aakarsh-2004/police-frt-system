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

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 border dark:border-gray-700 rounded-lg shadow-lg">
                <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-blue-600 dark:text-blue-400">
                    {payload[0].value} detections
                </p>
            </div>
        );
    }
    return null;
};

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
        <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 h-[300px]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold dark:text-white">
                    {currentLanguage === 'en' ? 'Detections by Location' : 'स्थान के अनुसार पहचान'}
                </h2>
            </div>

            <div className="h-[calc(100%-4rem)] overflow-hidden">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="location" 
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={0}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" fill="#3B82F6">
                            <LabelList dataKey="count" position="top" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
} 