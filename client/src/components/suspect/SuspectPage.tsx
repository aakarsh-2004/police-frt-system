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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <form onSubmit={handleSearch} className="flex items-center space-x-4 flex-1">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, ID, or location..."
                                className="w-full pl-12 pr-4 py-3 bg-white border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button className="btn btn-secondary flex items-center px-4 py-3">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </button>
                        <button className="btn btn-primary px-4 py-3">
                            Search Database
                        </button>
                    </form>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary ml-4 flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New {currentView === 'suspects' ? 'Suspect' : 'Missing Person'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shadow-sm">
                        <button
                            onClick={() => setCurrentView('suspects')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                                ${currentView === 'suspects'
                                    ? 'bg-blue-900 text-white dark:bg-blue-800'
                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white'
                                }`}
                        >
                            Suspects
                        </button>
                        <button
                            onClick={() => setCurrentView('missing')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                                ${currentView === 'missing'
                                    ? 'bg-blue-900 text-white dark:bg-blue-800'
                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white'
                                }`}
                        >
                            Missing Persons
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
                            {currentView === 'suspects' ? 'Criminal Suspects' : 'Missing Persons'}
                        </h2>
                        <SuspectGrid
                            persons={persons}
                            onSuspectClick={setSelectedSuspectId}
                        />
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