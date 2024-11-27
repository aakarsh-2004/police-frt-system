import { useState } from 'react';
import { Filter, Calendar, MapPin, Camera, User } from 'lucide-react';


const allLocations = [
    'MP Nagar Zone 1',
    'MP Nagar Zone 2',
    'New Market',
    'TT Nagar',
    'Habibganj',
    'Arera Colony',
    'Shahpura',
    'Kolar Road',
    'Bairagarh',
    'BHEL',
    'Govindpura',
    'Piplani',
    'Ayodhya Bypass',
    'Misrod',
    'Karond',
    'Berasia Road',
    'Jahangirabad',
    'Kohefiza',
    'Idgah Hills',
    'Shyamla Hills',
    'Bittan Market',
    'Trilanga',
    '10 No. Market',
    'Chuna Bhatti',
    'Lalghati',
    'Airport Area',
    'Gandhi Nagar',
    'Saket Nagar',
    'Malviya Nagar',
    'Rachna Nagar'
];

const allCameras = [
    'MP Nagar Gate Cam 1',
    'MP Nagar Gate Cam 2',
    'New Market Entry Cam',
    'New Market Exit Cam',
    'TT Nagar Main Road Cam',
    'Habibganj Station Cam 1',
    'Habibganj Station Cam 2',
    'Arera Colony Market Cam',
    'DB Mall Entry Cam',
    'DB Mall Exit Cam',
    'BHEL Gate 1 Cam',
    'BHEL Gate 2 Cam',
    'Bittan Market Cam',
    'Van Vihar Gate Cam',
    'Boat Club Cam',
    'People\'s Mall Cam 1',
    'People\'s Mall Cam 2',
    'Chowk Bazaar Cam',
    'Kamla Park Cam',
    'Moti Masjid Area Cam',
    'Manisha Market Cam',
    'Bairagarh Station Cam',
    'Shahpura Lake Cam',
    'Kolar Road Junction Cam',
    'Govindpura Industrial Cam'
];

export default function SearchFilters() {
    const [locationSearch, setLocationSearch] = useState('');
    const [cameraSearch, setCameraSearch] = useState('');

    const filteredLocations = allLocations.filter(location =>
        location.toLowerCase().includes(locationSearch.toLowerCase())
    );

    const filteredCameras = allCameras.filter(camera =>
        camera.toLowerCase().includes(cameraSearch.toLowerCase())
    );

    return (
        <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-blue-900" />
                    Search Filters
                </h3>
            </div>

            <div className="space-y-4">
                {/* Date Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="date"
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                            type="date"
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Locations */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Locations
                    </label>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Search locations..."
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <select
                            multiple
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-40"
                        >
                            {filteredLocations.map(location => (
                                <option key={location} value={location}>{location}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Cameras */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Camera className="w-4 h-4 mr-2" />
                        Cameras
                    </label>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Search cameras..."
                            value={cameraSearch}
                            onChange={(e) => setCameraSearch(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <select
                            multiple
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-40"
                        >
                            {filteredCameras.map(camera => (
                                <option key={camera} value={camera}>{camera}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Match Confidence */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Minimum Match Confidence
                    </label>
                    <div className="flex items-center space-x-4">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            className="flex-1"
                        />
                        <span className="text-sm font-medium w-16">
                            80%
                            {/* {filters.matchConfidence}% */}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
                <button
                    className="btn btn-secondary"
                >
                    Reset
                </button>
                <button className="btn btn-primary">
                    Apply Filters
                </button>
            </div>
        </div>
    );
}