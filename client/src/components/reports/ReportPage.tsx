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

const recentReports: RecentReport[] = [
    {
        id: '1',
        title: 'Daily Detection Report',
        date: new Date().toLocaleDateString(),
        time: '09:00 AM',
        detections: 45,
        matches: 32,
        format: 'CSV'
    },
    {
        id: '2',
        title: 'Weekly Summary Report',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        time: '11:30 AM',
        detections: 312,
        matches: 156,
        format: 'CSV'
    },
    {
        id: '3',
        title: 'Monthly Analytics Report',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        time: '10:15 AM',
        detections: 1250,
        matches: 890,
        format: 'CSV'
    }
];

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDetections: 0,
        successfulMatches: 0,
        averageConfidence: 0
    });
    const { currentLanguage } = useLanguage();
    const [trends, setTrends] = useState<DetectionTrends | null>(null);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
    const [view, setView] = useState<'reports' | 'graphs'>('reports');

    useEffect(() => {
        fetchStats();
        fetchTrends();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/recognitions/stats`);
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrends = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/stats/trends`);
            setTrends(response.data.data);
        } catch (error) {
            console.error('Error fetching trends:', error);
        }
    };

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
                                    <span>{currentLanguage === 'en' ? 'Show Graphs' : 'ग्राफ़ दिखाएं'}</span>
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
                                    {loading ? '...' : stats.totalDetections.toLocaleString()}
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-4 dark:bg-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-gray-600 dark:text-gray-400">
                                        {currentLanguage === 'en' ? 'Successful Matches' : 'सफल मिलान'}
                                    </h3>
                                </div>
                                <p className="text-2xl font-bold">
                                    {loading ? '...' : stats.successfulMatches.toLocaleString()}
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-4 dark:bg-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-gray-600 dark:text-gray-400">
                                        {currentLanguage === 'en' ? 'Average Confidence' : 'औसत विश्व��स स्तर'}
                                    </h3>
                                </div>
                                <p className="text-2xl font-bold">
                                    {loading ? '...' : `${stats.averageConfidence.toFixed(1)}%`}
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
                                                                `${report.detections} पहचान, ${report.matches} म��लान`
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
                                {currentLanguage === 'en' ? 'Daily Detections' : 'दैनिक ���हचान'}
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
                                            dataKey="_count.id"
                                            nameKey="type"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >
                                            {(trends?.byType || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-black">
                            <h3 className="text-lg font-semibold mb-4 dark:text-white">
                                {currentLanguage === 'en' ? 'Top Detection Locations' : 'शीर्ष पहचान स्थान'}
                            </h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trends?.byLocation || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="camera.location" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="_count.id" fill="#8884d8" name="Detections" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
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