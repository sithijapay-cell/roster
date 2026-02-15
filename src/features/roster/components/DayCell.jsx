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
                "min-h-[70px] md:min-h-[120px] bg-background border-b border-r p-1 md:p-2 relative cursor-pointer hover:bg-muted/50 transition-all duration-200 flex flex-col gap-1 group",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                isTodayDate && "ring-2 ring-primary ring-inset z-10 shadow-md",
                dayType === 'DO' && "bg-emerald-50/50 dark:bg-emerald-950/20",
                dayType === 'PH' && "bg-amber-50/50 dark:bg-amber-950/20"
            )}
        >
            <span className={cn(
                "text-xs md:text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                isTodayDate ? "bg-primary text-white shadow-sm" : "text-slate-500 group-hover:text-slate-900 group-hover:bg-slate-200/50"
            )}>
                {format(day, 'd')}
            </span>

            <div className="flex flex-wrap gap-1 content-start flex-1 mt-1">
                {dayType && (
                    <Badge variant="secondary" className={cn(
                        "text-[10px] px-1.5 h-5 w-full justify-center md:w-auto font-medium border-0",
                        DAY_TYPES[dayType]?.color
                    )}>
                        {dayType}
                    </Badge>
                )}
                {shifts.map((shift, idx) => (
                    <Badge key={idx} variant="outline" className={cn(
                        "text-[10px] px-1.5 h-5 flex-1 justify-center min-w-[24px] bg-white border shadow-sm font-semibold",
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
