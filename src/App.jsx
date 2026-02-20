import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import AppLayout from './layouts/AppLayout';
import GlobalAuthModal from './features/auth/components/GlobalAuthModal';
import IosInstallPrompt from './components/pwa/IosInstallPrompt';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home'; // Landing Page
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';

// Feature Pages
import SummaryPage from './features/roster/pages/SummaryPage';
import CalendarPage from './features/roster/pages/CalendarPage';
import SettingsPage from './features/nurses/pages/SettingsPage';
import NewsPage from './features/news/NewsPage';
import OTPage from './features/ot/pages/OTPage';
import CalculatorsPage from './features/tools/CalculatorsPage';
import DashboardPage from './features/dashboard/pages/DashboardPage'; // New Dashboard
import AdminDashboard from './features/admin/pages/AdminDashboard';

import AuthGuard from './components/layout/AuthGuard';
import AdminGuard from './components/layout/AdminGuard';

const App = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <StoreProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected App Routes */}
              <Route path="/roster" element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }>
                {/* Dashboard Root */}
                <Route index element={<DashboardPage />} />

                <Route path="calendar" element={<CalendarPage />} />
                <Route path="ot" element={<OTPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<Navigate to="settings" replace />} />
                <Route path="tools" element={<CalculatorsPage />} />
              </Route>

              {/* News might be public or protected, sidebar has it. Let's make it available in AppLayout */}
              <Route path="/news" element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }>
                <Route index element={<NewsPage />} />
              </Route>

              {/* Secure Admin Portal — standalone, no bottom nav */}
              <Route path="/admin-portal" element={
                <AdminGuard>
                  <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
                    <AdminDashboard />
                  </div>
                </AdminGuard>
              } />


              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <GlobalAuthModal />
            <IosInstallPrompt />
            <Toaster position="bottom-center" />
          </StoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
