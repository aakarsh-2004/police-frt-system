import { useState, useEffect } from 'react';
import { Clock, User, Check, X } from 'lucide-react';
import axios from 'axios';
import config from '../../config/config';
import { useAuth } from '../../context/AuthContext';

interface Request {
    id: string;
    status: string;
    personData: string;
    imageData: string | null;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
    };
}

export default function RequestsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/requests`);
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await axios.put(`${config.apiUrl}/api/requests/${id}/approve`, {
                approvedBy: user?.id
            });
            fetchRequests();
        } catch (error) {
            console.error('Error approving request:', error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await axios.put(`${config.apiUrl}/api/requests/${id}/reject`);
            fetchRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <h1 className="text-2xl font-bold mb-6">Person Creation Requests</h1>

                <div className="grid gap-4">
                    {requests.map((request) => {
                        const personData = JSON.parse(request.personData);
                        return (
                            <div key={request.id} className="bg-white rounded-lg shadow-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium">
                                            {personData.firstName} {personData.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {personData.type === 'suspect' ? 'Suspect' : 'Missing Person'}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                                        ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'}`}>
                                        {request.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="text-sm">
                                        <p className="text-gray-500">Requested by</p>
                                        <p className="font-medium">
                                            {request.user.firstName} {request.user.lastName}
                                        </p>
                                    </div>
                                    <div className="text-sm">
                                        <p className="text-gray-500">Requested on</p>
                                        <p className="font-medium">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {request.status === 'pending' && (
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleReject(request.id)}
                                            className="btn btn-secondary flex items-center"
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleApprove(request.id)}
                                            className="btn btn-primary flex items-center"
                                        >
                                            <Check className="w-4 h-4 mr-1" />
                                            Approve
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {requests.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No pending requests
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 