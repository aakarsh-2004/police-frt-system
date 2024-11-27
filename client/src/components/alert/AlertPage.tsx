import { useState } from 'react';
import { AlertTriangle, Bell, Filter, ChevronDown, MapPin, Clock, User, SlidersHorizontal } from 'lucide-react';
import ImageEnhancer from '../image/ImageEnhancer';
import { alerts } from './alerts';

const severityStyles = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800'
};

const statusStyles = {
    active: 'bg-red-100 text-red-800',
    investigating: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800'
};

export default function AlertsPage() {
    const [showFilters, setShowFilters] = useState(false);
    const [enhancingImage, setEnhancingImage] = useState<string | null>(null);



    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Bell className="w-6 h-6 text-red-600" />
                        <h1 className="text-2xl font-bold">Alert Management</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowFilters(true)}
                            className="btn btn-secondary text-sm flex items-center"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filter Alerts
                            <ChevronDown className="w-4 h-4 ml-1" />
                        </button>
                        <button className="btn btn-primary text-sm">
                            Configure Alert Rules
                        </button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <AlertTriangle className={`w-5 h-5 ${alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'
                                        }`} />
                                    <div>
                                        <h3 className="font-medium">{alert.title}</h3>
                                        <p className="text-sm text-gray-600">{alert.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium
                                ${severityStyles[alert.severity]}`}>
                                        {alert.severity.toUpperCase()}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium
                                ${statusStyles[alert.status]}`}>
                                        {alert.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {alert.capturedImage && alert.originalImage && (
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-600">Captured Image</span>
                                            <button
                                                onClick={() => setEnhancingImage(alert.capturedImage)}
                                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                            >
                                                <SlidersHorizontal className="w-4 h-4 mr-1" />
                                                Enhance
                                            </button>
                                        </div>
                                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={alert.capturedImage}
                                                alt="Captured"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-gray-600">Database Match</span>
                                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={alert.originalImage}
                                                alt="Original"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-4">
                                    <span className="flex items-center text-gray-600">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {alert.location}
                                    </span>
                                    <span className="flex items-center text-gray-600">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {alert.timestamp}
                                    </span>
                                    {alert.assignedTo && (
                                        <span className="flex items-center text-gray-600">
                                            <User className="w-4 h-4 mr-1" />
                                            {alert.assignedTo}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    {alert.matchConfidence && (
                                        <span className="text-amber-600 font-medium">
                                            {alert.matchConfidence}% Match
                                        </span>
                                    )}
                                    {alert.status === 'active' && (
                                        <button
                                            className="btn btn-secondary text-sm"
                                        >
                                            Investigate
                                        </button>
                                    )}
                                    {alert.status !== 'resolved' && (
                                        <button
                                            className="btn btn-primary text-sm"
                                        >
                                            Resolve
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {alerts.length === 0 && (
                        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                            <p className="text-gray-500">No alerts found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* {showFilters && (
                <AlertFilters onClose={() => setShowFilters(false)} />
            )} */}

            {enhancingImage && (
                <ImageEnhancer
                    imageUrl={enhancingImage}
                    onClose={() => setEnhancingImage(null)}
                />
            )}
        </div>
    );
}