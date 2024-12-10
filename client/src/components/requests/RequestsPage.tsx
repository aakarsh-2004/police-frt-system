import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import axiosInstance from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

interface Request {
    id: string;
    status: string;
    personData: string;
    imageData: string | null;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export default function RequestsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            console.log('Fetching requests...');
            
            // Log current auth state
            console.log('Current user:', user);
            console.log('Token:', localStorage.getItem('token'));
            
            const response = await axiosInstance.get<{ data: Request[] }>('/api/requests');
            console.log('Requests response:', response.data);
            
            setRequests(response.data.data);
        } catch (error) {
            console.error('Error fetching requests:', {
                error,
                status: (error as any)?.response?.status,
                message: (error as any)?.response?.data?.message,
                headers: (error as any)?.config?.headers
            });
            toast.error('Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            setActionLoading(id);
            const token = localStorage.getItem('token');
            await axiosInstance.put(`/api/requests/${id}/approve`, {
                approvedBy: user?.id
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            toast.success('Request approved successfully');
            await fetchRequests();
        } catch (error) {
            console.error('Error approving request:', error);
            toast.error('Failed to approve request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        try {
            setActionLoading(id);
            await axiosInstance.put(`/api/requests/${id}/reject`, {
                rejectedBy: user?.id
            });
            toast.success('Request rejected successfully');
            await fetchRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
            toast.error('Failed to reject request');
        } finally {
            setActionLoading(null);
        }
    };

    const getPersonData = (jsonString: string) => {
        try {
            return JSON.parse(jsonString);
        } catch {
            return {};
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="p-6">
                    <h2 className="text-2xl font-semibold mb-6 dark:text-white">Person Requests</h2>
                    
                    {loading ? (
                        <div className="text-center py-8">Loading requests...</div>
                    ) : (
                        <div className="space-y-6">
                            {requests.map((request) => {
                                const personData = getPersonData(request.personData);
                                return (
                                    <div 
                                        key={request.id} 
                                        className="border dark:border-gray-700 rounded-lg p-4"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium dark:text-white">
                                                    {personData.firstName} {personData.lastName}
                                                </h3>
                                                <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <p>Type: {personData.type}</p>
                                                    <p>Age: {personData.age}</p>
                                                    <p>Gender: {personData.gender}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                request.status === 'pending' 
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                    : request.status === 'approved'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                            }`}>
                                                {request.status.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            <div className="text-sm">
                                                <p className="text-gray-500 dark:text-gray-400">Requested by</p>
                                                <p className="font-medium dark:text-white">
                                                    {request.user.firstName} {request.user.lastName}
                                                </p>
                                                <p className="text-gray-500 dark:text-gray-400">{request.user.email}</p>
                                            </div>
                                            <div className="text-sm">
                                                <p className="text-gray-500 dark:text-gray-400">Requested on</p>
                                                <p className="font-medium dark:text-white">
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {(request.status === 'pending' && user?.role === 'admin') && (
                                            <div className="mt-4 flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleReject(request.id)}
                                                    className="btn btn-secondary flex items-center"
                                                    disabled={actionLoading === request.id}
                                                >
                                                    {actionLoading === request.id ? (
                                                        <>
                                                            <div className="w-4 h-4 mr-1 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                            Rejecting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <X className="w-4 h-4 mr-1" />
                                                            Reject
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(request.id)}
                                                    className="btn btn-primary flex items-center"
                                                    disabled={actionLoading === request.id}
                                                >
                                                    {actionLoading === request.id ? (
                                                        <>
                                                            <div className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            Approving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="w-4 h-4 mr-1" />
                                                            Approve
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {requests.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No pending requests
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 