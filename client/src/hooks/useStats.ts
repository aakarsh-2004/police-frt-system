import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config/config';

interface Stats {
    totalDetections: number;
    successfulMatches: number;
    databaseEntries: number;
    activeCameras: number;
}

const useStats = () => {
    const [stats, setStats] = useState<Stats>({
        totalDetections: 0,
        successfulMatches: 0,
        databaseEntries: 0,
        activeCameras: 6
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [recognitionsRes, personsRes] = await Promise.all([
                    axios.get(`${config.apiUrl}/api/recognitions/stats`),
                    axios.get(`${config.apiUrl}/api/persons/stats`)
                ]);

                console.log('Recognition stats:', recognitionsRes.data);
                console.log('Person stats:', personsRes.data);

                setStats({
                    totalDetections: recognitionsRes.data?.data?.totalDetections || 0,
                    successfulMatches: recognitionsRes.data?.data?.successfulMatches || 0,
                    databaseEntries: personsRes.data?.data?.total || 0,
                    activeCameras: 6
                });
                setError(null);
            } catch (err) {
                console.error('Error fetching stats:', err);
                setError('Failed to fetch stats');
                setStats({
                    totalDetections: 0,
                    successfulMatches: 0,
                    databaseEntries: 0,
                    activeCameras: 6
                });
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