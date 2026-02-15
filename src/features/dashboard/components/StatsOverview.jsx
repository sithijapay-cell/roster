import React, { useMemo } from 'react';
import { Clock, DollarSign, Calendar, Activity } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { calculateRosterStats } from '../../../utils/rosterCalculations';
import { Card, CardContent } from '../../../components/ui/Card';

const StatCard = ({ icon: Icon, label, value, subtext, colorClass, iconColor }) => (
    <Card className="border shadow-sm hover:shadow-md transition-all duration-300 group">
        <CardContent className="p-5 flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${colorClass} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">{value}</h3>
                <p className="text-xs text-muted-foreground mt-1 opacity-80">{subtext}</p>
            </div>
        </CardContent>
    </Card>
);

const StatsOverview = () => {
    const { shifts } = useStore();
    const today = new Date();

    const { monthlyStats } = useMemo(() => calculateRosterStats(shifts, today), [shifts]);

    const nextShift = useMemo(() => {
        const upcomingDates = Object.keys(shifts)
            .filter(dateStr => new Date(dateStr) >= new Date().setHours(0, 0, 0, 0))
            .sort();

        if (upcomingDates.length > 0) {
            const date = upcomingDates[0];
            const shift = shifts[date];
            // Handle array of shifts (e.g. ['M', 'E'])
            const shiftType = shift.shifts && shift.shifts.length > 0 ? shift.shifts.join(', ') : shift.type;
            return { date, type: shiftType || 'Unknown' };
        }
        return null;
    }, [shifts]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
                icon={Calendar}
                label="Next Shift"
                value={nextShift ? `${nextShift.type}` : "No Upcoming"}
                subtext={nextShift ? nextShift.date : "Relax & Recharge"}
                colorClass="bg-blue-50"
                iconColor="text-blue-600"
            />
            <StatCard
                icon={Clock}
                label="Duty Hours (Month)"
                value={`${monthlyStats.box1 || 0} Hrs`}
                subtext={`Target: ~150 Hrs`}
                colorClass="bg-medical-50"
                iconColor="text-medical-600"
            />
            <StatCard
                icon={DollarSign}
                label="Est. OT Hours"
                value={`${monthlyStats.box2 || 0} Hrs`}
                subtext="Based on current roster"
                colorClass="bg-emerald-50"
                iconColor="text-emerald-600"
            />
        </div>
    );
};

export default StatsOverview;
