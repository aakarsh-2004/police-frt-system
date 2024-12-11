import { useState, useEffect, useRef } from 'react';
import { X, Mail, Loader, ChevronDown } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-hot-toast';
import { getRecentEmails, addRecentEmail } from '../../utils/emailHistory';
import { emailjsConfig } from '../../config/emailjs';

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
    const [showDropdown, setShowDropdown] = useState(false);
    const [recentEmails, setRecentEmails] = useState<string[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize emailjs
    useEffect(() => {
        emailjs.init(emailjsConfig.publicKey);
    }, []);

    // Load recent emails and handle outside clicks
    useEffect(() => {
        // Load recent emails
        const emails = getRecentEmails();
        setRecentEmails(emails);

        // Handle outside clicks
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEmailInputFocus = () => {
        // Refresh the list when input is focused
        const emails = getRecentEmails();
        console.log('Focus - Recent emails:', emails);
        setRecentEmails(emails);
        if (emails.length > 0) {
            setShowDropdown(true);
        }
    };

    const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        // Show dropdown if we have recent emails and input is not empty
        if (recentEmails.length > 0) {
            setShowDropdown(true);
        }
    };

    const handleEmailSelect = (selectedEmail: string) => {
        setEmail(selectedEmail);
        setShowDropdown(false);
    };

    // Modified submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            const templateParams = {
                to_email: email,
                person_name: `${detection.person.firstName} ${detection.person.lastName}`,
                location: detection.capturedLocation,
                detection_time: new Date(detection.capturedDateTime).toLocaleString(),
                original_image: detection.person.personImageUrl,
                captured_image: detection.capturedImageUrl,
                confidence: "99.99%"
            };

            await emailjs.send(
                emailjsConfig.serviceId,
                emailjsConfig.templateId,
                templateParams,
                emailjsConfig.publicKey
            );

            // Add to recent emails after successful send
            addRecentEmail(email);
            const updatedEmails = getRecentEmails();
            setRecentEmails(updatedEmails);
            
            toast.success('Detection shared successfully');
            onClose();
        } catch (error) {
            console.error('Error sharing detection:', error);
            toast.error('Failed to share detection');
        } finally {
            setSending(false);
        }
    };

    // Test function to verify localStorage
    const testEmailStorage = () => {
        addRecentEmail('test@example.com');
        addRecentEmail('another@example.com');
        const emails = getRecentEmails();
        console.log('Test - Current emails in storage:', emails);
    };

    // Add this temporarily to test
    useEffect(() => {
        testEmailStorage();
    }, []);

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
                        <div className="relative" ref={dropdownRef}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Recipient Email
                            </label>
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="email"
                                    value={email}
                                    onChange={handleEmailInputChange}
                                    onFocus={handleEmailInputFocus}
                                    onClick={handleEmailInputFocus}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                                    placeholder="Enter email address"
                                    required
                                />
                                {recentEmails.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <ChevronDown 
                                            className={`w-5 h-5 transform transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
                                        />
                                    </button>
                                )}
                            </div>

                            {/* Dropdown Menu */}
                            {showDropdown && recentEmails.length > 0 && (
                                <div 
                                    className="absolute w-full mt-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg z-50 overflow-hidden"
                                >
                                    {recentEmails.map((recentEmail, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleEmailSelect(recentEmail)}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 flex items-center"
                                        >
                                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                            <span>{recentEmail}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
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
                        <button
                            type="button"
                            onClick={testEmailStorage}
                            className="btn btn-secondary"
                        >
                            Test Email Storage
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 