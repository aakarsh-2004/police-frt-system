import React from 'react';
import { FileText, Download, BarChart2 } from 'lucide-react';

interface Report {
    id: string;
    title: string;
    type: 'daily' | 'weekly' | 'monthly' | 'incident';
    generatedAt: string;
    status: 'completed' | 'processing';
    size: string;
    format: 'PDF' | 'XLSX';
}

const reports: Report[] = [
    {
        id: 'rep-1',
        title: 'AI Daily Recognition System Report',
        type: 'daily',
        generatedAt: '2024-03-14 00:00:00',
        status: 'completed',
        size: '2.4 MB',
        format: 'PDF'
    },
    {
        id: 'rep-2',
        title: 'Weekly Performance Analytics',
        type: 'weekly',
        generatedAt: '2024-03-14 01:00:00',
        status: 'processing',
        size: '4.1 MB',
        format: 'XLSX'
    }
];

const reportTypes = [
    { id: 'daily', label: 'AI Daily Reports' },
    { id: 'weekly', label: 'Weekly Reports' },
    { id: 'monthly', label: 'Monthly Reports' },
    { id: 'incident', label: 'Incident Reports' }
];

export default function ReportsPage() {
    const [activeType, setActiveType] = React.useState('all');

    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <FileText className="w-6 h-6 text-blue-900" />
                        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="btn btn-secondary text-sm">
                            Schedule Report
                        </button>
                        <button className="btn btn-primary text-sm">
                            Generate New Report
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {reportTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setActiveType(type.id)}
                                className={`p-4 rounded-lg border text-left transition-colors ${activeType === type.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-500'
                                    }`}
                            >
                                <h3 className="font-medium mb-1">{type.label}</h3>
                                <p className="text-sm text-gray-600">
                                    Last generated: Today at 00:00
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    {report.format === 'PDF' ? (
                                        <FileText className="w-5 h-5 text-red-600" />
                                    ) : (
                                        <BarChart2 className="w-5 h-5 text-green-600" />
                                    )}
                                    <div>
                                        <h3 className="font-medium">{report.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            Generated: {report.generatedAt}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                        {report.size} • {report.format}
                                    </span>
                                    {report.status === 'completed' ? (
                                        <button className="btn btn-primary text-sm">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </button>
                                    ) : (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            Processing...
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}