import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config/config';

interface StatsResponse {
    total: number;
    recentAlerts?: number;
}

interface Stats {
    totalRecognitions: number;
    highPriorityAlerts: number;
    databaseEntries: number;
    activeCameras: number;
}

const useStats = () => {
    const [stats, setStats] = useState<Stats>({
        totalRecognitions: 0,
        highPriorityAlerts: 0,
        databaseEntries: 0,
        activeCameras: 6
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [recognitionsRes, personsRes] = await Promise.all([
                    axios.get<StatsResponse>(`${config.apiUrl}/api/stats/recognitions`),
                    axios.get<StatsResponse>(`${config.apiUrl}/api/stats/persons`)
                ]);

                setStats({
                    totalRecognitions: recognitionsRes.data.total,
                    highPriorityAlerts: recognitionsRes.data.recentAlerts || 0,
                    databaseEntries: personsRes.data.total,
                    activeCameras: 6
                });
                setError(null);
            } catch (err) {
                setError('Failed to fetch stats');
                console.error('Error fetching stats:', err);
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