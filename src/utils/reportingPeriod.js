import { startOfMonth, startOfWeek, addMonths, subDays } from 'date-fns';

export function getReportingPeriod(currentDate) {
    // Reporting Period Rule (Based on User Input):
    // Start Date: The Sunday of the week containing the 1st of the month.
    // End Date: The Saturday before the start of the NEXT month's period.

    const monthStart = startOfMonth(currentDate);
    // Sunday of the week containing the 1st
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // 0 = Sunday

    // Calculate End Date by finding the start of the next month's period
    const nextMonth = addMonths(currentDate, 1);
    const nextMonthStart = startOfWeek(startOfMonth(nextMonth), { weekStartsOn: 0 });
    const endDate = subDays(nextMonthStart, 1);

    return { startDate, endDate };
}
