import { UserCheck, AlertTriangle, Database, Camera } from 'lucide-react';
import useStats from '../../hooks/useStats';

export default function Stats() {
    const { stats, loading, error } = useStats();

    const statsData = [
        {
            label: 'Total Recognitions',
            value: loading ? '...' : stats.totalRecognitions.toLocaleString(),
            change: '+12.5%',
            icon: UserCheck,
            color: 'blue'
        },
        {
            label: 'High Priority Alerts',
            value: loading ? '...' : stats.highPriorityAlerts.toLocaleString(),
            change: '-5%',
            icon: AlertTriangle,
            color: 'red'
        },
        {
            label: 'Database Entries',
            value: loading ? '...' : stats.databaseEntries.toLocaleString(),
            change: '+235',
            icon: Database,
            color: 'green'
        },
        {
            label: 'Active Cameras',
            value: loading ? '...' : stats.activeCameras.toLocaleString(),
            change: '+3',
            icon: Camera,
            color: 'amber'
        }
    ];

    if (error) {
        return <div className="text-red-500">Error loading stats</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg shadow-lg p-4 transition-transform hover:scale-105"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                            <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                        </div>
                        <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change}
                        </span>
                    </div>

                    <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
            ))}
        </div>
    );
}