import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar'
import './App.css'
import Sidebar from './components/layout/Sidebar';
import { useState } from 'react';
import Stats from './components/dashboard/Stats';
import LiveFeed from './components/dashboard/LiveFeed';
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
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RequestsPage from './components/requests/RequestsPage';
import PersonDetails from './components/suspect/PersonDetails';
import TutorialTraining from './components/tutorial-training/TutorialTraining';
import { Toaster } from 'react-hot-toast';
import AddPerson from './components/suspect/AddPerson';
import HelpPage from './components/help/HelpPage';
import TawkChat from './components/chat/TawkChat';
import HelpSupport from './components/settings/HelpSupport';
import { ThemeProvider } from './context/themeContext';
import NewLoginPage from './components/auth/NewLoginPage';
import DetectionsByLocation from './components/dashboard/DetectionsByLocation';
import emailjs from '@emailjs/browser';
import { emailjsConfig } from './config/emailjs';
import ImageEnhancer from './components/image/ImageEnhancer';
import { LoginThemeProvider } from './context/LoginThemeContext';

// Initialize EmailJS
emailjs.init(emailjsConfig.publicKey);

function App() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginThemeProvider>
        <Login />
      </LoginThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <Navbar />
          <div className="pt-16">
            <div className="flex">
              <Sidebar onPageChange={setCurrentPage} currentPage={currentPage} />
              <main className={`flex-1 p-6 ml-64 transition-all duration-300`}>
                <Routes>
                  <Route path="/" element={
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
                      <DetectionsByLocation />
                    </div>
                  } />
                  <Route path="/monitoring" element={<LiveMonitoring />} />
                  <Route path="/suspects" element={<SuspectPage />} />
                  <Route path="/suspects/new" element={<AddPerson />} />
                  <Route path="/search" element={<SearchLookup />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/mapview" element={<MapView />} />
                  <Route path="/users" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/requests" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <RequestsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/person/:id" element={<PersonDetails />} />
                  <Route path="/tutorial" element={<TutorialTraining />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/settings/help-support" element={<HelpSupport />} />
                  <Route path="/detections/:id" element={<ImageEnhancer />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </div>
      </Router>
      {/* <TawkChat /> */}
    </ThemeProvider>
  );
}

export default App;
