import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import { useAuth } from '../features/auth/context/AuthContext';
// import { Toaster } from 'sonner'; // Assuming sonner or similar for toasts, if not present we can skip

const AppLayout = () => {
    const { user, loading } = useAuth();
    console.log("AppLayout: rendering", { user, loading });
    const location = useLocation();

    // If not logged in, we might want to show a simple layout or redirect 
    // (Redirect logic is handled by ProtectedRoute usually)
    // For now, if no user, render children as is (e.g. for landing page if wrapped)
    // But typically AppLayout is for authenticated sections.

    // Check if we are on a page that should show the full app shell
    const isAppPage = location.pathname.startsWith('/roster') || location.pathname.startsWith('/news');

    if (!isAppPage) {
        return <Outlet />;
    }

    return (
        <div className="flex h-screen w-full bg-background">
            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="hidden md:block fixed inset-y-0 left-0 z-50">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:pl-64 h-full overflow-hidden">
                {/* Header (Optional, for mobile title or actions) */}
                <header className="sticky top-0 z-40 md:hidden flex h-14 items-center gap-4 bg-background px-4 lg:h-[60px] lg:px-6 shadow-sm">
                    <span className="font-semibold text-lg">ShiftMaster</span>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Nav - Hidden on Desktop */}
            <div className="md:hidden">
                <BottomNav />
            </div>

            {/* Global Toaster */}
            {/* <Toaster /> */}
        </div>
    );
};

export default AppLayout;
