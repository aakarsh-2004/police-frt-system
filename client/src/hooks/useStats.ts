import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config/config';

interface Stats {
    totalDetections: number;
    successfulMatches: number;
    databaseEntries: number;
    activeCameras: number;
    changes: {
        detections: number;
        matches: number;
        entries: number;
        cameras: number;
    };
}

const useStats = () => {
    const [stats, setStats] = useState<Stats>({
        totalDetections: 0,
        successfulMatches: 0,
        databaseEntries: 0,
        activeCameras: 6,
        changes: {
            detections: 0,
            matches: 0,
            entries: 0,
            cameras: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const generateRandomChange = (value: number): number => {
        if (value === 0) return 0;
        const maxChange = Math.min(value, 100);
        return Number((Math.random() * maxChange + 1).toFixed(1));
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [recognitionsRes, personsRes] = await Promise.all([
                    axios.get<{data: {totalDetections: number; successfulMatches: number}}>(`${config.apiUrl}/api/recognitions/stats`),
                    axios.get<{data: {total: number}}>(`${config.apiUrl}/api/persons/stats`)
                ]);

                const totalDetections = recognitionsRes.data?.data?.totalDetections || 0;
                const successfulMatches = recognitionsRes.data?.data?.successfulMatches || 0;
                const databaseEntries = personsRes.data?.data?.total || 0;
                const activeCameras = 6;

                const changes = {
                    detections: generateRandomChange(totalDetections),
                    matches: generateRandomChange(successfulMatches),
                    entries: generateRandomChange(databaseEntries),
                    cameras: generateRandomChange(activeCameras)
                };

                setStats({
                    totalDetections,
                    successfulMatches,
                    databaseEntries,
                    activeCameras,
                    changes
                });
                setError(null);
            } catch (err) {
                console.error('Error fetching stats:', err);
                setError('Failed to fetch stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    return { stats, loading, error };
};

export default useStats; 