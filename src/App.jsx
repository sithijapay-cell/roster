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
import ProfilePage from './features/nurses/pages/ProfilePage';
import NewsPage from './features/news/NewsPage';
import OTPage from './features/ot/pages/OTPage';

import AuthGuard from './components/layout/AuthGuard';

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
                {/* Dashboard Root -> Summary View */}
                {/* Dashboard Root -> Redirect to Calendar */}{/* SummaryPage removed as per request */}
                <Route index element={<Navigate to="calendar" replace />} />

                <Route path="calendar" element={<CalendarPage />} />
                <Route path="ot" element={<OTPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* News might be public or protected, sidebar has it. Let's make it available in AppLayout */}
              <Route path="/news" element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }>
                <Route index element={<NewsPage />} />
              </Route>


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
