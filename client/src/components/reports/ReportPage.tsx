import { useState, useEffect } from 'react';
import { FileText, Download, RefreshCw, Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import config from '../../config/config';
import { useLanguage } from '../../context/LanguageContext';

interface RecentReport {
    id: string;
    title: string;
    date: string;
    time: string;
    detections: number;
    matches: number;
    format: string;
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

    useEffect(() => {
        fetchStats();
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
                    <button
                        onClick={handleGenerateReport}
                        className="btn btn-primary flex items-center"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {currentLanguage === 'en' ? 'Generate Report' : 'रिपोर्ट बनाएं'}
                    </button>
                </div>

                {/* Stats Summary */}
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
                                {currentLanguage === 'en' ? 'Average Confidence' : 'औसत विश्वास स्तर'}
                            </h3>
                        </div>
                        <p className="text-2xl font-bold">
                            {loading ? '...' : `${stats.averageConfidence.toFixed(1)}%`}
                        </p>
                    </div>
                </div>

                {/* Recent Reports */}
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
                                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:border-gray-700">
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
            </div>
        </div>
    );
}