import React, { useState } from 'react';
import {
    format,
    addMonths,
    subDays,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import DayCell from './DayCell';
import EditDaySheet from './EditDayModal';
import { useStore } from '../../../context/StoreContext';
import { generatePDF } from '../../../services/pdfService';
import { getReportingPeriod } from '../../../utils/reportingPeriod';
import { Download } from 'lucide-react';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { shifts, profile } = useStore();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const jumpToToday = () => setCurrentDate(new Date());

    const handleDayClick = (day) => {
        setSelectedDate(day);
        setIsEditOpen(true);
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleDownload = async () => {
        // const { startDate, endDate } = getReportingPeriod(currentDate); // Not needed for generatePDF arg anymore
        if (!profile?.name) {
            alert("Please complete your profile (Name) before downloading.");
            return;
        }

        try {
            // Pass currentDate (Date object) as expected by pdfGenerator
            const pdfBytes = await generatePDF(profile, shifts, currentDate);

            // Create Blob and trigger download
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `OT_Form_${format(currentDate, 'yyyy_MM')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to generate PDF. check console for details.");
        }
    };

    return (
        <div className="pb-24 md:pb-10">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <p className="text-slate-500 font-medium">Manage your duty roster</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Download PDF</span>
                        <span className="sm:hidden">PDF</span>
                    </Button>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm w-fit">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-slate-100">
                            <ChevronLeft className="h-5 w-5 text-slate-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={jumpToToday} className="font-semibold text-slate-700 hover:bg-slate-100">
                            Today
                        </Button>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-slate-100">
                            <ChevronRight className="h-5 w-5 text-slate-600" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 overflow-hidden bg-white text-slate-800 rounded-xl">
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
                    {weekDays.map(day => (
                        <div key={day} className="py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 bg-slate-200 gap-px border-l border-t border-slate-200">
                    {calendarDays.map((day, idx) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        let data = shifts[dateKey] ? { ...shifts[dateKey] } : { shifts: [], type: null };

                        // Auto-detect Sleeping Day (SD) from previous night shift
                        const prevDay = subDays(day, 1);
                        const prevKey = format(prevDay, 'yyyy-MM-dd');
                        const prevData = shifts[prevKey];

                        if (prevData?.shifts?.includes('DN')) {
                            if (!data.type) {
                                data.type = 'SD';
                            }
                        }

                        return (
                            <DayCell
                                key={dateKey}
                                day={day}
                                currentMonth={currentDate}
                                data={data}
                                onClick={handleDayClick}
                            />
                        );
                    })}
                </div>
            </Card>

            <EditDaySheet
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                date={selectedDate}
                currentData={selectedDate ? shifts[format(selectedDate, 'yyyy-MM-dd')] : null}
            />
        </div>
    );
};

export default Calendar;
