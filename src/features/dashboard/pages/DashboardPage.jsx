import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import NextShiftCard from '../components/NextShiftCard';
import { Card, CardContent } from '../../../components/ui/Card';
import {
    Activity,
    Droplets,
    FileText,
    Bell,
    Calculator,
    CalendarDays
} from 'lucide-react';
import { cn } from '../../../lib/utils'; // Ensure cn utility is available or remove if not

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const quickActions = [
        {
            title: 'Medical Tools',
            icon: Calculator,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            link: '/tools',
            desc: 'IV & BMI Calc'
        },
        {
            title: 'OT Estimator',
            icon: FileText,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            link: '/roster/ot', // Assuming OT page exists
            desc: 'Check Claims'
        },
        {
            title: 'News Feed',
            icon: Bell,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            link: '/news',
            desc: 'Latest Updates'
        },
        {
            title: 'Full Roster',
            icon: CalendarDays,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            link: '/roster/calendar',
            desc: 'View Month'
        }
    ];

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-500">
            <Helmet>
                <title>Dashboard | ShiftMaster</title>
            </Helmet>

            {/* Header */}
            <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3">
                    <img src="/shiftmasterlogo.png" alt="Logo" className="h-10 w-auto object-contain" />
                    {/* <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-primary">ShiftMaster</h1> */}
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{today}</p>
                    {/* <p className="text-sm font-semibold">Welcome, {user?.displayName?.split(' ')[0] || 'Nurse'}</p> */}
                </div>
            </div>

            {/* Next Shift Summary */}
            <NextShiftCard />

            {/* Quick Access Grid */}
            <div>
                <h2 className="text-lg font-semibold mb-4 px-1 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                        <Card
                            key={index}
                            onClick={() => navigate(action.link)}
                            className="glass-card border-none hover:bg-white/5 active:scale-95 transition-all cursor-pointer group"
                        >
                            <CardContent className="p-4 flex flex-col items-start gap-3">
                                <div className={cn("p-3 rounded-xl", action.bg)}>
                                    <action.icon className={cn("h-6 w-6", action.color)} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{action.title}</h3>
                                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Recent News Teaser (Optional - could reuse NewsFeed component if made compact) */}
            {/* Keeping it simple for now as requested */}

        </div>
    );
};

export default DashboardPage;
