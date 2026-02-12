import React, { useMemo } from 'react';
import { Clock, DollarSign, Calendar } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { getReportingPeriod } from '../../../utils/reportingPeriod';
import { calculateRosterStats } from '../../../utils/rosterCalculations';
import { Card, CardContent } from '../../../components/ui/Card';

const StatCard = ({ icon: Icon, label, value, subtext, colorClass }) => (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6 flex items-start gap-4">
            <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                <p className="text-xs text-slate-400 mt-1">{subtext}</p>
            </div>
        </CardContent>
    </Card>
);

const StatsOverview = () => {
    const { shifts } = useStore();
    const today = new Date();

    // Calculate Summary Stats using existing logic
    const { monthlyStats } = useMemo(() => calculateRosterStats(shifts, today), [shifts]);

    // Calculate Next Shift
    const nextShift = useMemo(() => {
        // Simple logic to find next upcoming shift from today
        // Note: Object keys are 'yyyy-MM-dd'
        const upcomingDates = Object.keys(shifts)
            .filter(dateStr => new Date(dateStr) >= new Date().setHours(0, 0, 0, 0))
            .sort();

        if (upcomingDates.length > 0) {
            const date = upcomingDates[0];
            const shift = shifts[date];
            return { date, type: shift.type || 'Unknown' }; // Assuming standard structure
        }
        return null;
    }, [shifts]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
                icon={Calendar}
                label="Next Shift"
                value={nextShift ? `${nextShift.type} Shift` : "No Upcoming"}
                subtext={nextShift ? nextShift.date : "Relax & Recharge"}
                colorClass="bg-indigo-500"
            />
            <StatCard
                icon={Clock}
                label="Duty Hours (Month)"
                value={`${monthlyStats.box1} Hrs`}
                subtext={`Target: ~150 Hrs`}
                colorClass="bg-teal-500"
            />
            <StatCard
                icon={DollarSign}
                label="Est. OT Hours"
                value={`${monthlyStats.box2} Hrs`}
                subtext="Based on current roster"
                colorClass="bg-emerald-500"
            />
        </div>
    );
};

export default StatsOverview;
