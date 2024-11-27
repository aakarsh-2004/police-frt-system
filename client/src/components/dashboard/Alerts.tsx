import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, User, MapPin, Clock, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { alerts } from './alertList';

const typeStyles = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200'
};


export default function AlertSystem() {
    const [enhancingImage, setEnhancingImage] = useState<string | null>(null);
    const [visibleAlerts, setVisibleAlerts] = useState<number>(3);
    const alertsContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const activeAlerts = alerts.filter(alert => alert.status === 'active');

    useEffect(() => {
        const interval = setInterval(() => {
            if (alertsContainerRef.current) {
                alertsContainerRef.current.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleViewAll = () => {
        navigate('/alerts');
    };

    const handleInvestigate = (alertId: string) => {
        navigate(`/alerts/${alertId}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg h-full">
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h2 className="text-lg font-semibold">Active Alerts</h2>
                    </div>
                    <button
                        onClick={handleViewAll}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        View All
                    </button>
                </div>
            </div>

            <div
                ref={alertsContainerRef}
                className="p-4 space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto scroll-smooth"
            >
                {activeAlerts.map((alert, index) => (
                    <div
                        key={alert.id}
                        className={`border-l-4 rounded-r-lg p-4 hover:shadow-md transition-shadow
                        ${typeStyles[alert.severity]} ${index >= visibleAlerts ? 'hidden' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                                ${typeStyles[alert.severity]}`}>
                                {alert.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {alert.timestamp}
                            </span>
                        </div>

                        <h3 className="font-medium mb-2">{alert.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{alert.description}</p>

                        {alert.capturedImage && alert.originalImage && (
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Captured</span>
                                        <button
                                            onClick={() => setEnhancingImage(alert?.capturedImage || '')}
                                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                                        >
                                            <SlidersHorizontal className="w-3 h-3 mr-1" />
                                            Enhance
                                        </button>
                                    </div>
                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                            src={alert.capturedImage}
                                            alt="Captured"
                                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                            onClick={() => setEnhancingImage(alert?.capturedImage || '')}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-500">Match</span>
                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
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
                            <div className="flex items-center space-x-3">
                                <span className="flex items-center text-gray-600">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {alert.location}
                                </span>
                                {alert.matchConfidence && (
                                    <span className="flex items-center text-amber-600 font-medium">
                                        <User className="w-4 h-4 mr-1" />
                                        {alert.matchConfidence}% Match
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => handleInvestigate(alert.id)}
                                className="btn btn-primary text-sm flex items-center"
                            >
                                Investigate
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </div>
                ))}

                {activeAlerts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No active alerts at the moment
                    </div>
                )}

                {activeAlerts.length > visibleAlerts && (
                    <button
                        onClick={() => setVisibleAlerts(prev => prev + 3)}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
                    >
                        Show More Alerts
                    </button>
                )}
            </div>

            {/* {enhancingImage && (
                <ImageEnhancer
                    imageUrl={enhancingImage}
                    onClose={() => setEnhancingImage(null)}
                />
            )} */}
        </div>
    );
}