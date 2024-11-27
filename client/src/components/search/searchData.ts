export interface SearchFilters {
    dateRange: {
        start: string;
        end: string;
    };
    locations: string[];
    cameras: string[];
    matchConfidence: number;
    type?: 'person' | 'incident' | 'all';
}

export interface SearchResult {
    id: string;
    type: 'person' | 'incident';
    title: string;
    description: string;
    location: string;
    timestamp: string;
    matchConfidence?: number;
    cameraId?: string;
    imageUrl?: string;
}

interface SearchStore {
    query: string;
    filters: SearchFilters;
    results: SearchResult[];
    isLoading: boolean;

    setQuery: (query: string) => void;
    updateFilters: (filters: Partial<SearchFilters>) => void;
    resetFilters: () => void;
    search: () => Promise<void>;
    clearResults: () => void;
}

const mockResults: SearchResult[] = [
    {
        id: '1',
        type: 'person',
        title: 'Suspect Match #127',
        description: 'High confidence match detected at main entrance',
        location: 'Main Entrance',
        timestamp: '2024-03-14 10:45:23',
        matchConfidence: 98.5,
        cameraId: 'CAM-001',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    },
    {
        id: '2',
        type: 'incident',
        title: 'Suspicious Activity',
        description: 'Multiple detection events in restricted area',
        location: 'Parking Area',
        timestamp: '2024-03-14 10:42:15',
        cameraId: 'CAM-002',
        imageUrl: 'https://images.unsplash.com/photo-1590861337998-a4cf4036ccf8'
    },
    {
        id: '3',
        type: 'person',
        title: 'Suspect Match #128',
        description: 'Medium confidence match at railway station',
        location: 'Habibganj Station',
        timestamp: '2024-03-14 10:40:00',
        matchConfidence: 85.2,
        cameraId: 'CAM-003',
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'
    },
    {
        id: '4',
        type: 'incident',
        title: 'Unauthorized Access',
        description: 'Attempt to access restricted zone detected',
        location: 'Server Room',
        timestamp: '2024-03-14 10:38:30',
        cameraId: 'CAM-004',
        imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d'
    },
    {
        id: '5',
        type: 'person',
        title: 'Suspect Match #129',
        description: 'Low confidence match near mall entrance',
        location: 'DB Mall',
        timestamp: '2024-03-14 10:35:00',
        matchConfidence: 72.8,
        cameraId: 'CAM-005',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    }
];

