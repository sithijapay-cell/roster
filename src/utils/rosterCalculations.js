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
    PH_LEAVE: { start: "PH_LEAVE", end: "" },
    DO: { start: "DO", end: "" },
    VL: { start: "VL", end: "" }
};

// Helper to parse "07:00H" or "19:00" strings to hours
export function calculateHours(startStr, endStr) {
    if (!startStr || !endStr) return 0;
    if (startStr === "SD" || startStr === "CL" || startStr === "PH" || startStr === "PH_LEAVE" || startStr === "DO" || startStr === "VL") return 0;

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

// Helper to get formatted start/end and duration for a single shift
export function calculateShiftDuration(code, customEndTimes = {}, customStartTimes = {}, date = new Date()) {
    if (!code || !SHIFT_TIMES[code]) return { start: '-', end: '-', duration: 0 };

    const defaultTimes = SHIFT_TIMES[code];
    let startStr = defaultTimes.start;
    let endStr = defaultTimes.end;

    // Apply strict overrides if available
    if (customStartTimes[code]) startStr = customStartTimes[code];
    if (customEndTimes[code]) endStr = customEndTimes[code];

    // Special cases
    if (code === 'OFF' || code === 'PH' || code === 'PH_LEAVE' || code === 'SD' || code === 'DO' || code === 'CL' || code === 'VL') {
        return { start: startStr, end: '-', duration: 0 };
    }

    const duration = calculateHours(startStr, endStr);
    return {
        start: startStr,
        end: endStr,
        duration: duration % 1 === 0 ? duration : duration.toFixed(1)
    };
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
    let prevData = shifts[prevKey];

    // Normalize prevData
    if (typeof prevData === 'string') prevData = { shifts: [prevData], type: null };

    if (prevData?.shifts && Array.isArray(prevData.shifts) && prevData.shifts.includes('DN')) {
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
            let shiftData = shifts[dateKey];

            // Normalize shiftData
            if (typeof shiftData === 'string') {
                shiftData = { shifts: [shiftData], type: null };
            } else if (!shiftData) {
                shiftData = { shifts: [], type: null };
            }

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
            const currentShifts = Array.isArray(shiftData.shifts) ? shiftData.shifts : [];
            const currentDayIsNight = currentShifts.includes('DN');
            dayResult.isSD = isSleepingDay;

            let activeShifts = [...currentShifts];

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
                // Since M/E/DN are already mapped to OTM/OTE/OTN, hasDutyShift will be false here for those.
                // So checking activeShifts for M/E/DN checks if any *new* unmapped duty appeared (unlikely).

                // We check original shifts to see if user *intended* to work.
                const originalShifts = shiftData.shifts || [];
                const hasOriginalDuty = originalShifts.some(s => ['M', 'E', 'DN'].includes(s));

                // FIX: User wants 'SD' to appear even if they worked OT (converted from Duty).
                // If the Duty column is otherwise going to be empty (because duty moved to OT column),
                // we should fill it with 'SD'.
                // If hasOriginalDuty is true, activeShifts has OTM/OTE. DutyIn is not set by Process Shifts block.
                // So we CAN set 'SD' here safely.

                if (!['CL', 'VL', 'PH', 'DO'].includes(shiftData.type)) {
                    // Check if 'Process Shifts' will overwrite DutyIn?
                    // Process Shifts overwrites if `dutyShiftCode` found.
                    // `dutyShiftCode` looks for M/E/DN in activeShifts.
                    // Since we mapped M->OTM, `dutyShiftCode` will be undefined.
                    // So Process Shifts will NOT overwrite DutyIn.
                    // Thus, setting it to 'SD' here is safe and correct.
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
                        // Flexible Start Time
                        let actualStart = times.start;
                        if (shiftData.customStartTimes && shiftData.customStartTimes[otShiftCode]) {
                            actualStart = shiftData.customStartTimes[otShiftCode];
                        }
                        dayResult.otIn = actualStart;

                        // Flexible End Time
                        let actualEnd = times.end;
                        // Use shiftData.customEndTimes if available for this specific OT code
                        if (shiftData.customEndTimes && shiftData.customEndTimes[otShiftCode]) {
                            actualEnd = shiftData.customEndTimes[otShiftCode];
                        }

                        dayResult.otOut = actualEnd;
                        dayResult.reason = "Essential for duty";

                        // Calculate duration with dynamic start/end times
                        const dur = calculateHours(actualStart, actualEnd);
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
            } else if (shiftData.type === 'PH_LEAVE') {
                // PH (Leave): counts as 6H normal duty
                dayResult.dutyIn = "PH_LEAVE";
                dayResult.dutyHrs = "6H";
                weekTotalDuty += 6;
            } else if (shiftData.type === 'PH') {
                // Public Holiday: label only, no hour calculation
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
