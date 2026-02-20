import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useStore } from '../../../context/StoreContext';
import { cn } from '../../../lib/utils';
import EditDaySheet from './EditDaySheet';

const Calendar = () => {
    const { shifts, updateShift } = useStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Generate days for the grid
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleDayClick = (day) => {
        setSelectedDate(day);
        setIsSheetOpen(true);
    };

    const handleSaveShift = (data) => {
        if (selectedDate) {
            updateShift(format(selectedDate, 'yyyy-MM-dd'), data.shifts, data.type, data.customEndTimes, data.customStartTimes);
        }
    };

    // Color Logic for Pills - High Contrast
    const getShiftColor = (shiftCode) => {
        if (!shiftCode || typeof shiftCode !== 'string') return "bg-gray-100/5 text-gray-400";

        if (shiftCode === 'OFF' || shiftCode === 'DO') return "bg-slate-200 text-slate-700 border border-slate-300";
        if (shiftCode === 'PH') return "bg-pink-100 text-pink-700 border border-pink-300";
        if (shiftCode === 'VL') return "bg-rose-100 text-rose-700 border border-rose-300"; // Vacation Leave

        // Core Shifts - Solid, Vibrant Colors
        if (shiftCode.includes('M')) return "bg-emerald-600 text-white shadow-sm border border-emerald-700"; // Morning
        if (shiftCode.includes('E')) return "bg-blue-600 text-white shadow-sm border border-blue-700"; // Evening
        if (shiftCode.includes('N')) return "bg-violet-700 text-white shadow-sm border border-violet-800"; // Night

        if (shiftCode.includes('OT')) return "bg-amber-500 text-black border border-amber-600 font-black"; // OT

        if (shiftCode === 'CL') return "bg-yellow-400 text-yellow-900 border border-yellow-500";
        if (shiftCode === 'SD') return "bg-indigo-200 text-indigo-800 border border-indigo-300";

        return "bg-slate-100 text-slate-500";
    };

    return (
        <div className="flex flex-col h-full max-w-sm mx-auto relative pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sticky top-0 z-20 bg-background/80 backdrop-blur-md py-2">
                <h2 className="text-xl font-bold capitalize text-foreground animate-in fade-in slide-in-from-top-2">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-full hover:bg-white/10 active:scale-90 transition-all">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-full hover:bg-white/10 active:scale-90 transition-all">
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-bold text-muted-foreground uppercase opacity-70 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid - Larger Cells */}
            <div className="grid grid-cols-7 gap-2 auto-rows-fr px-2">
                {days.map((day, idx) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const shiftData = shifts[dateStr];
                    const rawShift = shiftData;

                    // --- LOGIC: EXTRACT ALL APPLICABLE CODES ---
                    const activeCodesSet = new Set();

                    // 1. ADD Shifts from Array (New Structure)
                    if (rawShift?.shifts && Array.isArray(rawShift.shifts)) {
                        rawShift.shifts.forEach(s => activeCodesSet.add(s));
                    }
                    // 2. ADD Shifts from Legacy String
                    else if (typeof rawShift === 'string') {
                        activeCodesSet.add(rawShift);
                    }

                    // 3. ADD Type (e.g. CL, DO, PH) - Additive
                    if (rawShift?.type && rawShift.type !== 'Work') {
                        activeCodesSet.add(rawShift.type);
                    }

                    // 4. Auto-SD Logic (Previous Day Check)
                    // If Set is empty or just contains OT, we still check SD entitlement
                    const prevDate = new Date(day);
                    prevDate.setDate(prevDate.getDate() - 1);
                    const prevStr = format(prevDate, 'yyyy-MM-dd');
                    const prevData = shifts[prevStr];
                    const prevShift = typeof prevData === 'string' ? prevData : prevData?.shifts?.[0];

                    if (prevShift === 'DN') {
                        activeCodesSet.add('SD');
                    }

                    const uniqueCodes = Array.from(activeCodesSet);

                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isTodayDesc = isSameDay(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    return (
                        <div
                            key={idx}
                            onClick={() => handleDayClick(day)}
                            className={cn(
                                "min-h-[120px] h-full rounded-xl flex flex-col items-center justify-start py-2 cursor-pointer transition-all duration-300 relative group border bg-card",
                                isCurrentMonth ? "hover:bg-card/80 hover:border-primary/30" : "opacity-40 grayscale bg-muted/20 border-transparent",
                                isTodayDesc ? "border-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)] bg-primary/5" : "border-border/40",
                                isSelected && "ring-2 ring-primary border-primary z-10 scale-[1.02] shadow-lg"
                            )}
                        >
                            {/* Date Number */}
                            <span className={cn(
                                "text-sm font-bold mb-2 z-10",
                                isTodayDesc ? "text-primary" : "text-foreground/80"
                            )}>
                                {format(day, 'd')}
                            </span>

                            {/* Shift Pills Container - Stacked Vertically */}
                            <div className="flex flex-col gap-1 w-full px-1 z-10">
                                {uniqueCodes.map((code, i) => (
                                    <div key={i} className={cn(
                                        "w-full text-center py-1 rounded-md text-[10px] font-bold tracking-wide uppercase shadow-sm leading-tight break-words",
                                        getShiftColor(code)
                                    )}>
                                        {code.replace('OFF', 'DO')}
                                    </div>
                                ))}
                            </div>

                            {/* Active Glow for Today */}
                            {isTodayDesc && <div className="absolute inset-0 bg-primary/5 blur-xl -z-10" />}
                        </div>
                    );
                })}
            </div>

            {/* Edit Sheet */}
            <EditDaySheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                date={selectedDate}
                currentData={selectedDate ? shifts[format(selectedDate, 'yyyy-MM-dd')] : null}
                onSave={handleSaveShift}
            />
        </div>
    );
};

export default Calendar;
