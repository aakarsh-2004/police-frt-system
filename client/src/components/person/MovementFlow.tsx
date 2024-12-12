import React, { useState, useRef } from 'react';
import { ArrowRight, Share2, Mail, MessageCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { formatDateTime, getTimeAgo } from '../../utils/dateUtils';
import { toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import { emailjsConfig } from '../../config/emailjs';
import { getRecentEmails, addRecentEmail } from '../../utils/emailHistory';
import axios from 'axios';
import config from '../../config/config';

interface MovementNode {
    location: string;
    timestamp: string;
    isRepeated: boolean;
    latitude: number;
    longitude: number;
}

interface MovementFlowProps {
    movements: MovementNode[];
}

export default function MovementFlow({ movements, person }: MovementFlowProps) {
    const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<MovementNode | null>(null);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [sending, setSending] = useState(false);
    const [recentEmails, setRecentEmails] = useState<string[]>(getRecentEmails());
    const [showShareModal, setShowShareModal] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    console.log('Movements:', movements);

    const scroll = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const scrollAmount = 300; // Adjust this value as needed
            const newScrollLeft = direction === 'left' 
                ? sliderRef.current.scrollLeft - scrollAmount
                : sliderRef.current.scrollLeft + scrollAmount;
            
            sliderRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    const scrollToEnd = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollTo({
                left: sliderRef.current.scrollWidth,
                behavior: 'smooth'
            });
        }
    };

    const scrollToStart = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        }
    };

    const handleShareViaEmail = async (location: MovementNode) => {
        if (!email) {
            toast.error('Please enter an email address');
            return;
        }

        setSending(true);
        try {
            const templateParams = {
                to_email: email,
                person_details: {
                    name: `${person.firstName} ${person.lastName}`,
                    age: person.age,
                    gender: person.gender,
                    nationality: person.nationality,
                    national_id: person.nationalId,
                    email: person.email,
                    phone: person.phone,
                    address: person.address
                },
                location_details: {
                    location: location.location,
                    timestamp: formatDateTime(location.timestamp),
                    maps_link: `https://google.com/maps?q=${location.latitude},${location.longitude}`
                }
            };

            await emailjs.send(
                'service_r6y0pop', 
                'template_hxhdqhs',
                {
                    to_email: email,
                    person_name: `${person.firstName} ${person.lastName}`,
                    person_age: person.age || 'N/A',
                    person_gender: person.gender || 'N/A',
                    person_nationality: person.nationality || 'N/A',
                    person_national_id: person.nationalId || 'N/A',
                    person_email: person.email || 'N/A',
                    person_phone: person.phone || 'N/A',
                    person_address: person.address || 'N/A',
                    location: location.location,
                    timestamp: formatDateTime(location.timestamp),
                    maps_link: `https://google.com/maps?q=${location.latitude},${location.longitude}`
                },
                'eQjd1EjlnE0-7vaNr'
            );

            addRecentEmail(email);
            setRecentEmails(getRecentEmails());
            toast.success('Location shared successfully via email');
            setShowEmailDialog(false);
            setEmail('');
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error('Failed to send email. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleShareViaWhatsApp = async (location: MovementNode) => {
        if (!phone) {
            toast.error('Please enter a phone number');
            return;
        }

        try {
            const message = `Location Details:\nLocation: ${location.location}\nTimestamp: ${formatDateTime(location.timestamp)}\nMaps Link: https://google.com/maps?q=${location.latitude},${location.longitude} \n Person Details: \n Name: ${person.firstName} ${person.lastName} \n Age: ${person.age} \n Gender: ${person.gender} \n Nationality: ${person.nationality} \n National ID: ${person.nationalId} \n Email: ${person.email} \n Phone: ${person.phone} \n Address: ${person.address}`;
            
            const response = await axios.post(`${config.apiUrl}/api/notifications/whatsapp`, {
                phoneNumber: `+91${phone}`,
                message
            });

            if (response.data.success) {
                toast.success('Location shared via WhatsApp');
                setShowWhatsAppDialog(false);
                setPhone('');
            }
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            toast.error('Failed to send WhatsApp message');
        }
    };

    const renderShareOptions = (node: MovementNode) => (
        <button 
            onClick={() => {
                setSelectedLocation(node);
                setShowShareModal(true);
            }}
            className="text-xs opacity-75 text-blue-600 dark:text-blue-400 hover:cursor-pointer hover:underline hover:underline-offset-4 flex items-center gap-1"
        >
            <Share2 className="w-3 h-3" />
            Share
        </button>
    );

    return (
        <>
            <div className="relative">
                {/* First/Last Navigation */}
                <div className="flex justify-between mb-2">
                    <button
                        onClick={scrollToStart}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                        First Detection
                    </button>
                    <button
                        onClick={scrollToEnd}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Last Detection
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Navigation Buttons */}
                <button 
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                
                <button 
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                {/* Slider Container */}
                <div 
                    ref={sliderRef}
                    className="overflow-x-auto hide-scrollbar flex gap-4 px-10 py-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {movements.map((node, index) => (
                        <div 
                            key={`${node.location}-${node.timestamp}`}
                            className="flex-shrink-0 flex items-center gap-4"
                        >
                            <div className={`w-64 px-4 py-3 rounded-lg text-sm font-medium flex flex-col items-center
                                ${index === 0 ?
                                    'bg-green-100 dark:bg-green-900'
                                : index === (movements.length - 1) ?
                                    'bg-red-100 dark:bg-red-900'
                                : 'bg-blue-100 dark:bg-blue-900'
                                }`}
                            >
                                <span className='text-sm'>{node.location}</span>
                                <span className="text-xs opacity-75">
                                    {formatDateTime(node.timestamp)}
                                </span>
                                <span className="text-xs opacity-75">
                                    {getTimeAgo(node.timestamp)}
                                </span>
                                <div className="flex items-center gap-2 mt-2">
                                    <a 
                                        href={`https://google.com/maps?q=${node.latitude},${node.longitude}`} 
                                        target='_blank' 
                                        rel="noopener noreferrer"
                                        className={`text-xs opacity-75 hover:cursor-pointer hover:underline hover:underline-offset-4
                                            ${index === (movements.length - 1) 
                                                ? 'text-red-700 dark:text-red-500'
                                                : index === 0 
                                                    ? 'text-green-700 dark:text-green-500'
                                                    : 'text-blue-700 dark:text-blue-500'
                                            }`}
                                    >
                                        Take me
                                    </a>
                                    {renderShareOptions(node)}
                                </div>
                            </div>
                            {index < movements.length - 1 && (
                                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Add this CSS to your global styles or component */}
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* Email Dialog */}
            {showEmailDialog && selectedLocation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4 dark:text-white">Share Location via Email</h3>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        {recentEmails.length > 0 && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-2">Recent emails:</p>
                                <div className="flex flex-wrap gap-2">
                                    {recentEmails.map((recentEmail) => (
                                        <button
                                            key={recentEmail}
                                            onClick={() => setEmail(recentEmail)}
                                            className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                                        >
                                            {recentEmail}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowEmailDialog(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleShareViaEmail(selectedLocation)}
                                className="btn btn-primary"
                                disabled={sending}
                            >
                                {sending ? 'Sending...' : 'Share'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* WhatsApp Dialog */}
            {showWhatsAppDialog && selectedLocation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4 dark:text-white">Share Location via WhatsApp</h3>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter phone number"
                            className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowWhatsAppDialog(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleShareViaWhatsApp(selectedLocation)}
                                className="btn btn-primary"
                            >
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Options Modal */}
            {showShareModal && selectedLocation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4 dark:text-white">Share Location</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setShowEmailDialog(true);
                                    setShowShareModal(false);
                                }}
                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                            >
                                <Mail className="w-5 h-5" />
                                <div>
                                    <p className="font-medium">Share via Email</p>
                                    <p className="text-sm text-gray-500">Send location details to an email address</p>
                                </div>
                            </button>
                            <button
                                onClick={() => {
                                    setShowWhatsAppDialog(true);
                                    setShowShareModal(false);
                                }}
                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <div>
                                    <p className="font-medium">Share via WhatsApp</p>
                                    <p className="text-sm text-gray-500">Send location details through WhatsApp</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
} 