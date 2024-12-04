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

export interface AlertStore {
    alerts: Alert[];
    selectedAlertId: string | null;
    filters: {
        severity: string[];
        status: string[];
        dateRange: {
            start: string;
            end: string;
        };
        location: string[];
    };
}

