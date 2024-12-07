import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import SearchFilters from './SearchFilters';
import axios from 'axios';
import config from '../../config/config';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

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
    recognizedPerson?: {
        length: number;
    }[];
}

interface SearchFilters {
    locations: string[];
    minConfidence: number;
}

export default function SearchLookup() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const [filters, setFilters] = useState<SearchFilters>({
        locations: [],
        minConfidence: 80
    });

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

    // Function to handle search
    const handleSearch = async (e?: React.FormEvent, searchFilters = filters) => {
        if (e) {
            e.preventDefault();
        }

        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (query.trim()) {
                params.append('q', query);
            }
            
            if (searchFilters.locations.length > 0) {
                params.append('locations', searchFilters.locations.join(','));
            }
            
            if (searchFilters.minConfidence > 0) {
                params.append('minConfidence', searchFilters.minConfidence.toString());
            }

            const response = await axios.get<{data: SearchResult[]}>(`${config.apiUrl}/api/persons/search?${params}`);
            
            if (response.data && Array.isArray(response.data.data)) {
                setResults(response.data.data);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error('Error searching:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters: SearchFilters) => {
        setFilters(newFilters);
        // Optionally trigger a new search with the updated filters
        if (query) {
            handleSearch(undefined, newFilters);
        }
    };

    // Load all persons initially
    useEffect(() => {
        fetchAllPersons();
    }, []);

    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold dark:text-white">
                        {currentLanguage === 'en' ? 'Search & Lookup' : 'खोज और लुकअप'}
                    </h1>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={currentLanguage === 'en' ? 'Search by name, location...' : 'नाम, स्थान से खोजें...'}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            <Search className="w-4 h-4 mr-2" />
                            {currentLanguage === 'en' ? 'Search' : 'खोजें'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn btn-secondary"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            {currentLanguage === 'en' ? 'Filters' : 'फ़िल्टर'}
                        </button>
                    </form>

                    {showFilters && <SearchFilters onFilterChange={handleFilterChange} />}
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {results.map((person) => (
                            <div key={person.id} className="bg-white rounded-lg shadow-lg overflow-hidden dark:bg-gray-800">
                                <div className="aspect-square">
                                    <img
                                        src={person.personImageUrl}
                                        alt={`${person.firstName} ${person.lastName}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold">
                                        {person.firstName} {person.lastName}
                                    </h3>
                                    
                                    <div className="mt-2 text-sm">
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {currentLanguage === 'en' ? 'Location: ' : 'स्थान: '}{person.address}
                                        </p>
                                        {person.type === 'missing-person' && person.missingPerson && (
                                            <>
                                                <p className="text-gray-600 dark:text-white">
                                                    {currentLanguage === 'en' ? 'Last Seen: ' : 'आखिरी बार देखा गया: '}
                                                    {new Date(person.missingPerson.lastSeenDate).toLocaleDateString()}
                                                </p>
                                                <p className="text-gray-600 dark:text-white">
                                                    {currentLanguage === 'en' ? 'Location: ' : 'स्थान: '}
                                                    {person.missingPerson.lastSeenLocation}
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    {person.recognizedPerson && person.recognizedPerson.length > 0 && (
                                        <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                                            {person.recognizedPerson.length} {person.recognizedPerson.length === 1 ? 'match' : 'matches'} found
                                        </div>
                                    )}

                                    <button
                                        onClick={() => navigate(`/person/${person.id}`)}
                                        className="btn btn-primary w-full mt-4"
                                    >
                                        {currentLanguage === 'en' ? 'View Details' : 'विवरण देखें'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        {query ? 
                            (currentLanguage === 'en' ? 'No results found' : 'कोई परिणाम नहीं मिला') : 
                            (currentLanguage === 'en' ? 'Enter search query' : 'खोज क्वेरी दर्ज करें')}
                    </div>
                )}
            </div>
        </div>
    );
}