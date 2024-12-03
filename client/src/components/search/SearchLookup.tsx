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
}

export default function SearchLookup() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();

    const getTranslatedText = (key: string) => {
        return currentLanguage === 'en' ? t(key) : t(key);
    };

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
                <h1 className="text-2xl font-bold mb-6">
                    {currentLanguage === 'en' ? 'Search & Lookup' : 'खोज और लुकअप'}
                </h1>

                <div className="flex items-center space-x-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={currentLanguage === 'en' ? 
                                'Search by name, ID, or location...' : 
                                'नाम, आईडी या स्थान से खोजें...'}
                            className="w-full pl-12 pr-4 py-3 bg-white border rounded-lg text-black"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="btn btn-secondary flex items-center"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        {currentLanguage === 'en' ? 'Filters' : 'फ़िल्टर'}
                    </button>
                </div>

                {showFilters && (
                    <div className="mb-6">
                        <SearchFilters />
                    </div>
                )}

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">
                            {currentLanguage === 'en' ? 'Searching...' : 'खोज रहा है...'}
                        </div>
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 dark:bg-gray-900">
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
        </div>
    );
}