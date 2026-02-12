import { addDays, subDays, isSameDay, parseISO } from 'date-fns';

export const SHIFT_TYPES = {
    M: { label: "Morning", code: "M", hours: 6, ot: 0, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    E: { label: "Evening", code: "E", hours: 6, ot: 0, color: "bg-orange-100 text-orange-800 border-orange-200" },
    DN: { label: "Duty Night", code: "DN", hours: 6, ot: 6, color: "bg-blue-100 text-blue-800 border-blue-200" },
    OTN: { label: "OT Night", code: "OTN", hours: 0, ot: 12, color: "bg-purple-100 text-purple-800 border-purple-200" },
    OTM: { label: "OT Morning", code: "OTM", hours: 0, ot: 6, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    OTE: { label: "OT Evening", code: "OTE", hours: 0, ot: 6, color: "bg-orange-100 text-orange-800 border-orange-200" },
    "12D": { label: "12H Day", code: "12D", hours: 6, ot: 6, color: "bg-teal-100 text-teal-800 border-teal-200" },
};

export const DAY_TYPES = {
    DO: { label: "Day Off", code: "DO", color: "bg-green-100 text-green-800 border-green-200" },
    PH: { label: "Public Holiday", code: "PH", color: "bg-red-100 text-red-800 border-red-200" },
    CL: { label: "Casual Leave", code: "CL", color: "bg-gray-100 text-gray-800 border-gray-200" },
    SD: { label: "Sleeping Day", code: "SD", color: "bg-indigo-50 text-indigo-700 border-indigo-200" }, // Auto set after DN
};

// Check if a day has a specific shift type
export const hasShift = (dayData, shiftCode) => {
    return dayData?.shifts?.includes(shiftCode);
};

// Check if a day has a specific day type
export const isDayType = (dayData, typeCode) => {
    return dayData?.type === typeCode;
};

export const validateShiftAddition = (dateStr, shiftCode, currentShifts, allShifts) => {
    const dayData = allShifts[dateStr] || { shifts: [], type: null };

    // Rule: Cannot log shifts on Casual Leave
    if (dayData.type === 'CL') {
        return { valid: false, message: "Cannot add shifts on Casual Leave." };
    }

    // Rule: Prohibit more than one night shift (DN or OTN) on same day? 
    // "It prohibits logging more than one night shift on the same day."
    // Assuming DN and OTN are arguably night shifts. Or maybe two DNs?
    // Let's assume one "Night" per day.
    const isNight = ['DN', 'OTN'].includes(shiftCode);
    if (isNight && (dayData.shifts.includes('DN') || dayData.shifts.includes('OTN'))) {
        return { valid: false, message: "Cannot have multiple night shifts on the same day." };
    }

    // Rule: OT Night can only be added if a regular duty shift has already been logged?
    // "ensure an OT Night can only be added if a regular duty shift has already been logged on that day"
    // Wait, usually OTN is standalone? Or maybe cover?
    // "12 overtime hours" suggests it's a full shift.
    // The requirement says: "ensure an OT Night can only be added if a regular duty shift has already been logged on that day."
    // This implies OTN is double duty? OR maybe they meant "Cannot be sole shift"?
    // Let's implement literally.
    if (shiftCode === 'OTN' && dayData.shifts.length === 0) {
        return { valid: false, message: "OT Night requires a regular duty shift first." };
    }

    // Fatigue Rule: prevent two OT Nights consecutively.
    if (shiftCode === 'OTN') {
        // Check previous day
        const prevDate = subDays(parseISO(dateStr), 1).toISOString().split('T')[0];
        const prevData = allShifts[prevDate];
        if (prevData && prevData.shifts && prevData.shifts.includes('OTN')) {
            return { valid: false, message: "Fatigue Rule: Cannot work OT Night for two consecutive days." };
        }
        // Check next day (if editing past)? Usually validation happens on entry.
        // If next day already has OTN, this addition might be invalid too.
        const nextDate = addDays(parseISO(dateStr), 1).toISOString().split('T')[0];
        const nextData = allShifts[nextDate];
        if (nextData && nextData.shifts && nextData.shifts.includes('OTN')) {
            return { valid: false, message: "Fatigue Rule: Cannot work OT Night for two consecutive days." };
        }
    }

    return { valid: true };
};

export const getDayColor = (dayData) => {
    if (!dayData) return "";
    if (dayData.type) {
        return DAY_TYPES[dayData.type]?.color || "";
    }
    // If shifts exist, maybe mix? Or just show list.
    // Calendar likely shows pills.
    return "";
};
