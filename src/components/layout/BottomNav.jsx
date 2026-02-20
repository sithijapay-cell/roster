import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
    CalendarDays,
    Home,
    User as UserIcon,
    Calculator
} from 'lucide-react';

const BottomNav = ({ className }) => {
    const navItems = [
        { to: '/roster', exact: true, icon: Home, label: 'Home' }, // Dashboard
        { to: '/roster/calendar', icon: CalendarDays, label: 'Roster' },
        { to: '/roster/tools', icon: Calculator, label: 'Tools' },
        { to: '/roster/settings', icon: UserIcon, label: 'Settings' },
    ];

    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "bg-background/80 backdrop-blur-xl border-t border-white/5 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]",
            "pb-safe", // Safe area padding
            className
        )}>
            <nav className="grid h-16 grid-cols-4 items-center justify-items-center">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.exact}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center gap-1.5 transition-all duration-300",
                                "w-full h-full",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground/60 hover:text-muted-foreground"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={cn(
                                    "p-1.5 rounded-full transition-all duration-300",
                                    isActive ? "bg-primary/10 scale-110" : "bg-transparent"
                                )}>
                                    <item.icon className={cn("h-5 w-5", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-medium tracking-wide",
                                    isActive ? "font-semibold" : ""
                                )}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default BottomNav;
