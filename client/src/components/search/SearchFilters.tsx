import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import axios from 'axios';
import config from '../../config/config';

interface SearchFiltersProps {
    onFilterChange: (filters: {
        locations: string[];
        minConfidence: number;
    }) => void;
}

export default function SearchFilters({ onFilterChange }: SearchFiltersProps) {
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [minConfidence, setMinConfidence] = useState(80);
    const [locations, setLocations] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch camera locations on component mount
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get<{data: Array<{location: string}>}>(`${config.apiUrl}/api/cameras`);
                const uniqueLocations = [...new Set(response.data.map(camera => camera.location))];
                setLocations(uniqueLocations);
            } catch (error) {
                console.error('Error fetching locations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    // Handle location selection
    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedLocations(selectedOptions);
        onFilterChange({
            locations: selectedOptions,
            minConfidence
        });
    };

    // Handle confidence change
    const handleConfidenceChange = (value: number) => {
        setMinConfidence(value);
        onFilterChange({
            locations: selectedLocations,
            minConfidence: value
        });
    };

    // Apply filters
    const applyFilters = (locations: string[], confidence: number) => {
        onFilterChange({
            locations,
            minConfidence: confidence
        });
    };

    // Reset filters
    const handleReset = () => {
        setSelectedLocations([]);
        setMinConfidence(80);
        onFilterChange({
            locations: [],
            minConfidence: 80
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2 flex items-center dark:text-gray-300">
                        <MapPin className="w-4 h-4 mr-2" />
                        Locations
                    </label>
                    <select
                        multiple
                        value={selectedLocations}
                        onChange={handleLocationChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-40 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                        {loading ? (
                            <option disabled>Loading locations...</option>
                        ) : (
                            locations.map(location => (
                                <option key={location} value={location}>{location}</option>
                            ))
                        )}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        Minimum Match Confidence ({minConfidence}%)
                    </label>
                    <div className="space-y-2">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={minConfidence}
                            onChange={(e) => handleConfidenceChange(Number(e.target.value))}
                            className="w-full dark:bg-gray-700"
                        />
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
                <button
                    onClick={handleReset}
                    className="btn btn-secondary"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}