<div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <div className="relative">
        {/* Image Container */}
        <div className="aspect-square w-full overflow-hidden bg-gray-100">
            <img
                src={person.personImageUrl}
                alt={`${person.firstName} ${person.lastName}`}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center' }}
            />
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
            {/* ... status badge ... */}
        </div>
    </div>

    {/* Content */}
    <div className="p-4">
        {/* ... card content ... */}
    </div>
</div> 