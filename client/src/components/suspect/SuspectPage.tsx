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

export default function SuspectsPage() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [currentView, setCurrentView] = useState<ViewType>('suspects');
    const [persons, setPersons] = useState<Person[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();

    const fetchPersons = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get<PersonResponse>(`${config.apiUrl}/api/persons`);
            const filteredPersons = response.data.data.filter((person) => 
                currentView === 'suspects' ? person.type === 'suspect' : person.type === 'missing-person'
            );
            setPersons(filteredPersons);
            setError(null);
        } catch (err) {
            setError('Failed to fetch persons');
            console.error('Error fetching persons:', err);
        } finally {
            setLoading(false);
        }
    }, [currentView]);

    useEffect(() => {
        fetchPersons();
    }, [fetchPersons]);

    const handleCreatePerson = async (formData: FormData) => {
        try {
            const response = await axios.post(`${config.apiUrl}/api/persons`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (user?.role !== 'admin') {
                toast.success('Request submitted successfully. Waiting for admin approval.');
            } else {
                toast.success('Person created successfully');
            }

            fetchPersons();
            setShowCreateModal(false);
        } catch (err) {
            console.error('Error creating person:', err);
            toast.error('Failed to create person');
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
        // Filter persons based on search query
        // Implementation depends on your requirements
    };

    const handleViewDetails = (personId: string) => {
        navigate(`/person/${personId}`);
    };

    const getTranslatedText = (key: string) => {
        if (!t) return '';
        return currentLanguage === 'en' ? t(key) : t(key);
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
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold dark:text-white">
                            {currentView === 'suspects' ? 'Suspects' : 'Missing Persons'}
                        </h1>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {user?.role === 'admin' && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn btn-primary flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New {currentView === 'suspects' ? 'Suspect' : 'Missing Person'}
                        </button>
                    )}
                </div>

                <div className="mb-6">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setCurrentView('suspects')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                                ${currentView === 'suspects'
                                    ? 'bg-blue-900 text-white dark:bg-blue-800'
                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white'
                                }`}
                        >
                            {getTranslatedText('suspects.tabs.suspects')}
                        </button>
                        <button
                            onClick={() => setCurrentView('missing')}
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
                                persons={persons}
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
                />
            )}
        </div>
    );
}