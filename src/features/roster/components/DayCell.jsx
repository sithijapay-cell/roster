import React from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { cn } from '../../../lib/utils';
import { SHIFT_TYPES, DAY_TYPES } from '../../../utils/validation';
import { Badge } from '../../../components/ui/Badge';

const DayCell = ({ day, currentMonth, data, onClick }) => {
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isTodayDate = isToday(day);

    // Data shape: { shifts: ['M', 'DN'], type: 'DO' }
    const shifts = data?.shifts || [];
    const dayType = data?.type;

    return (
        <div
            onClick={() => onClick(day)}
            className={cn(
                "min-h-[85px] md:min-h-[110px] bg-card border p-1 md:p-2 relative cursor-pointer hover:bg-accent/50 transition-colors flex flex-col gap-1 overflow-hidden",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                isTodayDate && "ring-2 ring-blue-500 ring-inset z-10",
                dayType === 'DO' && "bg-emerald-50/50 dark:bg-emerald-950/10",
                dayType === 'PH' && "bg-amber-50/50 dark:bg-amber-950/10"
            )}
        >
            <span className={cn(
                "text-xs md:text-sm font-medium w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full mb-1",
                isTodayDate ? "bg-blue-600 text-white shadow-sm" : "text-slate-700"
            )}>
                {format(day, 'd')}
            </span>



            <div className="flex flex-wrap gap-1 content-start flex-1">
                {dayType && (
                    <Badge variant="secondary" className={cn(
                        "text-[10px] px-1.5 py-0 rounded-md h-5 tracking-wide w-full justify-center md:w-auto",
                        DAY_TYPES[dayType]?.color
                    )}>
                        {dayType}
                    </Badge>
                )}
                {shifts.map((shift, idx) => (
                    <Badge key={idx} variant="outline" className={cn(
                        "text-[10px] px-1.5 py-0 rounded-md h-5 flex-1 justify-center min-w-[20px] bg-white dark:bg-slate-800",
                        SHIFT_TYPES[shift]?.color
                    )}>
                        {shift}
                    </Badge>
                ))}
            </div>
        </div>
    );
};

export default DayCell;
