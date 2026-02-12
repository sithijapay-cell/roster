import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    FileText,
    User,
    LogOut,
    Menu,
    X,
    Settings,
    Globe
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../features/auth/context/AuthContext';
import { cn } from '../lib/utils';

const DashboardLayout = ({ children }) => {
    const { profile } = useStore();
    const { logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { to: '/roster', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { to: '/roster/calendar', icon: Calendar, label: 'Roster' },
        { to: '/roster/news', icon: Globe, label: 'News Feed' },
        { to: '/roster/summary', icon: FileText, label: 'Summary' },
        { to: '/roster/profile', icon: User, label: 'Profile' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const NavItem = ({ to, icon: Icon, label, exact }) => {
        const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to);

        return (
            <Link
                to={to}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                    "flex items-center gap-3 px-4 py-3.5 mx-2 rounded-xl transition-all duration-300 group relative overflow-hidden",
                    isActive
                        ? "bg-primary/10 text-primary font-medium shadow-md shadow-primary/10"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
            >
                {isActive && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full" />
                )}
                <Icon className={cn("h-5 w-5 relative z-10 transition-colors", isActive ? "text-primary fill-primary/20" : "text-slate-400 group-hover:text-slate-600")} />
                <span className="relative z-10">{label}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 flex font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-white/20 shadow-2xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    {/* Brand */}
                    <div className="h-24 flex items-center px-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/30">
                                <span className="text-white font-black text-xl">N</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-slate-900 dark:text-white leading-none text-lg">SL Nurses</h1>
                                <span className="text-[10px] text-primary font-bold tracking-widest uppercase mt-1 block">ROSTER HUB</span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto md:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                        <div className="px-4 mb-4">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Menu</h2>
                        </div>
                        {navItems.map((item) => (
                            <NavItem key={item.to} {...item} />
                        ))}
                    </div>

                    {/* User Profile Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center text-indigo-600 font-bold text-lg shadow-inner ring-2 ring-white">
                                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                    {profile?.name || 'Nurse User'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {profile?.email || 'Logged In'}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 hover:border-red-200"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:hidden sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6 text-slate-600" />
                        </Button>
                        <span className="font-semibold text-slate-900">Dashboard</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-slate-900 dark:to-slate-950 -z-10" />

                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
