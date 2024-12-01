import { useState } from 'react';
import { Person } from '../../types';

interface SuspectListProps {
    suspects: Person[];
}

export default function SuspectList({ suspects }: SuspectListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {suspects.map((suspect) => (
                <div key={suspect.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Image Container with gray background */}
                    <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                        <div className="w-48 h-48 relative"> {/* Fixed size container */}
                            <img
                                src={suspect.personImageUrl}
                                alt={`${suspect.firstName} ${suspect.lastName}`}
                                className="w-full h-full object-cover rounded-lg"
                                style={{ objectPosition: 'center' }}
                            />
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                        <h3 className="font-medium text-lg">
                            {suspect.firstName} {suspect.lastName}
                        </h3>
                        {/* ... other content ... */}
                    </div>
                </div>
            ))}
        </div>
    );
} 