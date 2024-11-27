interface CameraFeed {
    id: string;
    name: string;
    location: string;
    area: string;
    status: 'active' | 'inactive';
    stream: string;
}

export const cameras: CameraFeed[] = [
    {
        id: 'cam1',
        name: 'MP Nagar Gate',
        location: 'Zone 1, MP Nagar',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1577494998472-a5f7f72011c9'
    },
    {
        id: 'cam2',
        name: 'New Market Area',
        location: 'TT Nagar',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1590861337998-a4cf4036ccf8'
    },
    {
        id: 'cam3',
        name: 'Habibganj Railway Station',
        location: 'Railway Station Area',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9'
    },
    {
        id: 'cam4',
        name: 'DB Mall Entrance',
        location: 'Arera Colony',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1517420879524-86d64ac2f339'
    },
    {
        id: 'cam5',
        name: 'BHEL Gate',
        location: 'BHEL Township',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390'
    },
    {
        id: 'cam6',
        name: 'Bittan Market',
        location: 'Bittan Market Area',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1517420879524-86d64ac2f339'
    },
    {
        id: 'cam7',
        name: 'Van Vihar Gate',
        location: 'Shymala Hills',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1590861337998-a4cf4036ccf8'
    },
    {
        id: 'cam8',
        name: 'Boat Club',
        location: 'Upper Lake',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1577494998472-a5f7f72011c9'
    },
    {
        id: 'cam9',
        name: 'Peoples Mall',
        location: 'Bhanpur',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9'
    },
    {
        id: 'cam10',
        name: 'Chowk Bazaar',
        location: 'Old City',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1517420879524-86d64ac2f339'
    },
    {
        id: 'cam11',
        name: 'Kamla Park',
        location: 'Lower Lake',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1590861337998-a4cf4036ccf8'
    },
    {
        id: 'cam12',
        name: 'Moti Masjid',
        location: 'Old Bhopal',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1577494998472-a5f7f72011c9'
    },
    {
        id: 'cam13',
        name: 'Manisha Market',
        location: '10 No. Market',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9'
    },
    {
        id: 'cam14',
        name: 'Bairagarh Station',
        location: 'Sant Hirdaram Nagar',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1517420879524-86d64ac2f339'
    },
    {
        id: 'cam15',
        name: 'Shahpura Lake',
        location: 'Shahpura',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1590861337998-a4cf4036ccf8'
    },
    {
        id: 'cam16',
        name: 'Kolar Road',
        location: 'Kolar',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1577494998472-a5f7f72011c9'
    },
    {
        id: 'cam17',
        name: 'Govindpura Industrial',
        location: 'Govindpura',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9'
    },
    {
        id: 'cam18',
        name: 'Indrapuri',
        location: 'BHEL Township',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1517420879524-86d64ac2f339'
    },
    {
        id: 'cam19',
        name: 'Piplani Market',
        location: 'Ayodhya Bypass',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1590861337998-a4cf4036ccf8'
    },
    {
        id: 'cam20',
        name: 'Karond Square',
        location: 'Karond',
        area: 'Bhopal, Madhya Pradesh',
        status: 'active',
        stream: 'https://images.unsplash.com/photo-1577494998472-a5f7f72011c9'
    }
];