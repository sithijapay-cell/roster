import React, { useMemo } from 'react';
import { useStore } from '../../../context/StoreContext';
import { format, addDays, isSameDay } from 'date-fns';
import { Card } from '../../../components/ui/Card';

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
            <h3 className="text-lg font-bold text-slate-900 mb-4 px-1">Upcoming Schedule</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {nextDays.map((date) => {
                    const shift = getShiftForDate(date);
                    const isToday = isSameDay(date, today);

                    return (
                        <Card
                            key={date.toString()}
                            className={`border shadow-sm text-center overflow-hidden transition-all ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''
                                }`}
                        >
                            <div className={`py-2 text-xs font-bold uppercase tracking-wider ${isToday ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {format(date, 'EEE')}
                            </div>
                            <div className="p-4 flex flex-col items-center justify-center min-h-[80px]">
                                {shift?.shifts && shift.shifts.length > 0 ? (
                                    <>
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {shift.shifts.map((code, idx) => (
                                                <span key={idx} className={`text-2xl font-black ${['M', 'E', 'DN'].includes(code) ? 'text-slate-800' : 'text-slate-400'
                                                    }`}>
                                                    {code}
                                                </span>
                                            ))}
                                        </div>
                                        {shift.shifts.includes('M') && <span className="text-[10px] text-slate-400 mt-1">7am - 1pm</span>}
                                        {shift.shifts.includes('E') && <span className="text-[10px] text-slate-400 mt-1">1pm - 7pm</span>}
                                        {shift.shifts.includes('DN') && <span className="text-[10px] text-slate-400 mt-1">7pm - 7am</span>}
                                    </>
                                ) : shift?.type ? (
                                    <span className="text-xl font-bold text-slate-500">{shift.type}</span>
                                ) : (
                                    <span className="text-sm text-slate-300 font-medium">Off</span>
                                )}
                            </div>
                            <div className="py-1 border-t border-slate-50 text-[10px] text-slate-400">
                                {format(date, 'dd MMM')}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default UpcomingShifts;
