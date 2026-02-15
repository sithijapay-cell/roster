import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useStore } from '../../../context/StoreContext';
import { getReportingPeriod } from '../../../utils/reportingPeriod';
import { calculateRosterStats } from '../../../utils/rosterCalculations';
import { generatePDF } from '../../../services/pdfService';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/Card';
import { Download, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { connectCalendar, syncShiftToCalendar } from '../services/calendarService';
import { toast } from 'react-hot-toast'; // Assuming you have toast, if not I'll use alert
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';

const SummaryPage = () => {
    const { shifts, profile } = useStore();
    const [viewDate, setViewDate] = useState(new Date());
    const navigate = useNavigate();

    const { startDate, endDate } = useMemo(() => getReportingPeriod(viewDate), [viewDate]);

    const { weeks, monthlyStats } = useMemo(() => calculateRosterStats(shifts, viewDate), [shifts, viewDate]);

    const weeklyStatsFormatted = useMemo(() => {
        return weeks.map(w => ({
            label: w.label,
            range: w.range,
            box1: w.stats.box1,
            box2: w.stats.box2,
            box3: w.stats.box3,
            box4: w.stats.box4
        }));
    }, [weeks]);

    const handleDownload = () => {
        generatePDF(profile, shifts, viewDate);
    };

    const handleSyncCalendar = async () => {
        const confirmSync = window.confirm("Sync this month's shifts to Google Calendar?");
        if (!confirmSync) return;

        // 1. Connect/Auth
        const authResult = await connectCalendar();
        if (!authResult.success) {
            alert("Failed to connect to Google Calendar: " + authResult.error);
            return;
        }

        // 2. Filter shifts for current view month
        const currentMonthStr = format(viewDate, 'yyyy-MM');
        const shiftsToSync = Object.entries(shifts).filter(([date, shift]) =>
            date.startsWith(currentMonthStr) && shift.shiftType !== 'Off'
        );

        if (shiftsToSync.length === 0) {
            alert("No shifts found to sync for this month.");
            return;
        }

        // 3. Sync Loop
        let successCount = 0;
        let failCount = 0;

        // Show loading state (simple for now)
        const toastId = "Syncing..."; // Placeholder for toast if available

        for (const [date, shift] of shiftsToSync) {
            const res = await syncShiftToCalendar(shift, date);
            if (res.success) successCount++;
            else failCount++;
        }

        alert(`Sync Complete!\nSuccessfully synced: ${successCount}\nFailed: ${failCount}`);
    };

    const isProfileComplete = profile && profile.name;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Monthly Summary</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="py-2 px-4 border rounded bg-card">{format(viewDate, 'MMMM yyyy')}</span>
                    <Button variant="outline" size="icon" onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reporting Period: {format(startDate, 'dd MMM')} - {format(endDate, 'dd MMM')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-primary/10 rounded-lg">
                        <div className="text-4xl font-bold text-primary">{monthlyStats.box1}</div>
                        <div className="text-sm text-muted-foreground uppercase tracking-wide">Normal Hours</div>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-lg">
                        <div className="text-4xl font-bold text-primary">{monthlyStats.box2}</div>
                        <div className="text-sm text-muted-foreground uppercase tracking-wide">Overtime Hours</div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Weekly Calculation</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Week</TableHead>
                                <TableHead className="text-center border-l border-r">Box 1<br /><span className="text-xs font-normal text-muted-foreground">Duty</span></TableHead>
                                <TableHead className="text-center border-r">Box 2<br /><span className="text-xs font-normal text-muted-foreground">OT</span></TableHead>
                                <TableHead className="text-center border-r">Box 3<br /><span className="text-xs font-normal text-muted-foreground">Total</span></TableHead>
                                <TableHead className="text-center bg-primary/5 text-primary">Box 4<br /><span className="text-xs font-normal text-primary/70">Payable</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {weeklyStatsFormatted.map((week, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="font-medium">{week.label}</div>
                                        <div className="text-xs text-muted-foreground">{week.range}</div>
                                    </TableCell>
                                    <TableCell className="text-center border-l border-r border-border/50 font-mono text-base">{week.box1}</TableCell>
                                    <TableCell className="text-center border-r border-border/50 font-mono text-base">{week.box2}</TableCell>
                                    <TableCell className="text-center border-r border-border/50 font-mono font-medium text-base">{week.box3}</TableCell>
                                    <TableCell className="text-center bg-primary/5 font-mono font-bold text-primary text-base">{week.box4}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell className="font-bold">Monthly Total</TableCell>
                                <TableCell className="border-l border-r border-border/50"></TableCell>
                                <TableCell className="border-r border-border/50"></TableCell>
                                <TableCell className="text-center border-r border-border/50 font-mono font-bold text-lg text-primary">{monthlyStats.box3}</TableCell>
                                <TableCell className="text-center bg-primary/10 font-mono font-bold text-lg text-primary">{monthlyStats.box4}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
                <CardFooter className="flex justify-between items-center bg-muted/50 p-6">
                    <div className="text-sm text-muted-foreground">
                        {!isProfileComplete && "Complete profile to enable download."}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleSyncCalendar} className="gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            Sync to Calendar
                        </Button>
                        <Button onClick={handleDownload} disabled={!isProfileComplete} className="gap-2">
                            <Download className="h-4 w-4" />
                            Download Form 108
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SummaryPage;
