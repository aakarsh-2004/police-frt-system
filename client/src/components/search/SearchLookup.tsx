import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import SearchFilters from './SearchFilters';
import axios from 'axios';
import config from '../../config/config';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
    id: string;
    firstName: string;
    lastName: string;
    personImageUrl: string;
    type: string;
    address: string;
    suspect?: {
        riskLevel: string;
        foundStatus: boolean;
    };
    missingPerson?: {
        lastSeenDate: string;
        lastSeenLocation: string;
        foundStatus: boolean;
    };
}

export default function SearchLookup() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    // Function to fetch all persons
    const fetchAllPersons = async () => {
        try {
            setLoading(true);
            const response = await axios.get<{data: SearchResult[]}>(`${config.apiUrl}/api/persons`);
            
            if (response.data && Array.isArray(response.data.data)) {
                setResults(response.data.data);
            } else {
                console.error('Invalid response format:', response.data);
                setResults([]);
            }
        } catch (error) {
            console.error('Error fetching persons:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Function to search persons
    const searchPersons = async (searchQuery: string) => {
        try {
            setLoading(true);
            const response = await axios.get<{data: SearchResult[]}>(`${config.apiUrl}/api/persons/search`, {
                params: { query: searchQuery }
            });
            
            if (response.data && Array.isArray(response.data.data)) {
                setResults(response.data.data);
            } else {
                console.error('Invalid response format:', response.data);
                setResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial load - fetch all persons
    useEffect(() => {
        fetchAllPersons();
    }, []);

    // Handle search
    const handleSearch = () => {
        if (query.trim()) {
            searchPersons(query.trim());
        } else {
            fetchAllPersons();
        }
    };

    // Handle enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="mb-6">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="flex items-center space-x-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type name to search persons..."
                                    className="w-full pl-4 pr-12 py-3 bg-white border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <Search className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className="btn btn-secondary py-3"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                            </button>
                        </div>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {showFilters && (
                        <div className="lg:col-span-1">
                            <SearchFilters />
                        </div>
                    )}

                    <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.map((person) => (
                                    <div
                                        key={person.id}
                                        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                                        onClick={() => navigate(`/person/${person.id}`)}
                                    >
                                        <div className="relative pt-[125%] bg-gray-100">
                                            <img
                                                src={person.personImageUrl}
                                                alt={`${person.firstName} ${person.lastName}`}
                                                className="absolute inset-0 w-full h-full object-contain"
                                                style={{ 
                                                    objectPosition: 'center',
                                                    transform: 'scale(0.95)'
                                                }}
                                            />
                                            <div className="absolute top-2 right-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    person.type === 'suspect' 
                                                        ? person.suspect?.riskLevel === 'high'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-orange-100 text-orange-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {person.type === 'suspect' 
                                                        ? `${person.suspect?.riskLevel.toUpperCase()} Risk`
                                                        : 'MISSING PERSON'
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg">
                                                {person.firstName} {person.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">{person.address}</p>
                                            
                                            {person.type === 'missing-person' && person.missingPerson && (
                                                <div className="mt-2 text-sm">
                                                    <p className="text-gray-600">
                                                        Last seen: {new Date(person.missingPerson.lastSeenDate).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        Location: {person.missingPerson.lastSeenLocation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                {loading ? 'Loading...' : 
                                 query ? `No results found for "${query}"` : 
                                 'No persons found in database'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}