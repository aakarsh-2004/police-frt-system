import { X, Users, Building, Download, Link2, ExternalLink } from 'lucide-react';

interface ShareOption {
    id: string;
    label: string;
    icon: string;
}

interface ShareDialogProps {
    title: string;
    options: ShareOption[];
    onClose: () => void;
    onShare: (option: string) => void;
}

const icons = {
    users: Users,
    building: Building,
    download: Download,
    link: Link2,
    external: ExternalLink
};

export default function ShareDialog({ title, options, onClose, onShare }: ShareDialogProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-2">
                    {options.map(option => {
                        const Icon = icons[option.icon as keyof typeof icons];
                        return (
                            <button
                                key={option.id}
                                onClick={() => onShare(option.id)}
                                className="w-full p-3 flex items-center space-x-3 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Icon className="w-5 h-5 text-gray-600" />
                                <span>{option.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                    <p className="text-sm text-gray-600">
                        Sharing this profile will include all relevant case information and recent matches.
                    </p>
                </div>
            </div>
        </div>
    );
}