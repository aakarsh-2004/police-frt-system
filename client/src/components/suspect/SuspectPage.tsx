import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import SuspectGrid from './SuspectGrid';
import SuspectDetail from './SuspectDetails';
import SuspectMatches from './SuspectMatches';
import ShareDialog from '../common/ShareDialog';
import axios from 'axios';
import config from '../../config/config';
import CreatePersonModal from './CreatePersonModal';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
type ViewType = 'suspects' | 'missing';

interface Person {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    dateOfBirth: string;
    gender: string;
    email: string;
    phone: string;
    address: string;
    personImageUrl: string;
    type: string;
    nationalId: string;
    nationality: string;
}

interface PersonResponse {
    data: {
        data: Person[];
        message: string;
    }
}

export default function SuspectPage() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [currentView, setCurrentView] = useState<ViewType>('suspects');
    const [persons, setPersons] = useState<Person[]>([]);
    const [filteredPersons, setFilteredPersons] = useState<Person[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPersons = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get<PersonResponse>(`${config.apiUrl}/api/persons`);
            const allPersons = response.data.data;
            
            // Filter based on current view (suspects or missing persons)
            const viewFilteredPersons = allPersons.filter((person) => 
                currentView === 'suspects' ? person.type === 'suspect' : person.type === 'missing-person'
            );
            
            setPersons(viewFilteredPersons);
            setFilteredPersons(viewFilteredPersons); // Initialize filtered results with all persons
        } catch (error) {
            console.error('Error fetching persons:', error);
        } finally {
            setLoading(false);
        }
    }, [currentView]);

    useEffect(() => {
        fetchPersons();
    }, [fetchPersons]);

    const handleCreatePerson = async (formData: FormData) => {
        try {
            setIsSubmitting(true);
            await axios.post(`${config.apiUrl}/api/persons`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchPersons();
            setShowCreateModal(false);
            toast.success('Person created successfully');
        } catch (err) {
            console.error('Error creating person:', err);
            toast.error('Failed to create person');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePerson = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this person?')) {
            try {
                await axios.delete(`${config.apiUrl}/api/persons/${id}`);
                fetchPersons();
                setSelectedSuspectId(null);
            } catch (err) {
                console.error('Error deleting person:', err);
                setError('Failed to delete person');
            }
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            // If search is empty, show all persons of current type
            setFilteredPersons(persons);
            return;
        }

        const searchTerms = searchQuery.toLowerCase().split(' ');
        const filtered = persons.filter(person => {
            const searchableText = `
                ${person.firstName.toLowerCase()} 
                ${person.lastName.toLowerCase()} 
                ${person.address?.toLowerCase() || ''} 
                ${person.nationalId?.toLowerCase() || ''}
            `;
            
            // Check if all search terms are found in the searchable text
            return searchTerms.every(term => searchableText.includes(term));
        });

        setFilteredPersons(filtered);
    };

    const handleViewDetails = (personId: string) => {
        navigate(`/person/${personId}`);
    };

    const getTranslatedText = (key: string) => {
        if (!t) return '';
        return currentLanguage === 'en' ? t(key) : t(key);
    };

    const handleViewChange = (view: ViewType) => {
        setCurrentView(view);
        setSearchQuery(''); // Clear search query
        setFilteredPersons([]); // Clear filtered results
        fetchPersons(); // Fetch new list based on current view
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    return (
        <div className="p-6 dark:bg-gray-900">
            <div className="max-w-[2000px] mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">
                            {currentView === 'suspects' ? 
                                (currentLanguage === 'en' ? 'Suspects' : 'संदिग्ध') : 
                                (currentLanguage === 'en' ? 'Missing Persons' : 'लापता व्यक्ति')
                            }
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn btn-primary flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New {currentView === 'suspects' ? 'Suspect' : 'Missing Person'}
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    // Perform search on each input change
                                    const query = e.target.value.toLowerCase();
                                    if (!query.trim()) {
                                        setFilteredPersons(persons);
                                    } else {
                                        const filtered = persons.filter(person => {
                                            const searchableText = `
                                                ${person.firstName.toLowerCase()} 
                                                ${person.lastName.toLowerCase()} 
                                                ${person.address?.toLowerCase() || ''} 
                                                ${person.nationalId?.toLowerCase() || ''}
                                            `;
                                            return searchableText.includes(query);
                                        });
                                        setFilteredPersons(filtered);
                                    }
                                }}
                                placeholder={currentLanguage === 'en' ? 'Search by name, location...' : 'नाम, स्थान से खोजें...'}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            <Search className="w-4 h-4 mr-2" />
                            {currentLanguage === 'en' ? 'Search' : 'खोजें'}
                        </button>
                    </form>
                </div>

                <div className="mb-6">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => handleViewChange('suspects')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                                ${currentView === 'suspects'
                                    ? 'bg-blue-900 text-white dark:bg-blue-800'
                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white'
                                }`}
                        >
                            {getTranslatedText('suspects.tabs.suspects')}
                        </button>
                        <button
                            onClick={() => handleViewChange('missing')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                                ${currentView === 'missing'
                                    ? 'bg-blue-900 text-white dark:bg-blue-800'
                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white'
                                }`}
                        >
                            {getTranslatedText('suspects.tabs.missingPersons')}
                        </button>
                    </div>
                </div>

                {selectedSuspectId ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SuspectDetail
                            suspectId={selectedSuspectId}
                            onClose={() => setSelectedSuspectId(null)}
                            onShare={() => setShowShareDialog(true)}
                            onDelete={handleDeletePerson}
                            persons={persons}
                        />
                        <SuspectMatches suspectId={selectedSuspectId} />
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                            {t(`suspects.pageHeadings.${currentView === 'suspects' ? 'criminalSuspects' : 'missingPersons'}`)}
                        </h2>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                            <SuspectGrid
                                persons={filteredPersons}
                                onViewDetails={handleViewDetails}
                            />
                        </div>
                    </>
                )}
            </div>

            {showShareDialog && (
                <ShareDialog
                    title="Share Profile"
                    onClose={() => setShowShareDialog(false)}
                    options={[
                        { id: 'team', label: 'Share with Team', icon: 'users' },
                        { id: 'department', label: 'Share with Department', icon: 'building' },
                        { id: 'export', label: 'Export Profile', icon: 'download' },
                        { id: 'link', label: 'Copy Profile Link', icon: 'link' }
                    ]}
                    onShare={(option) => {
                        console.log('Sharing via:', option);
                        setShowShareDialog(false);
                    }}
                />
            )}

            {showCreateModal && (
                <CreatePersonModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreatePerson}
                    type={currentView === 'suspects' ? 'suspect' : 'missing-person'}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}