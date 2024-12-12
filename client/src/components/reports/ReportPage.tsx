import { useState, useEffect } from 'react';
import { FileText, Download, RefreshCw, Calendar, Clock, BarChart3 } from 'lucide-react';
import axios from 'axios';
import config from '../../config/config';
import { useLanguage } from '../../context/LanguageContext';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';
import DetectionsByLocation from '../dashboard/DetectionsByLocation';

interface RecentReport {
    id: string;
    title: string;
    date: string;
    time: string;
    detections: number;
    matches: number;
    format: string;
}

interface DetectionTrends {
    daily: Array<{
        capturedDateTime: string;
        _count: { id: number };
    }>;
    byType: Array<{
        type: string;
        _count: { id: number };
    }>;
    byLocation: Array<{
        camera: { location: string };
        _count: { id: number };
    }>;
    byConfidence: Array<{
        confidenceScore: string;
        _count: { id: number };
    }>;
}

interface DailyStats {
    date: string;
    count: number;
}

interface TypeStats {
    type: string;
    count: number;
    percentage: number;
}

interface LocationStats {
    location: string;
    cameraName: string;
    count: number;
    percentage: number;
}

interface Stats {
    totalDetections: number;
    successfulMatches?: number;
    byType: Array<{
        type: string;
        count: number;
        percentage: number;
    }>;
    topLocations: Array<{
        location: string;
        cameraName: string;
        count: number;
        percentage: number;
    }>;
    dailyStats: Array<{
        date: string;
        count: number;
    }>;
}

const generateRecentReports = (stats: Stats | null) => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });

    // Get actual values from stats
    const totalDetections = stats?.totalDetections || 0;
    const successfulMatches = stats?.successfulMatches || 0;

    return [
        {
            id: '1',
            title: 'Daily Detection Report',
            date: now.toLocaleDateString(),
            time: currentTime,
            detections: totalDetections,
            matches: successfulMatches,
            format: 'CSV'
        },
        {
            id: '2',
            title: 'Weekly Summary Report',
            date: now.toLocaleDateString(),
            time: currentTime,
            detections: totalDetections,
            matches: successfulMatches,
            format: 'CSV'
        },
        {
            id: '3',
            title: 'Monthly Analytics Report',
            date: now.toLocaleDateString(),
            time: currentTime,
            detections: totalDetections,
            matches: successfulMatches,
            format: 'CSV'
        }
    ];
};

