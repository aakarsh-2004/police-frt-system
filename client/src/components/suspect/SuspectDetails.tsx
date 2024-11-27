import {
    Share2, MapPin, Briefcase, Scale,
    Shield, AlertCircle, Calendar
} from 'lucide-react';
import { suspects } from './suspects';

interface SuspectDetailProps {
    suspectId: string;
    onClose: () => void;
    onShare: () => void;
}

export default function SuspectDetail({ suspectId, onClose, onShare }: SuspectDetailProps) {
    const suspect = suspects.find(suspect => suspect.id === suspectId);

    if (!suspect) return null;

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(100vh-2rem)]">
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">Suspect Details</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onShare}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <Share2 className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Main Image and Basic Info */}
                <div className="space-y-4">
                    <div className="aspect-square rounded-lg overflow-hidden max-w-sm mx-auto">
                        <img
                            src={suspect.image}
                            alt={suspect.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold">{suspect.name}</h1>
                        <p className="text-gray-600">ID: {suspect.id}</p>
                    </div>
                </div>

                {/* Status and Alert Level */}
                <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                        ${suspect.status === 'active'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'}`}>
                        {suspect.status.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                        Alert Level: {suspect.alertLevel}
                    </span>
                </div>

                {/* Criminal History */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center">
                        <Briefcase className="w-5 h-5 mr-2" />
                        Criminal History
                    </h3>
                    <div className="space-y-3">
                        <div className="p-4 bg-red-50 rounded-lg">
                            <h4 className="font-medium text-red-800 mb-2">Primary Charges</h4>
                            <ul className="list-disc list-inside text-red-700 space-y-1">
                                <li>Armed Robbery - Case #CR-2023-156</li>
                                <li>Assault with Deadly Weapon - Case #CR-2023-189</li>
                                <li>Grand Theft Auto - Case #CR-2023-201</li>
                                <li>Breaking and Entering - Case #CR-2023-245</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg">
                            <h4 className="font-medium text-amber-800 mb-2">Pending Cases</h4>
                            <ul className="list-disc list-inside text-amber-700 space-y-1">
                                <li>Vehicle Theft - Case #CR-2024-023</li>
                                <li>Breaking and Entering - Case #CR-2024-045</li>
                                <li>Assault - Case #CR-2024-067</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Legal Status */}
                <div>
                    <h3 className="text-lg font-medium flex items-center mb-3">
                        <Scale className="w-5 h-5 mr-2" />
                        Legal Status
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-500">Bail Status</span>
                            <p className="font-medium text-red-600">Not Eligible</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-500">Court Appearances</span>
                            <p className="font-medium">3 Pending</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-500">Custody Status</span>
                            <p className="font-medium text-amber-600">Wanted</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-500">Risk Level</span>
                            <p className="font-medium text-red-600">High</p>
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                <div>
                    <h3 className="text-lg font-medium flex items-center mb-3">
                        <Shield className="w-5 h-5 mr-2" />
                        Additional Information
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">Known Associates</h4>
                            <ul className="space-y-2">
                                <li className="flex items-center justify-between">
                                    <span>Rajesh Kumar (ID: KA-001)</span>
                                    <button className="text-blue-600 hover:text-blue-800">View Profile</button>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span>Amit Shah (ID: KA-002)</span>
                                    <button className="text-blue-600 hover:text-blue-800">View Profile</button>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">Known Locations</h4>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                    MP Nagar, Zone 1, Bhopal
                                </li>
                                <li className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                    New Market Area, TT Nagar, Bhopal
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">Recent Activities</h4>
                            <ul className="space-y-2">
                                <li className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                        <span>Spotted at Railway Station</span>
                                    </div>
                                    <span className="text-sm text-gray-500">2 days ago</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2 text-gray-500" />
                                        <span>Attempted Arrest - Escaped</span>
                                    </div>
                                    <span className="text-sm text-gray-500">5 days ago</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}