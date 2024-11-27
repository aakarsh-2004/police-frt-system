export interface Alert {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    location: string;
    timestamp: string;
    status: 'active' | 'investigating' | 'resolved';
    assignedTo?: string;
    matchConfidence?: number;
    capturedImage?: string;
    originalImage?: string;
    metadata?: {
        cameraId?: string;
        deviceInfo?: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
}


export const alerts: Alert[] = [
    {
        id: 'alert-1',
        severity: 'critical',
        title: 'High Priority Match Detected',
        description: 'Facial recognition match with wanted suspect database',
        location: 'Main Gate Camera #1',
        timestamp: '2024-03-14 10:45:23',
        status: 'active',
        matchConfidence: 98.5,
        capturedImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        originalImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
        metadata: {
            cameraId: 'CAM-001',
            coordinates: {
                lat: 23.2599,
                lng: 77.4126
            }
        }
    },
    {
        id: 'alert-2',
        severity: 'high',
        title: 'Suspicious Activity',
        description: 'Multiple detection events in restricted area',
        location: 'East Wing Perimeter',
        timestamp: '2024-03-14 10:42:15',
        status: 'investigating',
        assignedTo: 'Officer Kumar',
        metadata: {
            cameraId: 'CAM-002',
            coordinates: {
                lat: 23.2601,
                lng: 77.4130
            }
        }
    },
    {
        id: 'alert-3',
        severity: 'medium',
        title: 'Unauthorized Access Attempt',
        description: 'Attempted entry at secure facility entrance',
        location: 'Secure Facility Gate',
        timestamp: '2024-03-14 10:40:00',
        status: 'active',
        matchConfidence: 85.2,
        capturedImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        originalImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
        metadata: {
            cameraId: 'CAM-003'
        }
    },
    {
        id: 'alert-4',
        severity: 'high',
        title: 'Suspicious Package Detected',
        description: 'Unattended package detected in crowded area',
        location: 'Main Plaza',
        timestamp: '2024-03-14 10:38:30',
        status: 'active',
        metadata: {
            cameraId: 'CAM-004'
        }
    },
    {
        id: 'alert-5',
        severity: 'medium',
        title: 'Perimeter Breach Alert',
        description: 'Motion detected in restricted zone',
        location: 'North Fence',
        timestamp: '2024-03-14 10:35:00',
        status: 'investigating',
        assignedTo: 'Officer Singh',
        metadata: {
            cameraId: 'CAM-005'
        }
    }
];