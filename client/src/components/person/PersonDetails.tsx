import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Share2, Edit, Trash2, Map } from 'lucide-react';
import axios from 'axios';
import config from '../../config/config';
import { useTranslation } from 'react-i18next';

interface Detection {
    id: string;
    location: string;
    timestamp: string;
    confidence: number;
}

interface Person {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    dateOfBirth: string;
    address: string;
    type: 'suspect' | 'missing-person';
    status: string;
    riskLevel?: string;
    recentDetections: Detection[];
}

export default function PersonDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [person, setPerson] = useState<Person | null>(null);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        fetchPersonDetails();
    }, [id]);

    const fetchPersonDetails = async () => {
        try {
            const response = await axios.get<{data: Person}>(`${config.apiUrl}/api/persons/${id}`);
            setPerson(response.data.data);
        } catch (error) {
            console.error('Error fetching person details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(t('person.actions.confirmDelete'))) {
            try {
                await axios.delete(`${config.apiUrl}/api/persons/${id}`);
                navigate('/suspects');
            } catch (error) {
                console.error('Error deleting person:', error);
            }
        }
    };

    if (loading || !person) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            {person.firstName} {person.lastName}
                        </h1>
                        <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{t('person.basicInfo.address')}: {person.address}</span>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button className="btn btn-secondary">
                            <Share2 className="w-4 h-4 mr-2" />
                            {t('person.actions.share')}
                        </button>
                        <button className="btn btn-secondary">
                            <Edit className="w-4 h-4 mr-2" />
                            {t('person.actions.edit')}
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="btn bg-red-500 hover:bg-red-600 text-white"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('person.actions.delete')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">
                            {t('person.basicInfo.title')}
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-500">
                                    {t('person.basicInfo.name')}
                                </label>
                                <p>{person.firstName} {person.lastName}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">
                                    {t('person.basicInfo.age')}
                                </label>
                                <p>{person.age} {t('person.basicInfo.years')}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">
                                    {t('person.basicInfo.dob')}
                                </label>
                                <p>{new Date(person.dateOfBirth).toLocaleDateString(i18n.language)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Case Information */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">
                            {t('person.caseInfo.title')}
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-500">
                                    {t('person.caseInfo.status')}
                                </label>
                                <p className="capitalize">{t(`person.status.${person.status}`)}</p>
                            </div>
                            {person.type === 'suspect' && person.riskLevel && (
                                <div>
                                    <label className="text-sm text-gray-500">
                                        {t('person.caseInfo.riskLevel')}
                                    </label>
                                    <p className="capitalize">{t(`person.riskLevel.${person.riskLevel}`)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Detections */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">
                            {t('person.detections.title')}
                        </h2>
                        {person.recentDetections?.length > 0 ? (
                            <div className="space-y-4">
                                {person.recentDetections.map((detection) => (
                                    <div key={detection.id} className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center text-sm">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                <span>{t('person.detections.location')}: {detection.location}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Clock className="w-3 h-3 mr-1" />
                                                <span>{t('person.detections.time')}: {new Date(detection.timestamp).toLocaleString(i18n.language)}</span>
                                            </div>
                                        </div>
                                        <span className="text-amber-600 font-medium">
                                            {detection.confidence}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">
                                {t('person.detections.noDetections')}
                            </p>
                        )}
                    </div>
                </div>

                {/* Map View Button */}
                <button className="btn btn-primary mt-6">
                    <Map className="w-4 h-4 mr-2" />
                    {t('person.actions.viewOnMap')}
                </button>
            </div>
        </div>
    );
} 