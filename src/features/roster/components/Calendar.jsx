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

    // Color Logic for Pills
    const getShiftColor = (shiftCode) => {
        if (!shiftCode) return "bg-gray-100/5 text-gray-400"; // Empty/Off

        if (shiftCode === 'OFF' || shiftCode === 'DO') return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
        if (shiftCode === 'PH') return "bg-pink-500/10 text-pink-400 border border-pink-500/20";
        if (shiftCode === 'SD') return "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"; // Sleeping Day

        if (shiftCode.includes('M')) return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"; // Morning (Green)
        if (shiftCode.includes('E')) return "bg-blue-500/20 text-blue-300 border border-blue-500/20"; // Evening (Blue)
        if (shiftCode.includes('N')) return "bg-violet-500/20 text-violet-300 border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.15)]"; // Night (Purple)

        return "bg-slate-500/10 text-slate-300";
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

            {/* Calendar Grid - Square Cells */}
            <div className="grid grid-cols-7 gap-1.5 auto-rows-fr">
                {days.map((day, idx) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const shiftData = shifts[dateStr];
                    // Handle both simple string (legacy) and object structure if store updated
                    const shiftCode = typeof shiftData === 'string' ? shiftData : shiftData?.shifts?.[0];

                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isTodayDesc = isSameDay(day, new Date());

                    // Determine if OT (add glow/border)
                    const isOT = shiftCode && (shiftCode.includes('OT') || shiftCode.includes('Extra'));

                    return (
                        <div
                            key={idx}
                            onClick={() => handleDayClick(day)}
                            className={cn(
                                "aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative group overflow-hidden border border-transparent",
                                isCurrentMonth ? "bg-card/40 hover:bg-card/80 hover:scale-105 hover:border-white/10" : "opacity-20 grayscale",
                                isTodayDesc && "ring-1 ring-primary ring-offset-1 ring-offset-background bg-primary/5",
                                selectedDate && isSameDay(day, selectedDate) && "ring-2 ring-accent z-10 scale-105"
                            )}
                        >
                            {/* Date Number */}
                            <span className={cn(
                                "text-[10px] font-medium mb-0.5 z-10",
                                isTodayDesc ? "text-primary font-bold" : "text-muted-foreground"
                            )}>
                                {format(day, 'd')}
                            </span>

                            {/* Shift Pill */}
                            {shiftCode && (
                                <div className={cn(
                                    "px-1.5 py-0.5 rounded-[4px] text-[8px] font-extrabold tracking-wide z-10 transition-all",
                                    getShiftColor(shiftCode),
                                    isOT && "border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                                )}>
                                    {shiftCode.replace('OFF', 'DO')}
                                </div>
                            )}

                            {/* Glass Reflection Effect */}
                            <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                        </div>
                    );
                })}
            </div>

            {/* Edit Sheet */}
            <EditDaySheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                date={selectedDate}
                currentData={selectedDate ? {
                    shifts: shifts[format(selectedDate, 'yyyy-MM-dd')],
                    // Pass partials if/when store provides them. For now, EditDaySheet likely re-fetches or defaults.
                    // Assuming shifts[date] returns the full object if using new structure, or just codes.
                    // EditDaySheet handles the parsing.
                } : null}
                onSave={handleSaveShift}
            />
        </div>
    );
};

export default Calendar;
