import { MapPin, Clock, ArrowRight } from 'lucide-react';

interface SuspectGridProps {
    persons: Array<{
        id: string;
        firstName: string;
        lastName: string;
        personImageUrl: string;
        type: string;
        address: string;
        riskLevel?: string;
        lastSeenDate?: string;
    }>;
    onSuspectClick: (id: string) => void;
}

export default function SuspectGrid({ persons, onSuspectClick }: SuspectGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {persons.map((person) => (
                <div
                    key={person.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                    <div className="aspect-square relative">
                        <img
                            src={person.personImageUrl}
                            alt={`${person.firstName} ${person.lastName}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent text-white p-3">
                            <h3 className="text-sm font-semibold truncate">
                                {person.firstName} {person.lastName}
                            </h3>
                            <p className="text-xs opacity-75">{person.id}</p>
                        </div>
                    </div>

                    <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className={`px-2 py-1 rounded-full font-medium
                            ${person.type === 'suspect'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'}`}>
                                {person.type.toUpperCase()}
                            </span>
                            {person.riskLevel && (
                                <span className="text-amber-600 font-medium">
                                    {person.riskLevel.toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                <span className="truncate">{person.address}</span>
                            </div>
                            {person.lastSeenDate && (
                                <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    <span>{person.lastSeenDate}</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => onSuspectClick(person.id)}
                            className=" btn btn-primary text-xs py-1 flex gap-1 h-8 items-center"
                        >
                            <h1>View Details</h1>
                            <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}