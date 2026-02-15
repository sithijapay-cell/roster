import React, { useMemo } from 'react';
import { useStore } from '../../../context/StoreContext';
import { format, addDays, isSameDay } from 'date-fns';
import { Card } from '../../../components/ui/Card';
import { cn } from '../../../lib/utils';
import { SHIFT_TYPES } from '../../../utils/validation';

const UpcomingShifts = () => {
    const { shifts } = useStore();
    const today = new Date();

    // Get next 5 days
    const nextDays = useMemo(() => {
        return Array.from({ length: 5 }).map((_, i) => addDays(today, i));
    }, []);

    const getShiftForDate = (date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return shifts[dateKey] || null;
    };

    return (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4 px-1">Upcoming Schedule</h3>
            <div className="grid grid-cols-5 gap-2 md:gap-4">
                {nextDays.map((date) => {
                    const shift = getShiftForDate(date);
                    const isToday = isSameDay(date, today);

                    return (
                        <Card
                            key={date.toString()}
                            className={cn(
                                "border shadow-sm text-center overflow-hidden transition-all hover:shadow-md",
                                isToday ? 'ring-2 ring-primary ring-offset-1 border-primary' : ''
                            )}
                        >
                            <div className={cn(
                                "py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider",
                                isToday ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            )}>
                                {format(date, 'EEE')}
                            </div>
                            <div className="p-2 md:p-4 flex flex-col items-center justify-center min-h-[70px] md:min-h-[90px]">
                                {shift?.shifts && shift.shifts.length > 0 ? (
                                    <>
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {shift.shifts.map((code, idx) => (
                                                <span key={idx} className={cn(
                                                    "text-lg md:text-2xl font-black",
                                                    SHIFT_TYPES[code]?.color ? SHIFT_TYPES[code].color.replace('bg-', 'text-').replace('/10', '') : "text-foreground"
                                                )}>
                                                    {code}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                ) : shift?.type ? (
                                    <span className={cn(
                                        "text-sm md:text-base font-bold",
                                        shift.type === 'Off' ? "text-muted-foreground" : "text-secondary"
                                    )}>{shift.type}</span>
                                ) : (
                                    <span className="text-xs md:text-sm text-muted-foreground font-medium">Off</span>
                                )}
                            </div>
                            <div className="py-1 border-t bg-muted/20 text-[10px] text-muted-foreground">
                                {format(date, 'd MMM')}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default UpcomingShifts;
