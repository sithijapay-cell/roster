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
    Settings
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
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
            >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
                <span>{label}</span>
                {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    {/* Brand */}
                    <div className="h-16 flex items-center px-6 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-white font-bold text-lg">N</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-slate-900 leading-none">SL Nurses</h1>
                                <span className="text-xs text-slate-500 font-medium tracking-wider">ROSTER HUB</span>
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
                    <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                        <div className="px-4 mb-2">
                            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</h2>
                        </div>
                        {navItems.map((item) => (
                            <NavItem key={item.to} {...item} />
                        ))}
                    </div>

                    {/* User Profile Footer */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    {profile?.name || 'Nurse User'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {profile?.email || 'Logged In'}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200"
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
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:hidden sticky top-0 z-30">
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
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
