<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {results.map((person) => (
        <div key={person.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Image Container */}
            <div className="aspect-square w-full overflow-hidden bg-gray-100">
                <img
                    src={person.personImageUrl}
                    alt={`${person.firstName} ${person.lastName}`}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center' }}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.jpg'; // Add a placeholder image
                    }}
                />
            </div>

            {/* Content */}
            <div className="p-4">
                {/* ... rest of the card content ... */}
            </div>
        </div>
    ))}
</div> 