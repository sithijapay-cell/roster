import { format, addDays, getDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { getReportingPeriod } from './reportingPeriod';

// Shift Time Mappings (Source of Truth)
export const SHIFT_TIMES = {
    M: { start: "7H", end: "13H" },
    E: { start: "13H", end: "19H" },
    DN: { start: "19H", end: "7H" },
    // OT variants
    OTM: { start: "7H", end: "13H" },
    OTE: { start: "13H", end: "19H" },
    OTN: { start: "19H", end: "7H" },
    // SD / Others
    SD: { start: "SD", end: "" },
    CL: { start: "CL", end: "" },
    PH: { start: "PH", end: "" },
    DO: { start: "DO", end: "" },
    VL: { start: "VL", end: "" }
};

// Helper to parse "07:00H" or "19:00" strings to hours
export function calculateHours(startStr, endStr) {
    if (!startStr || !endStr) return 0;
    if (startStr === "SD" || startStr === "CL" || startStr === "PH" || startStr === "DO" || startStr === "VL") return 0;

    // Parse time strings like "07:00H" or "19:00"
    const parseTime = (timeStr) => {
        const clean = timeStr.replace(/[Hh]/g, '').trim();
        const [hours, minutes] = clean.split(':').map(Number);
        return (hours || 0) + (minutes || 0) / 60;
    };

    const start = parseTime(startStr);
    const end = parseTime(endStr);

    let duration = end - start;
    if (duration < 0) duration += 24; // Handle overnight wrap

    return duration;
}

export const calculateRosterStats = (shifts, currentMonthDate) => {
    const { startDate, endDate } = getReportingPeriod(currentMonthDate);
    const weeks = [];

    // Logic to track Sleeping Day (SD) logic requires lookback
    // SD is only after Duty Night (DN). OT Night (OTN) does not trigger SD entitlement.
    let prevDayWasNight = false;
    // Check day before start
    const dayBeforeStart = addDays(startDate, -1);
    const prevKey = format(dayBeforeStart, 'yyyy-MM-dd');
    if (shifts[prevKey]?.shifts?.includes('DN')) {
        prevDayWasNight = true;
    }

    let current = new Date(startDate);
    let weekIndex = 0;

    while (current <= endDate && weekIndex < 5) {
        const weekDays = [];
        let weekTotalDuty = 0;
        let weekTotalOT = 0;
        let weekTotalHours = 0;

        for (let i = 0; i < 7; i++) {
            if (current > endDate) break; // Should not happen if chunks are aligned but safety

            const dateKey = format(current, 'yyyy-MM-dd');
            const shiftData = shifts[dateKey] || { shifts: [], type: null };

            const dayResult = {
                date: new Date(current),
                dutyIn: '',
                dutyOut: '',
                dutyHrs: '',
                otIn: '',
                otOut: '',
                otHrs: '',
                reason: '',
                isSD: false,
                rawDuty: 0,
                rawOT: 0
            };

            // Determine if today is Sleeping Day (SD)
            const isSleepingDay = prevDayWasNight;
            const currentDayIsNight = shiftData.shifts && shiftData.shifts.includes('DN');
            dayResult.isSD = isSleepingDay;

            let activeShifts = [...(shiftData.shifts || [])];

            // Apply SD Rule: Regular shifts become OT
            if (isSleepingDay) {
                activeShifts = activeShifts.map(s => {
                    if (s === 'M') return 'OTM';
                    if (s === 'E') return 'OTE';
                    if (s === 'DN') return 'OTN';
                    return s;
                });

                // If it's an SD, we want to label it 'SD' in Duty In column if there is no regular duty.
                // Even if there is OT (e.g. OTN), the Duty column should say SD.
                const hasDutyShift = activeShifts.some(s => ['M', 'E', 'DN'].includes(s)); // Note M/E/DN already mapped to OT variants above if simply isSleepingDay? 
                // Wait, if moved to OTM/OTE/OTN, they are no longer M/E/DN in activeShifts array.
                // But the MAPPING happens above.
                // If I had 'M', it became 'OTM'. 
                // So if activeShifts has OTM, it WAS a duty shift.
                // BUT, if the user explicitly wants "SD" displayed?
                // If I work OTM (converted from M), do I show "SD" or "07:00"?
                // Standard roster practice: If I work, I show Time.
                // If I DON'T work Duty, I show SD.
                // The issue: "only thing to be added is SD name only".
                // If I work OTN on SD. activeShifts = ['OTN'].
                // Original code: if (length === 0 ...). length is 1. So 'SD' not shown.
                // Fix: Show 'SD' if NOT mapped from Duty?
                // OTN is pure OT. It wasn't mapped from DN (DN -> OTN yes, but user entered OTN directly).
                // Let's check original shifts?

                const originalShifts = shiftData.shifts || [];
                const hasOriginalDuty = originalShifts.some(s => ['M', 'E', 'DN'].includes(s));

                if (!hasOriginalDuty && !['CL', 'VL', 'PH', 'DO'].includes(shiftData.type)) {
                    dayResult.dutyIn = 'SD';
                }
            }

            // Process Shifts
            if (activeShifts.length > 0) {
                // Priority: Duty first (M, E, DN)
                const dutyShiftCode = activeShifts.find(s => ['M', 'E', 'DN'].includes(s));
                const otShiftCode = activeShifts.find(s => ['OTM', 'OTE', 'OTN'].includes(s));

                if (dutyShiftCode) {
                    const times = SHIFT_TIMES[dutyShiftCode];
                    if (times) {
                        dayResult.dutyIn = times.start;
                        dayResult.dutyOut = times.end;
                        const dur = calculateHours(times.start, times.end);
                        if (dur > 0) {
                            dayResult.dutyHrs = `${dur}H`;
                            dayResult.rawDuty += dur;
                            weekTotalDuty += dur;
                        }
                    }
                }

                if (otShiftCode) {
                    const times = SHIFT_TIMES[otShiftCode];
                    if (times) {
                        dayResult.otIn = times.start;
                        dayResult.otOut = times.end;
                        dayResult.reason = "Essential for duty";
                        const dur = calculateHours(times.start, times.end);
                        if (dur > 0) {
                            dayResult.otHrs = `${dur}H`;
                            dayResult.rawOT += dur;
                            weekTotalOT += dur; // Pure OT count
                            weekTotalHours += dur; // OT adds to total hours
                        }
                    }
                }
            } else if (shiftData.type === 'CL' || shiftData.type === 'VL') {
                dayResult.dutyIn = shiftData.type;
                dayResult.dutyHrs = "6H";
                weekTotalDuty += 6;
                // Note: Leaves do NOT add to weekTotalHours in terms of working hours usually?
                // But PDF logic says: `weekTotalDuty += 6`.
                // And `weekTotalHours += weekTotalDuty`.
                // So YES, leaves count towards "Total Hours" (Box 3) and thus "Payable" (Box 4) if threshold met.
            } else if (shiftData.type === 'PH') {
                dayResult.dutyIn = "PH";
            } else if (shiftData.type === 'DO') {
                dayResult.dutyIn = "DO";
            } else if (shiftData.type === 'SD') {
                dayResult.dutyIn = "SD";
            }

            // Updates
            prevDayWasNight = currentDayIsNight;
            weekDays.push(dayResult);
            current = addDays(current, 1);
        }

        // Weekly Totals
        // Note `weekTotalHours` currently only includes OT.
        // We need to add Duty to it.
        weekTotalHours += weekTotalDuty;

        const weekOTCalc = Math.max(0, weekTotalHours - 36);

        weeks.push({
            days: weekDays,
            stats: {
                box1: weekTotalDuty,
                box2: weekTotalOT,
                box3: weekTotalHours,
                box4: weekOTCalc
            },
            label: `Week ${weekIndex + 1}`,
            range: `${format(weekDays[0].date, 'd MMM')} - ${format(weekDays[weekDays.length - 1].date, 'd MMM')}`
        });

        weekIndex++;
    }

    // Monthly Totals
    const monthlyStats = weeks.reduce((acc, week) => ({
        box1: acc.box1 + week.stats.box1,
        box2: acc.box2 + week.stats.box2,
        box3: acc.box3 + week.stats.box3,
        box4: acc.box4 + week.stats.box4
    }), { box1: 0, box2: 0, box3: 0, box4: 0 });

    return { weeks, monthlyStats, startDate, endDate };
};
