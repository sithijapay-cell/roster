import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { useAuth } from '../../features/auth/context/AuthContext';
import {
    CalendarDays,
    FileText,
    User as UserIcon,
    LogOut,
    LayoutDashboard,
    Newspaper,
    Settings
} from 'lucide-react';

const Sidebar = ({ className }) => {
    const { logout } = useAuth();

    const navItems = [
        // { to: '/roster', icon: LayoutDashboard, label: 'Dashboard' }, // Removed as per request
        { to: '/roster/calendar', icon: CalendarDays, label: 'Roster' },

        // { to: '/roster/ot', icon: FileText, label: 'OT Forms' }, // Removed as per request
        { to: '/news', icon: Newspaper, label: 'News' },
        { to: '/roster/profile', icon: UserIcon, label: 'Profile' },
    ];

    return (
        <div className={cn("flex h-full w-64 flex-col border-r bg-card shadow-sm", className)}>
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-lg font-bold text-primary">ShiftMaster</span>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/roster'} // Exact match for dashboard root
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    isActive
                                        ? "bg-muted text-primary font-semibold"
                                        : "text-muted-foreground"
                                )
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="border-t p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
                    onClick={logout}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;