export default function ReportsPage() {
    const [recentReports, setRecentReports] = useState<RecentReport[]>(generateRecentReports(null));
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({
        totalDetections: 0,
        byType: [],
        topLocations: [],
        dailyStats: []
    });
    const { currentLanguage } = useLanguage();
    const [trends, setTrends] = useState<DetectionTrends | null>(null);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
    const [view, setView] = useState<'reports' | 'graphs'>('reports');
    let mystats = [];

    const fetchStats = async () => {
        try {
            setLoading(true);
            // Fetch both stats and trends
            const [statsResponse, trendsResponse] = await Promise.all([
                axios.get(`${config.apiUrl}/api/recognitions/stats`),
                axios.get(`${config.apiUrl}/api/stats/trends`)
            ]);

            const statsData = statsResponse.data.data;
            const trendsData = trendsResponse.data.data;

            console.log("statsData", statsData);
            console.log("trendsData", trendsData);

            mystats = statsData.topLocations.map((stat) => {
                return {
                    camera: {location: stat.cameraName},
                    _count: {id: stat.count},
                }
            })

            console.log("mystats", mystats);
            
            

            // Calculate percentages for person types
            const totalPersons = statsData.byType.reduce((sum: number, type: any) => sum + type.count, 0);
            const typePercentages = statsData.byType.map((type: any) => ({
                type: type.type === 'suspect' ? 'Suspects' : 'Missing Persons',
                value: Math.round((type.count / totalPersons) * 100),
                count: type.count
            }));

            // Set both stats and trends
            setStats(statsData);
            setTrends({
                ...trendsData,
                byType: typePercentages
            });

            // Calculate total detections from trends data
            const totalDetections = trendsData.daily.reduce((sum, day) => sum + day._count.id, 0);
            
            // Calculate successful matches (detections with confidence > 50%)
            const successfulMatches = trendsData.byConfidence
                .filter(conf => parseFloat(conf.confidenceScore) > 50)
                .reduce((sum, conf) => sum + conf._count.id, 0);

            // Generate reports with actual data
            const reports = generateRecentReports({
                ...statsData,
                totalDetections,
                successfulMatches
            });
            setRecentReports(reports);

        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchStats();
    }, []);

    const handleGenerateReport = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/recognitions/report`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report-${new Date().toISOString()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error generating report:', error);
        }
    };

    const formatDataForCharts = () => {
        if (!stats) return null;

        return {
            detectionTypes: {
                labels: stats.byType.map(stat => 
                    stat.type === 'suspect' ? 'Suspects' : 'Missing Persons'
                ),
                datasets: [{
                    data: stats.byType.map(stat => stat.percentage),
                    backgroundColor: ['#EF4444', '#F59E0B']
                }]
            },
            topLocations: {
                labels: stats.topLocations.map(loc => loc.location),
                datasets: [{
                    label: 'Detections',
                    data: stats.topLocations.map(loc => loc.count),
                    backgroundColor: '#3B82F6'
                }]
            },
            dailyTrends: {
                labels: stats.dailyStats.map(day => new Date(day.date).toLocaleDateString()),
                datasets: [{
                    label: 'Daily Detections',
                    data: stats.dailyStats.map(day => day.count),
                    borderColor: '#10B981',
                    tension: 0.4
                }]
            }
        };
    };

    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">
                        {currentLanguage === 'en' ? 'Reports & Analytics' : 'रिपोर्ट्स और विश्लेषण'}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleGenerateReport}
                            className="btn btn-primary flex items-center"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {currentLanguage === 'en' ? 'Generate Report' : 'रिपोर्ट बनाएं'}
                        </button>
                        <button
                            onClick={() => setView(view === 'reports' ? 'graphs' : 'reports')}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
                        >
                            {view === 'reports' ? (
                                <>
                                    <BarChart3 className="w-4 h-4" />
                                    <span>{currentLanguage === 'en' ? 'Show Analytics' : 'विश्लेषण दिखाएं'}</span>
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4" />
                                    <span>{currentLanguage === 'en' ? 'Show Reports' : 'रिपोर्ट दिखाएं'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {view === 'reports' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-lg p-4 dark:bg-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-gray-600 dark:text-gray-400">
                                        {currentLanguage === 'en' ? 'Total Detections' : 'कुल पहचान'}
                                    </h3>
                                    <RefreshCw 
                                        className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                                        onClick={fetchStats}
                                    />
                                </div>
                                <p className="text-2xl font-bold">
                                    {loading ? '...' : stats.totalDetections?.toLocaleString() || '0'}
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-4 dark:bg-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-gray-600 dark:text-gray-400">
                                        {currentLanguage === 'en' ? 'Suspects Detected' : 'पहचाने गए संदिगध'}
                                    </h3>
                                </div>
                                <p className="text-2xl font-bold">
                                    {loading ? '...' : (stats.byType.find(t => t.type === 'suspect')?.count || 0).toLocaleString()}
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-4 dark:bg-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-gray-600 dark:text-gray-400">
                                        {currentLanguage === 'en' ? 'Missing Persons Found' : 'मिले हुए लापता व्यक्ति'}
                                    </h3>
                                </div>
                                <p className="text-2xl font-bold">
                                    {loading ? '...' : (stats.byType.find(t => t.type === 'missing-person')?.count || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg dark:bg-gray-800">
                            <div className="p-4 border-b dark:border-gray-700">
                                <h2 className="text-lg font-semibold dark:text-gray-400">
                                    {currentLanguage === 'en' ? 'Recent Reports' : 'हाल की रिपोर्ट्स'}
                                </h2>
                            </div>

                            <div className="p-4">
                                {loading ? (
                                    <div className="text-center py-8 text-gray-500">
                                        {currentLanguage === 'en' ? 'Loading reports...' : 'रिपोर्ट्स लोड हो रही हैं...'}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentReports.map((report) => (
                                            <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer">
                                                <div className="flex items-center space-x-4">
                                                    <FileText className="w-8 h-8 text-blue-600" />
                                                    <div>
                                                        <h3 className="font-medium">
                                                            {currentLanguage === 'en' ? report.title : 
                                                                report.title === 'Daily Detection Report' ? 'दैनिक पहचान रिपोर्ट' :
                                                                report.title === 'Weekly Summary Report' ? 'साप्ताहिक सारांश रिपोर्ट' :
                                                                'मासिक विश्लेषण रिपोर्ट'
                                                            }
                                                        </h3>
                                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                            <Calendar className="w-4 h-4 mr-1 dark:text-gray-400" />
                                                            {report.date}
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                            <Clock className="w-4 h-4 mr-1 dark:text-gray-400" />
                                                            {report.time}
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                            <FileText className="w-4 h-4 mr-1 dark:text-gray-400" />
                                                            {currentLanguage === 'en' ? 
                                                                `${report.detections} detections, ${report.matches} matches` :
                                                                `${report.detections} पहचान, ${report.matches} मिलान`
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={handleGenerateReport}
                                                    className="btn btn-secondary text-sm"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    {currentLanguage === 'en' ? `Download ${report.format}` : `${report.format} डाउनलोड करें`}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Graphs View */}
                {view === 'graphs' && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Daily Detections Line Chart */}
                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-black">
                            <h3 className="text-lg font-semibold mb-4 dark:text-white">
                                {currentLanguage === 'en' ? 'Daily Detections' : 'दैनिक पहचान'}
                            </h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trends?.daily || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="capturedDateTime" 
                                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                        />
                                        <YAxis />
                                        <Tooltip />
                                        <Line 
                                            type="monotone" 
                                            dataKey="_count.id" 
                                            stroke="#8884d8" 
                                            name="Detections"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-black">
                            <h3 className="text-lg font-semibold mb-4 dark:text-white">
                                {currentLanguage === 'en' ? 'Detection Types' : 'पहचान के प्रकार'}
                            </h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={trends?.byType || []}
                                            dataKey="value"
                                            nameKey="type"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ name, value }) => `${name}: ${value}%`}
                                        >
                                            {(trends?.byType || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${value}%`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
                            <h3 className="text-lg font-semibold mb-4 dark:text-white">
                                {currentLanguage === 'en' ? 'Top Detection Locations' : 'शीर्ष पहचान स्थान'}
                            </h3>
                            <DetectionsByLocation />
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-black">
                            <h3 className="text-lg font-semibold mb-4 dark:text-white">
                                {currentLanguage === 'en' ? 'Confidence Distribution' : 'विश्वास वितरण'}
                            </h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trends?.byConfidence || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="confidenceScore"
                                        />
                                        <YAxis />
                                        <Tooltip 
                                            formatter={(value: number) => [`${value} detections`, 'Count']}
                                            labelFormatter={(label: string) => `Confidence ${label}`}
                                        />
                                        <Bar 
                                            dataKey="_count.id" 
                                            fill="#82ca9d" 
                                            name="Detections"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}