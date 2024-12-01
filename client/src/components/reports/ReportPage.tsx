import { useState, useEffect } from 'react';
import { FileText, Download, RefreshCw, Calendar, Clock, Filter } from 'lucide-react';
import axios from 'axios';
import config from '../../config/config';
import { toast } from 'react-hot-toast';

interface Stats {
    totalDetections: number;
    successfulMatches: number;
    averageConfidence: number;
}

const recentReports = [
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
        matches: 256,
        format: 'CSV'
    }
];

const statistics = {
    totalDetections: 1245,
    successfulMatches: 876,
    averageConfidence: 85.4,
    highRiskAlerts: 23
};

export default function ReportsPage() {
    const [generating, setGenerating] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('daily');
    const [stats, setStats] = useState<Stats>({
        totalDetections: 0,
        successfulMatches: 0,
        averageConfidence: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get<{data: Stats}>(`${config.apiUrl}/api/recognitions/stats`);
                setStats(response.data.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
                toast.error('Failed to load statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleGenerateReport = async () => {
        try {
            setGenerating(true);
            const response = await axios.get<Blob>(`${config.apiUrl}/api/recognitions/report`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'detections_report.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Report generated successfully');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <FileText className="w-6 h-6 text-blue-900" />
                        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                    </div>

                    <button 
                        onClick={handleGenerateReport}
                        disabled={generating}
                        className="btn btn-primary text-sm flex items-center"
                    >
                        {generating ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        Generate New Report
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-gray-500 text-sm">Total Detections</h3>
                        {loading ? (
                            <div className="animate-pulse h-8 bg-gray-200 rounded mt-1"></div>
                        ) : (
                            <p className="text-2xl font-bold text-blue-900">{stats.totalDetections}</p>
                        )}
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-gray-500 text-sm">Successful Matches</h3>
                        {loading ? (
                            <div className="animate-pulse h-8 bg-gray-200 rounded mt-1"></div>
                        ) : (
                            <p className="text-2xl font-bold text-green-600">{stats.successfulMatches}</p>
                        )}
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-gray-500 text-sm">Average Confidence</h3>
                        {loading ? (
                            <div className="animate-pulse h-8 bg-gray-200 rounded mt-1"></div>
                        ) : (
                            <p className="text-2xl font-bold text-amber-500">{stats.averageConfidence}%</p>
                        )}
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-gray-500 text-sm">High Risk Alerts</h3>
                        <p className="text-2xl font-bold text-red-600">{statistics.highRiskAlerts}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Report Period</h2>
                        <div className="flex space-x-2">
                            {['daily', 'weekly', 'monthly'].map(period => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`px-4 py-2 rounded-lg text-sm ${
                                        selectedPeriod === period
                                            ? 'bg-blue-900 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {period.charAt(0).toUpperCase() + period.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">Recent Reports</h2>
                    </div>
                    <div className="divide-y">
                        {recentReports.map(report => (
                            <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">{report.title}</h3>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {report.date}
                                            </span>
                                            <span className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {report.time}
                                            </span>
                                            <span className="flex items-center">
                                                <Filter className="w-4 h-4 mr-1" />
                                                {report.detections} detections, {report.matches} matches
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleGenerateReport}
                                        className="btn btn-secondary text-sm"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download {report.format}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}