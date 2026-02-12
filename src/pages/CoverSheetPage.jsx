import React, { useMemo, useState } from 'react';
import { format, addDays, isSameQuarter, eachDayOfInterval, startOfMonth, startOfWeek } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { getReportingPeriod } from '../utils/reportingPeriod';
import { Button } from '../components/ui/Button';
import { Printer, Calendar } from 'lucide-react';

const CoverSheetPage = () => {
    const { shifts, profile } = useStore();
    const [viewDate, setViewDate] = useState(new Date());

    const { startDate, endDate } = useMemo(() => getReportingPeriod(viewDate), [viewDate]);

    // Calculate Totals & Leaves
    const { totalDuty, totalOT, leaves } = useMemo(() => {
        let duty = 0;
        let ot = 0;
        const leaveList = [];

        // Iterate through reporting period
        let currentDate = startDate;
        while (currentDate <= endDate) {
            const dateKey = format(currentDate, 'yyyy-MM-dd');
            const dayData = shifts[dateKey];

            if (dayData) {
                // Calculate Hours (Simplified Mirror of SummaryPage)
                // Note: For Cover Sheet, we usually just need the grand totals.
                // Assuming we can re-use the same logic or just sum up basic shift values.
                // For accuracy, we really should mirror the PDF logic exactly:
                // Sleeping Days, Multi-shifts, etc.
                // To avoid duplication and risk, I will implement a simplified aggregation here 
                // matching the "WeeklyStats" grand totals logic.

                // ... Actually, to get the EXACT Grand Total OT including the "Total - 36" rule, 
                // we'd need to run the full weekly logic. 
                // Let's implement the full logic loop efficiently.
            }
            currentDate = addDays(currentDate, 1);
        }

        // Re-run full logic properly
        let d = startDate;
        let prevDayWasNight = false;

        // Check day before start
        const dayBefore = addDays(startDate, -1);
        if (shifts[format(dayBefore, 'yyyy-MM-dd')]?.shifts?.includes('DN')) {
            prevDayWasNight = true;
        }

        let tempDuty = 0;
        let tempOT = 0;
        let grandTotalAllHours = 0;
        let grandTotalOTHours = 0; // Final payable OT

        // We process week by week for "Total > 36" rule
        let weekStart = startDate;
        while (weekStart <= endDate) {
            let weeklyDuty = 0;
            let weeklyOT = 0;

            for (let i = 0; i < 7; i++) {
                const day = addDays(weekStart, i);
                if (day > endDate) break;

                const k = format(day, 'yyyy-MM-dd');
                const data = shifts[k] || { shifts: [], type: null };

                // Leaves
                if (data.type === 'CL' || data.type === 'VL') {
                    leaveList.push({ date: day, type: data.type });
                    weeklyDuty += 6;
                }

                // Logic
                const isSD = prevDayWasNight;
                const hasDN = data.shifts?.includes('DN');

                let active = [...(data.shifts || [])];

                if (isSD) {
                    active = active.map(s => (s === 'M' ? 'OTM' : s === 'E' ? 'OTE' : s === 'DN' ? 'OTN' : s));
                } else {
                    if (active.includes('DN')) {
                        if (active.includes('M')) { active = active.filter(s => s !== 'M'); active.push('OTM'); }
                        if (active.includes('E')) { active = active.filter(s => s !== 'E'); active.push('OTE'); }
                    } else if (active.includes('M') && active.includes('E')) {
                        active = active.filter(s => s !== 'E'); active.push('OTE');
                    }
                }

                // Sum
                if (active.includes('M')) weeklyDuty += 6;
                else if (active.includes('E')) weeklyDuty += 6;
                else if (active.includes('DN')) weeklyDuty += 12;

                if (active.includes('OTN')) weeklyOT += 12;
                else if (active.includes('OTM')) weeklyOT += 6;
                else if (active.includes('OTE')) weeklyOT += 6;

                prevDayWasNight = hasDN;
            }

            const totalWeek = weeklyDuty + weeklyOT;
            grandTotalAllHours += totalWeek;

            // Box 4 Rule
            if (totalWeek > 36) {
                grandTotalOTHours += (totalWeek - 36);
            } else {
                // If total <= 36, normally 0 payable OT from this week toward the grand total payable?
                // Wait, existing logic: 
                // Box 4 = (Total > 36 ? Total - 36 : 0). 
                // Grand Total Box 4 = Sum of Weekly Box 4s.
                // Correct.
            }

            tempDuty += weeklyDuty; // Just distinct duty sum
            tempOT += weeklyOT;     // Just distinct OT sum 

            weekStart = addDays(weekStart, 7);
        }

        return { totalDuty: tempDuty, totalOT: grandTotalOTHours, leaves: leaveList, totalAll: grandTotalAllHours };

    }, [shifts, startDate, endDate]);

    // Group Leaves
    const groupedLeaves = useMemo(() => {
        if (leaves.length === 0) return [];

        // Sort
        leaves.sort((a, b) => a.date - b.date);

        const groups = [];
        let currentGroup = { type: leaves[0].type, start: leaves[0].date, end: leaves[0].date, count: 1 };

        for (let i = 1; i < leaves.length; i++) {
            const leaf = leaves[i];
            const prev = leaves[i - 1];
            const diff = (leaf.date - prev.date) / (1000 * 60 * 60 * 24); // days

            if (diff === 1 && leaf.type === currentGroup.type) {
                currentGroup.end = leaf.date;
                currentGroup.count++;
            } else {
                groups.push(currentGroup);
                currentGroup = { type: leaf.type, start: leaf.date, end: leaf.date, count: 1 };
            }
        }
        groups.push(currentGroup);
        return groups;
    }, [leaves]);


    return (
        <div className="max-w-[210mm] mx-auto p-8 bg-white text-black min-h-screen">
            {/* Toolbar */}
            <div className="print:hidden flex justify-between items-center mb-8 border-b pb-4">
                <h1 className="text-xl font-bold">Cover Sheet</h1>
                <Button onClick={() => window.print()} className="gap-2">
                    <Printer className="w-4 h-4" /> Print
                </Button>
            </div>

            {/* Form Content - Approx matching the image structure */}
            <div className="space-y-6 font-serif">
                <div className="text-center font-bold text-lg border-b pb-2 mb-4">
                    අතිකාල සේවා සඳහා ගෙවීම් ඉල්ලීම <br />
                    <span className="text-sm font-normal text-muted-foreground uppercase tracking-wider">Request for Overtime Payment</span>
                </div>

                {/* Header Info */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">

                    <div className="col-span-2 flex items-baseline gap-2">
                        <span className="w-48">01. Name of Officer:</span>
                        <div className="flex-1 border-b border-black border-dotted px-2 font-bold">{profile?.name}</div>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="w-24">02. Grade:</span>
                        <div className="flex-1 border-b border-black border-dotted px-2">{profile?.grade}</div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="w-24">Ward:</span>
                        <div className="flex-1 border-b border-black border-dotted px-2">{profile?.institution}</div>
                    </div>

                    <div className="col-span-2 flex items-baseline gap-2">
                        <span className="w-48">03. Institution:</span>
                        <div className="flex-1 border-b border-black border-dotted px-2">National Hospital of Sri Lanka, Colombo</div>
                    </div>

                    <div className="col-span-2 flex items-baseline gap-2">
                        <span className="w-48">04. Salary Number:</span>
                        <div className="flex-1 border-b border-black border-dotted px-2">{profile?.salaryNumber}</div>
                    </div>

                    <div className="col-span-2 flex items-baseline gap-2">
                        <span className="w-48">05. Period:</span>
                        <div className="flex-1 border-b border-black border-dotted px-2">
                            From <b>{format(startDate, 'yyyy/MM/dd')}</b> To <b>{format(endDate, 'yyyy/MM/dd')}</b>
                        </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="w-40">06. Basic Monthly Salary:</span>
                        <div className="flex-1 border-b border-black border-dotted px-2 text-right">{profile?.basicSalary}</div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="w-40">07. OT Rate (Hourly):</span>
                        <div className="flex-1 border-b border-black border-dotted px-2 text-right">{profile?.otRate}</div>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="w-64">08. Total Duty Hours (Excl. OT):</span>
                        <div className="flex-1 border-b border-black border-dotted px-2 text-right">{totalDuty}</div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="w-40">Total Payable OT Hours:</span>
                        <div className="flex-1 border-b border-black border-dotted px-2 text-right font-bold text-lg">{totalOT}</div>
                    </div>
                </div>

                {/* Leave Table */}
                <div className="mt-6">
                    <div className="mb-2 font-bold text-sm">09. Leave Details during the period:</div>
                    <div className="border border-black">
                        <div className="grid grid-cols-2 divide-x divide-black">
                            {/* Left Column */}
                            <div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-black bg-gray-100">
                                            <th className="p-1 border-r border-black">Date Range</th>
                                            <th className="p-1">Days</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black">
                                        {groupedLeaves.map((leave, i) => (
                                            <tr key={i}>
                                                <td className="p-1 border-r border-black text-center">
                                                    {format(leave.start, 'yyyy/MM/dd')} {leave.count > 1 && `- ${format(leave.end, 'MM/dd')}`}
                                                    <span className="ml-2 text-xs">({leave.type})</span>
                                                </td>
                                                <td className="p-1 text-center font-bold">{leave.count}</td>
                                            </tr>
                                        ))}
                                        {groupedLeaves.length === 0 && (
                                            <tr><td colSpan={2} className="p-4 text-center text-muted-foreground">- No Leaves -</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Right Column (Placeholder or continuation?) The image shows 2 identical looking tables side by side or just one big one split. 
                                 I'll leave the right side empty or used for overflow if needed. For now just one main table is cleaner unless explicitly needing 2 columns.
                                 The image shows 2 sets of columns "From - To", "Days".
                             */}
                            <div>
                                <div className="h-full flex items-center justify-center text-xs text-muted-foreground p-4">
                                    (Additional Space)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Certifications */}
                <div className="mt-8 space-y-8 text-sm">
                    <p className="text-justify leading-relaxed">
                        I certify that the overtime hours calculated above and the leave details provided are correct.
                        I am aware that if any error or falsification is found after payment, the excess amount can be recovered from my salary
                        or disciplinary action can be taken against me.
                    </p>

                    <div className="flex justify-between items-end mt-8">
                        <div>
                            Date: ____________________
                        </div>
                        <div className="text-center">
                            ___________________________<br />
                            Signature of Applicant
                        </div>
                    </div>

                    <div className="border-t border-black pt-4 mt-4">
                        <p>
                            I certify that Mr/Mrs/Miss <b>{profile?.name}</b> was on duty from <b>{format(startDate, 'yyyy/MM/dd')}</b> to <b>{format(endDate, 'yyyy/MM/dd')}</b>
                            and the hours worked are correct as per the attendance register, and they are eligible for this overtime payment.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-16 mt-12">
                        <div>
                            <p className="text-xs text-muted-foreground mb-4">Checked by (Subject Clerk):</p>
                            <div className="border-b border-black border-dotted mb-1"></div>
                            <div className="text-center text-xs">Signature</div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-4">Recommended by (Head of Dept/Sister):</p>
                            <div className="border-b border-black border-dotted mb-1"></div>
                            <div className="text-center text-xs">Signature & Official Frank</div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <div className="w-1/2 mx-auto border-b border-black border-dotted mb-2"></div>
                        <p className="font-bold">Approved</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoverSheetPage;
