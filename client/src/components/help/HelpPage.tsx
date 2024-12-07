import { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, Phone, MapPin } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-hot-toast';

interface FAQ {
    question: string;
    answer: string;
}

const faqs: FAQ[] = [
    {
        question: "What is the Face Recognition Surveillance System?",
        answer: "It's an advanced security system that uses AI to identify and track persons of interest through a network of cameras. The system can detect faces in real-time and match them against a database of suspects and missing persons."
    },
    {
        question: "How accurate is the face recognition system?",
        answer: "Our system uses state-of-the-art AI models with an accuracy rate of over 95%. However, factors like lighting, angle, and image quality can affect recognition accuracy. Each detection includes a confidence score to indicate reliability."
    },
    {
        question: "How does the real-time monitoring work?",
        answer: "The system continuously processes video feeds from connected cameras. When a face is detected, it's immediately compared against our database. If a match is found, the system generates an alert with details like location, time, and confidence score."
    },
    {
        question: "What happens when a suspect is detected?",
        answer: "When a suspect is detected, the system immediately alerts relevant authorities with the person's details, location, and a snapshot from the camera. This information is also logged for future reference."
    },
    {
        question: "How does the crime heatmap work?",
        answer: "The crime heatmap visualizes detection patterns across different locations. Areas with more detections appear in warmer colors (red), while areas with fewer detections appear in cooler colors (blue)."
    },
    {
        question: "Can the system track multiple people simultaneously?",
        answer: "Yes, the system can track and identify multiple individuals simultaneously across different cameras in real-time."
    },
    {
        question: "How is the data kept secure?",
        answer: "All data is encrypted and stored securely. Access is restricted to authorized personnel only, and all system activities are logged for audit purposes."
    },
    {
        question: "What types of alerts does the system generate?",
        answer: "The system generates alerts for suspect detections, missing person sightings, and unusual activities. Alerts include location details, timestamps, and confidence scores."
    }
];

emailjs.init("LpIjuCBpkd2u7AhCQ");

export default function HelpPage() {
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                subject: formData.subject,
                message: formData.message,
                to_name: 'MP Police FRT Team',
            };

            await emailjs.send(
                "service_78dvtme",  
                "template_q6mzlf8",
                templateParams,
                "LpIjuCBpkd2u7AhCQ" 
            );

            toast.success('Message sent successfully!');
            
            // Clear form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error('Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 dark:text-white">Help Center</h1>

            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 dark:text-white">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div 
                            key={index} 
                            className="border dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                            <button
                                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                            >
                                <span className="font-medium dark:text-white">{faq.question}</span>
                                {openFAQ === index ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                )}
                            </button>
                            {openFAQ === index && (
                                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-semibold mb-6 dark:text-white">Contact Us</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-white">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-white">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-white">Subject</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
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

                <div>
                    <h2 className="text-2xl font-semibold mb-6 dark:text-white">Contact Information</h2>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <span className="dark:text-white">contactmppolicefrt@gmail.com</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-blue-600" />
                            <span className="dark:text-white">+91 75524-43333</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <span className="dark:text-white">Police Headquarters, Jehangirabad, Bhopal, MP</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 