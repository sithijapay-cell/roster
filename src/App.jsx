import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';
import MainLayout from './layouts/MainLayout';

import DashboardHome from './features/dashboard/DashboardHome';
import CalendarPage from './features/roster/pages/CalendarPage';
import SummaryPage from './features/roster/pages/SummaryPage';
import NursesPage from './features/nurses/pages/NursesPage';
import ProfilePage from './features/nurses/pages/ProfilePage';
import Home from './pages/Home';
import About from './pages/About';
import Tools from './pages/Tools';
import News from './pages/News';
import TheaterPage from './pages/TheaterPage';

import { AuthProvider } from './features/auth/context/AuthContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <StoreProvider>
            <Routes>
              {/* Main Website Routes */}
              <Route path="/" element={<MainLayout><Home /></MainLayout>} />
              <Route path="/about" element={<MainLayout><About /></MainLayout>} />
              <Route path="/tools" element={<MainLayout><Tools /></MainLayout>} />
              <Route path="/news" element={<MainLayout><News /></MainLayout>} />
              <Route path="/theater" element={<MainLayout><TheaterPage /></MainLayout>} />

              {/* Roster Application Routes */}
              <Route path="/roster/*" element={
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/summary" element={<SummaryPage />} />
                    <Route path="/nurses" element={<NursesPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Routes>
                </DashboardLayout>
              } />
            </Routes>
          </StoreProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
