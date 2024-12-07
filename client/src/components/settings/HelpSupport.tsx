import { useState } from 'react';
import { 
    MessageCircle, 
    Phone, 
    Mail, 
    FileText, 
    ExternalLink, 
    Clock,
    AlertTriangle,
    CheckCircle,
    HelpCircle
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-hot-toast';

interface Ticket {
    id: string;
    subject: string;
    description: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'high' | 'medium' | 'low';
    createdAt: string;
    lastUpdated: string;
}

export default function HelpSupport() {
    const [activeTab, setActiveTab] = useState<'contact' | 'tickets'>('contact');
    const [showNewTicket, setShowNewTicket] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'medium'
    });

    const supportTickets: Ticket[] = [
        {
            id: 'TICKET-001',
            subject: 'Camera Integration Issue',
            description: 'Unable to connect new camera in MP Nagar zone',
            status: 'in-progress',
            priority: 'high',
            createdAt: '2024-03-15 10:30 AM',
            lastUpdated: '2024-03-15 02:45 PM'
        },
        {
            id: 'TICKET-002',
            subject: 'Face Recognition Accuracy',
            description: 'Low confidence scores in low light conditions',
            status: 'open',
            priority: 'medium',
            createdAt: '2024-03-14 03:15 PM',
            lastUpdated: '2024-03-14 03:15 PM'
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'text-blue-600 bg-blue-100';
            case 'in-progress':
                return 'text-amber-600 bg-amber-100';
            case 'resolved':
                return 'text-green-600 bg-green-100';
            case 'closed':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high':
                return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'medium':
                return <Clock className="w-4 h-4 text-amber-600" />;
            case 'low':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            default:
                return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.subject || !formData.message) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const templateParams = {
                from_name: "MP Police User",
                from_email: "contactmppolicefrt@gmail.com",
                to_name: "MP Police FRT Support",
                subject: formData.subject,
                message: formData.message,
                priority_level: formData.priority,
                system_info: {
                    browser: navigator.userAgent,
                    timestamp: new Date().toISOString()
                }
            };

            const result = await emailjs.send(
                "service_r6y0pop",
                "template_986lap2",
                templateParams,
                "eQjd1EjlnE0-7vaNr"
            );

            if (result.status === 200) {
                toast.success('Support message sent successfully!');
                
                // Clear form
                setFormData({
                    subject: '',
                    message: '',
                    priority: 'medium'
                });
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending support message:', error);
            toast.error('Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">Help & Support</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Get assistance with the Face Recognition System
                    </p>
                </div>

                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setActiveTab('contact')}
                        className={`px-4 py-2 rounded-lg ${
                            activeTab === 'contact'
                                ? 'bg-blue-900 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Contact Support
                    </button>
                    <button
                        onClick={() => setActiveTab('tickets')}
                        className={`px-4 py-2 rounded-lg ${
                            activeTab === 'tickets'
                                ? 'bg-blue-900 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Support Tickets
                    </button>
                </div>

                {activeTab === 'contact' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
                                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Emergency Support</p>
                                            <p className="text-gray-600 dark:text-gray-400">+91 75524-43333</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Email Support</p>
                                            <p className="text-gray-600 dark:text-gray-400">contactmppolicefrt@gmail.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <MessageCircle className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Live Chat</p>
                                            <p className="text-gray-600 dark:text-gray-400">Available 24/7</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
                                <h2 className="text-lg font-semibold mb-4">Resources</h2>
                                <div className="space-y-4">
                                    <a href="#" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            <span>User Manual</span>
                                        </div>
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <a href="#" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            <span>API Documentation</span>
                                        </div>
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <a href="#" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            <span>Troubleshooting Guide</span>
                                        </div>
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
                            <h2 className="text-lg font-semibold mb-4">Send Support Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-white">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-white">
                                        Priority
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-white">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">Support Tickets</h2>
                            <button
                                onClick={() => setShowNewTicket(true)}
                                className="btn btn-primary"
                            >
                                New Ticket
                            </button>
                        </div>

                        <div className="space-y-4">
                            {supportTickets.map((ticket) => (
                                <div key={ticket.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-medium">{ticket.subject}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {ticket.description}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                            {ticket.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center space-x-4">
                                            <span>ID: {ticket.id}</span>
                                            <div className="flex items-center space-x-1">
                                                {getPriorityIcon(ticket.priority)}
                                                <span>{ticket.priority.toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span>Created: {ticket.createdAt}</span>
                                            <span>Updated: {ticket.lastUpdated}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 