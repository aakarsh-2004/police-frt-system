import { useState } from 'react';
import { X, Mail, Loader } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-hot-toast';

interface ShareDetectionModalProps {
    detection: {
        capturedImageUrl: string;
        capturedLocation: string;
        capturedDateTime: string;
        person: {
            firstName: string;
            lastName: string;
            personImageUrl: string;
        }
    };
    onClose: () => void;
}

export default function ShareDetectionModal({ detection, onClose }: ShareDetectionModalProps) {
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            const formattedDate = new Date(detection.capturedDateTime).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'medium'
            });

            const templateParams = {
                to_email: email,
                person_name: "Aakarsh",
                location: "Bhopal",
                detection_time: new Date().toLocaleString(),
                original_image: "https://res.cloudinary.com/dwbr9hz8y/image/upload/v1733298737/persons/hzthzvvktepvssbmqtpq.jpg",
                captured_image: "https://res.cloudinary.com/dwbr9hz8y/image/upload/v1732898237/recognitions/k4p2hpii0beslijl8lq5.jpg",
                confidence: "99.99%"
            };

            console.log('Sending email with params:', templateParams);

            await emailjs.send(
                'service_78dvtme', 
                'template_k4xq33e', 
                templateParams,
                'LpIjuCBpkd2u7AhCQ'
            );

            toast.success('Detection shared successfully');
            onClose();
        } catch (error) {
            console.error('Error sharing detection:', error);
            toast.error('Failed to share detection');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-semibold dark:text-white">Share Detection</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                Detection Details
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <p>Person: {detection.person.firstName} {detection.person.lastName}</p>
                                <p>Location: {detection.capturedLocation}</p>
                                <p>Time: {new Date(detection.capturedDateTime).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={sending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex items-center"
                            disabled={sending}
                        >
                            {sending ? (
                                <>
                                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Share via Email
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 