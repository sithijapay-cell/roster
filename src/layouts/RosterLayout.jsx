import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const RosterLayout = ({ children }) => {
    const location = useLocation();

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link to={to}>
                <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn("w-full justify-start md:w-auto", isActive && "font-semibold")}
                >
                    <Icon className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">{label}</span>
                </Button>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border">
                <div className="container flex h-14 items-center justify-between px-4">
                    <div className="flex items-center gap-1">
                        <div className="flex items-center tracking-tight">
                            <span className="font-bold text-xl text-foreground">SL Nurses</span>
                            <span className="font-light text-xl text-primary ml-1">Hub</span>
                        </div>
                        <span className="ml-2 text-xs font-medium text-muted-foreground uppercase tracking-widest hidden sm:inline-block border-l pl-2 border-border">Roster</span>
                    </div>
                    <nav className="flex items-center space-x-1">
                        <NavItem to="/roster" icon={CalendarIcon} label="Smart Roster" />
                        <NavItem to="/roster/summary" icon={FileText} label="Summary" />
                        <NavItem to="/roster/settings" icon={User} label="Settings" />
                    </nav>
                </div>
            </header>
            <main className="flex-1 container py-6 px-4 md:px-6">
                {children}
            </main>
        </div>
    );
};

export default RosterLayout;
