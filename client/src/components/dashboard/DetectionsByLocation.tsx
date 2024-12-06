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
    Legend
} from 'recharts';
import { useTheme } from '../../context/themeContext';

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
                <div className="flex items-center space-x-2 mb-6">
                    <ChartIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold dark:text-white">Detections by Location</h2>
                </div>
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                    No detection data available
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
            <div className="flex items-center space-x-2 mb-6">
                <ChartIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold dark:text-white">Detections by Location</h2>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={stats}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 60
                        }}
                    >
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                        />
                        <XAxis
                            dataKey="location"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            tick={{ 
                                fill: isDarkMode ? '#D1D5DB' : '#374151',
                                fontSize: 12 
                            }}
                        />
                        <YAxis 
                            tick={{ 
                                fill: isDarkMode ? '#D1D5DB' : '#374151',
                                fontSize: 12 
                            }}
                            label={{ 
                                value: 'Number of Detections', 
                                angle: -90, 
                                position: 'insideLeft',
                                fill: isDarkMode ? '#D1D5DB' : '#374151'
                            }}
                        />
                        <Tooltip 
                            content={<CustomTooltip />}
                            cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                        />
                        <Legend 
                            wrapperStyle={{ 
                                color: isDarkMode ? '#D1D5DB' : '#374151'
                            }}
                        />
                        <Bar
                            name="Detections"
                            dataKey="count"
                            fill={isDarkMode ? '#3B82F6' : '#2563EB'}
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                        >
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
} 