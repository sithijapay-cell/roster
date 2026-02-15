import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
    CalendarDays,
    FileText,
    User as UserIcon,
    LayoutDashboard,
    Menu
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/Sheet';
import { Button } from '../ui/Button';
import Sidebar from './Sidebar'; // Reuse sidebar for mobile drawer if needed, but here we use bottom tabs

const BottomNav = ({ className }) => {
    const navItems = [
        // { to: '/roster', icon: LayoutDashboard, label: 'Home' }, // Removed as per request
        { to: '/roster/calendar', icon: CalendarDays, label: 'Roster' },
        // { to: '/roster/ot', icon: FileText, label: 'OT' }, // Removed as per request
        { to: '/roster/profile', icon: UserIcon, label: 'Profile' },
    ];

    return (
        <div className={cn("fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
            <nav className="grid h-16 grid-cols-5 items-center justify-items-center">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/roster'}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-primary"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </NavLink>
                ))}

                {/* Menu Item for More/Sheet */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors">
                            <Menu className="h-5 w-5" />
                            Menu
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0">
                        <Sidebar className="w-full border-none shadow-none" />
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
    );
};

export default BottomNav;
