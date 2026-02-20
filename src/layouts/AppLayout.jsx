import React, { useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import NotificationPrompt from '../components/ui/NotificationPrompt';
import { useAuth } from '../features/auth/context/AuthContext';
import { startNotificationListener, stopNotificationListener } from '../services/notificationService';

const AppLayout = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Start notification listener when user is logged in
    useEffect(() => {
        if (user) {
            startNotificationListener();
        }
        return () => stopNotificationListener();
    }, [user]);

    // Pages that should show the full app shell
    const isAppPage = location.pathname.startsWith('/roster') ||
        location.pathname.startsWith('/news');

    if (!isAppPage) {
        return <Outlet />;
    }

    return (
        <div className="flex min-h-screen w-full bg-background text-foreground">
            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="hidden md:block fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-card/50 backdrop-blur-xl">
                <Sidebar />
            </div>

            {/* Mobile Header - Visible only on mobile */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-background/80 backdrop-blur-md border-b border-white/5 flex items-center px-4 shadow-sm">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                    <img src="/shiftmasterlogo.png" alt="Logo" className="h-8 w-auto" />
                    <span className="text-lg font-bold text-primary">ShiftMaster</span>
                </Link>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:pl-64 min-h-screen relative pt-16 md:pt-0">
                <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8 overflow-y-auto">
                    <div key={location.pathname} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Nav - Hidden on Desktop */}
            <div className="md:hidden">
                <BottomNav />
            </div>

            {/* Notification Permission Prompt */}
            {user && <NotificationPrompt />}
        </div>
    );
};

export default AppLayout;

