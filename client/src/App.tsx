import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/layout/Navbar'
import './App.css'
import Sidebar from './components/layout/Sidebar';
import { useState } from 'react';
import Stats from './components/dashboard/stats';
import LiveFeed from './components/dashboard/Livefeed';
import AlertSystem from './components/dashboard/Alerts';
import CrimeHeatmap from './components/dashboard/CrimeHeatmap';
import LiveMonitoring from './components/monitoring/LiveMonitoring';
import SuspectPage from './components/suspect/SuspectPage';
import AlertsPage from './components/alert/AlertPage';
import SearchLookup from './components/search/SearchLookup';
import ReportsPage from './components/reports/ReportPage';
import MapView from './components/mapview/MapView';
import UserManagement from './components/user/UserManagement';
import Settings from './components/settings/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="max-w-[2000px] mx-auto space-y-6">
            <Stats />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LiveFeed />
              </div>
              <div className="lg:col-span-1">
                <AlertSystem />
              </div>
            </div>
            <CrimeHeatmap />
          </div>
        );
      case 'monitoring':
        return <LiveMonitoring />;
      case 'suspects':
        return <SuspectPage />;
      case 'search':
        return <SearchLookup />;
      case 'alerts':
        return <AlertsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'mapview':
        return <MapView />
      case 'users':
        return <UserManagement />
      case 'settings':
        return <Settings />
      default:
        return <div>404 Not Found</div>;
    }
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <div className="pt-16">
          <div className="flex">
            <Sidebar onPageChange={setCurrentPage} currentPage={currentPage} />
            <main className={`flex-1 p-6 ml-64 transition-all duration-300`}>
              {renderPage()}
            </main>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
