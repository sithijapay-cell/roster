import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import { useAuth } from '../features/auth/context/AuthContext';
// import { Toaster } from 'sonner'; // Assuming sonner or similar for toasts, if not present we can skip

const AppLayout = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Pages that should show the full app shell
    const isAppPage = location.pathname.startsWith('/roster') ||
        location.pathname.startsWith('/news') ||
        location.pathname.startsWith('/tools');

    if (!isAppPage) {
        return <Outlet />;
    }

    return (
        <div className="flex min-h-screen w-full bg-background text-foreground">
            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="hidden md:block fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-card/50 backdrop-blur-xl">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:pl-64 min-h-screen relative">

                {/* Mobile Header (Optional, kept minimal or hidden as per Dashboard design) */}
                {/* <header className="sticky top-0 z-40 md:hidden flex h-14 items-center px-4 bg-background/80 backdrop-blur-md border-b border-white/5">
                    <span className="font-semibold text-lg text-primary">ShiftMaster</span>
                </header> */}

                <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Nav - Hidden on Desktop */}
            <div className="md:hidden">
                <BottomNav />
            </div>
        </div>
    );
};

export default AppLayout;
