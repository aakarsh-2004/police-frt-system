export default function SuspectGrid({ persons, onViewDetails }: SuspectGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {persons.map((person) => (
                <div key={person.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="relative pt-[125%]">
                        <img 
                            src={person.personImageUrl} 
                            alt={`${person.firstName} ${person.lastName}`}
                            className="absolute inset-0 w-full h-full object-contain bg-gray-100 dark:bg-gray-700"
                            style={{ 
                                objectPosition: 'center',
                                transform: 'scale(0.95)'
                            }}
                        />
                    </div>
                    <div className="p-4">
                        <h3 className="font-semibold dark:text-white">
                            {person.firstName} {person.lastName}
                        </h3>
                        <div className="flex items-center justify-between text-xs">
                            <span className={`px-2 py-1 rounded-full font-medium
                            ${person.type === 'suspect'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                {person.type.toUpperCase()}
                            </span>
                            {person.riskLevel && (
                                <span className="text-amber-600 dark:text-amber-500 font-medium">
                                    {person.riskLevel.toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
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
                            onClick={() => onViewDetails(person.id)}
                            className="btn btn-primary w-full mt-4"
                        >
                            View Details
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
} 