import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { Clock, Sun, Moon, Coffee, Briefcase } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import { cn } from '../../../lib/utils';
import { calculateShiftDuration } from '../../../utils/rosterCalculations';

const NextShiftCard = () => {
    const { shifts, shiftTypes } = useStore();
    const today = new Date();

    // Find today's shift or the next upcoming shift
    let displayDate = today;
    let shiftCode = null;
    let isToday = false;

    // Check next 7 days
    for (let i = 0; i < 7; i++) {
        const checkDate = addDays(today, i);
        const dateStr = format(checkDate, 'yyyy-MM-dd');
        const code = shifts[dateStr];

        if (code && code !== 'OFF') {
            shiftCode = code;
            displayDate = checkDate;
            isToday = i === 0;
            break;
        }
    }

    const shiftDetails = shiftTypes ? shiftTypes[shiftCode] : null;

    if (!shiftCode) {
        return (
            <Card className="glass-card border-none text-white overflow-hidden relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 pointer-events-none" />
                <CardContent className="p-5 flex items-center gap-4 relative z-10">
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                        <Coffee className="h-6 w-6 text-blue-200" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-blue-50">No Upcoming Shifts</h3>
                        <p className="text-sm text-blue-200/70">Enjoy your time off!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Determine Icon and Color based on shift type
    let Icon = Briefcase;
    let colorClass = "from-blue-500 to-indigo-600";
    let iconClass = "text-blue-100";

    if (shiftCode.includes('N') || shiftCode === 'SD') {
        Icon = Moon;
        colorClass = "from-indigo-600 to-purple-700";
        iconClass = "text-indigo-100";
    } else if (shiftCode.includes('M')) {
        Icon = Sun;
        colorClass = "from-cyan-500 to-blue-600";
        iconClass = "text-amber-100"; // Morning sun tint
    } else if (shiftCode.includes('E')) {
        Icon = Sun; // Sunset?
        colorClass = "from-blue-500 to-indigo-600";
    }

    const formattedDate = isToday ? 'Today' : format(displayDate, 'EEEE, MMM d');
    const { start, end, duration } = calculateShiftDuration(shiftCode, {}, {}, displayDate);

    return (
        <Card className="border-none shadow-xl overflow-hidden relative mb-6 group">
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", colorClass)} />

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

            <CardContent className="p-5 relative z-10 text-white">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">{formattedDate}</p>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            {shiftDetails?.label || shiftCode}
                            {isToday && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full animate-pulse">Live</span>}
                        </h2>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                        <Icon className={cn("h-6 w-6", iconClass)} />
                    </div>
                </div>

                <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 opacity-70" />
                        <span className="font-semibold text-lg">{start} - {end}</span>
                    </div>
                    <div className="h-8 w-px bg-white/20" />
                    <div>
                        <span className="text-sm opacity-80 block">Duration</span>
                        <span className="font-semibold">{duration} Hrs</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default NextShiftCard;
