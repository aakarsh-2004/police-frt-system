import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import config from '../../config/config';

interface ShareDetectionModalProps {
    detection: {
        capturedImageUrl: string;
        capturedLocation: string;
        capturedDateTime: string;
    };
    person: {
        firstName: string;
        lastName: string;
        personImageUrl: string;
    };
    onClose: () => void;
}

export default function ShareDetectionModal({ detection, person, onClose }: ShareDetectionModalProps) {
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            await axios.post(`${config.apiUrl}/api/recognitions/share`, {
                to: email,
                personName: `${person.firstName} ${person.lastName}`,
                location: detection.capturedLocation,
                time: new Date(detection.capturedDateTime).toLocaleString(),
                storedImage: person.personImageUrl,
                capturedImage: detection.capturedImageUrl
            });

            toast.success('Detection details shared successfully');
            onClose();
        } catch (error) {
            toast.error('Failed to share detection details');
            console.error('Share error:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold dark:text-white">Share Detection</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">
                            Recipient Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Enter email address"
                            required
                        />
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            The following information will be shared:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                            <li>• Person's stored image</li>
                            <li>• Detection capture</li>
                            <li>• Detection location and time</li>
                            <li>• Person's name</li>
                        </ul>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex items-center"
                            disabled={sending}
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            {sending ? 'Sending...' : 'Share via Email'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 