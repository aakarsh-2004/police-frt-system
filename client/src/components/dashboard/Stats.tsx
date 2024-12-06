import { UserCheck, AlertTriangle, Database, Camera } from 'lucide-react';
import useStats from '../../hooks/useStats';
import { useTranslation } from 'react-i18next';
import DetectionsByLocation from './DetectionsByLocation';

export default function Stats() {
    const { stats, loading, error } = useStats();
    const { t } = useTranslation();

    const statsData = [
        {
            label: t('dashboard.stats.totalDetections'),
            value: loading ? '...' : stats.totalDetections.toLocaleString(),
            change: stats.changes.detections,
            icon: UserCheck,
            color: 'blue'
        },
        {
            label: t('dashboard.stats.successfulMatches'),
            value: loading ? '...' : stats.successfulMatches.toLocaleString(),
            change: stats.changes.matches,
            icon: AlertTriangle,
            color: 'red'
        },
        {
            label: t('dashboard.stats.databaseEntries'),
            value: loading ? '...' : stats.databaseEntries.toLocaleString(),
            change: stats.changes.entries,
            icon: Database,
            color: 'green'
        },
        {
            label: t('dashboard.stats.activeCameras'),
            value: loading ? '...' : stats.activeCameras.toLocaleString(),
            change: stats.changes.cameras,
            icon: Camera,
            color: 'amber'
        }
    ];

    if (error) {
        return <div className="text-red-500">{t('common.error')}</div>;
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((stat, index) => (
                    <div
                        key={index}
                        className="card p-4 transition-transform hover:scale-105"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                                <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                            </div>
                            <span className={`text-sm font-medium ${
                                stat.change > 0 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-red-600 dark:text-red-400'
                            }`}>
                                {stat.change > 0 ? '+' : ''}{stat.change}%
                            </span>
                        </div>

                        <h3 className="text-2xl font-bold mb-1 text-primary">{stat.value}</h3>
                        <p className="text-sm text-secondary">{stat.label}</p>
                    </div>
                ))}
            </div>
            {/* <DetectionsByLocation /> */}
        </>
    );
}