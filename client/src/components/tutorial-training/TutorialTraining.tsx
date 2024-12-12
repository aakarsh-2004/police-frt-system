import React, { useState } from 'react';
import {
    GraduationCap, PlayCircle, BookOpen, HelpCircle,
    Award, CheckCircle, Video, FileText, Users, Wrench
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import TutorialVideoPlayer from '../video/TutorialVideoPlayer';

interface TrainingModule {
    id: string;
    title: string;
    description: string;
    duration: string;
    type: 'video' | 'document' | 'interactive';
    status: 'completed' | 'in-progress' | 'not-started';
    thumbnail?: string;
    videoUrl?: string;
}

const trainingModules: TrainingModule[] = [
    {
        id: '1',
        title: 'System Overview',
        description: 'Learn about the core features and functionalities of the Face Recognition System.',
        videoUrl: 'https://res.cloudinary.com/dxspdhwqo/video/upload/v1733973016/sih-tutorial-video/ksgwnt0ueolljy6sz8d7.mp4',
        duration: '2:01',
        type: 'video',
        status: 'not-started',
        thumbnail: 'https://res.cloudinary.com/dxspdhwqo/video/upload/v1733973016/sih-tutorial-video/ksgwnt0ueolljy6sz8d7.jpg'
    },
    {
        id: '2',
        title: 'Live Monitoring',
        description: 'Master the live surveillance features and real-time detection capabilities.',
        videoUrl: 'https://res.cloudinary.com/dxspdhwqo/video/upload/v1733973011/sih-tutorial-video/qneouncpyyuwk6oiomlv.mp4',
        duration: '1:26',
        type: 'video',
        status: 'not-started',
        thumbnail: 'https://res.cloudinary.com/dxspdhwqo/video/upload/v1733973011/sih-tutorial-video/qneouncpyyuwk6oiomlv.jpg'
    },
    {
        id: '3',
        title: 'Search & Analytics',
        description: 'Learn how to use advanced search features and analyze detection data.',
        videoUrl: 'https://res.cloudinary.com/dxspdhwqo/video/upload/v1733973011/sih-tutorial-video/cgviaihpxf20fvemybbu.mp4',
        duration: '1:05',
        type: 'video',
        status: 'not-started',
        thumbnail: 'https://res.cloudinary.com/dxspdhwqo/video/upload/v1733973011/sih-tutorial-video/cgviaihpxf20fvemybbu.jpg'
    },
    {
        id: '4',
        title: 'Alert Management',
        description: 'Understand how to manage and respond to detection alerts effectively.',
        videoUrl: 'https://res.cloudinary.com/dxspdhwqo/video/upload/v1733973011/sih-tutorial-video/p5kfsy46lss6iwxaop82.mp4',
        duration: '1:22',
        type: 'video',
        status: 'not-started',
        thumbnail: 'https://res.cloudinary.com/dxspdhwqo/video/upload/v1733973011/sih-tutorial-video/p5kfsy46lss6iwxaop82.jpg'
    }
];

export default function TutorialTraining() {
    const [activeSection, setActiveSection] = React.useState('all');
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    const handleVideoClick = (videoUrl: string) => {
        if (!videoUrl) return;
        setSelectedVideo(videoUrl);
    };

    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <GraduationCap className="w-6 h-6 text-blue-900 dark:text-blue-400" />
                        <h1 className="text-2xl font-bold dark:text-white">Tutorial Training</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="btn btn-secondary">
                            Track Progress
                        </button>
                        <button className="btn btn-primary">
                            Start New Training
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <button
                        onClick={() => setActiveSection('videos')}
                        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center space-x-3 mb-2">
                            <Video className="w-6 h-6 text-blue-600" />
                            <h3 className="text-lg font-semibold dark:text-white">Video Tutorials</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Step-by-step video guides for system features
                        </p>
                    </button>

                    <button
                        onClick={() => setActiveSection('documents')}
                        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center space-x-3 mb-2">
                            <FileText className="w-6 h-6 text-green-600" />
                            <h3 className="text-lg font-semibold dark:text-white">Documentation</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Detailed guides and standard procedures
                        </p>
                    </button>

                    <button
                        onClick={() => setActiveSection('interactive')}
                        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center space-x-3 mb-2">
                            <Wrench className="w-6 h-6 text-amber-600" />
                            <h3 className="text-lg font-semibold dark:text-white">Interactive Training</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Hands-on practice with system features
                        </p>
                    </button>

                    <button
                        onClick={() => setActiveSection('help')}
                        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center space-x-3 mb-2">
                            <HelpCircle className="w-6 h-6 text-purple-600" />
                            <h3 className="text-lg font-semibold dark:text-white">Help Center</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            FAQs and troubleshooting guides
                        </p>
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold dark:text-white">Your Training Progress</h2>
                        <div className="flex items-center space-x-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            <span className="text-sm font-medium dark:text-white">Level 2 Officer</span>
                        </div>
                    </div>

                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-500"
                            style={{ width: '0%' }}
                        />
                    </div>

                    <div className="flex items-center justify-between mt-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress: 0%</span>
                        <span className="text-gray-600 dark:text-gray-400">0/4 Modules Completed</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trainingModules.map((module) => (
                        <div
                            key={module.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                            onClick={() => handleVideoClick(module.videoUrl || '')}
                        >
                            {module.thumbnail && (
                                <div className="aspect-video relative">
                                    <img
                                        src={module.thumbnail}
                                        alt={module.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <PlayCircle className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="font-semibold mb-2 dark:text-white">{module.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {module.description}
                                </p>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {module.duration}
                                    </span>
                                    <StatusBadge status={module.status} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <HelpCircle className="w-6 h-6 text-blue-600" />
                        <h2 className="text-lg font-semibold dark:text-white">Need Help?</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-center space-x-3">
                                <Users className="w-5 h-5 text-blue-600" />
                                <div className="text-left">
                                    <h3 className="font-medium dark:text-white">Contact Support Team</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Get help from our training experts</p>
                                </div>
                            </div>
                        </button>

                        <button className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-center space-x-3">
                                <BookOpen className="w-5 h-5 text-green-600" />
                                <div className="text-left">
                                    <h3 className="font-medium dark:text-white">Browse Knowledge Base</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Find answers to common questions</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {selectedVideo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="w-full max-w-4xl">
                        <TutorialVideoPlayer
                            url={selectedVideo}
                            onClose={() => setSelectedVideo(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}