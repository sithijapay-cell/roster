import { PDFDocument, TextAlignment } from 'pdf-lib';
import { format } from 'date-fns';
import { calculateRosterStats } from '../utils/rosterCalculations';

const FONT_SIZE = 16;

export const generatePDF = async (profile, shifts, currentMonthDate) => {
    try {
        const existingPdfBytes = await fetch('/New_fillable_v3.pdf').then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();

        const { weeks, monthlyStats, startDate, endDate } = calculateRosterStats(shifts, currentMonthDate);

        // Helper to fill fields
        const fillField = (fieldName, value, { fontSize = FONT_SIZE, alignment = undefined } = {}) => {
            try {
                // SPECIAL HANDLING for MISSING/MISNAMED FIELDS in Template
                if (fieldName === 'week1_in7') {
                    const candidates = form.getFields().filter(f => f.getName() === 'week1_in6');
                    if (candidates.length >= 2) {
                        const field = candidates[1];
                        field.setFontSize(fontSize);
                        if (alignment !== undefined && typeof field.setAlignment === 'function') field.setAlignment(alignment);
                        if (typeof field.setText === 'function') field.setText(value);
                        return;
                    }
                }
                if (fieldName === 'week5_hrs5') {
                    const candidates = form.getFields().filter(f => f.getName() === 'week5_hrs3');
                    if (candidates.length >= 2) {
                        const field = candidates[1];
                        field.setFontSize(fontSize);
                        if (alignment !== undefined && typeof field.setAlignment === 'function') field.setAlignment(alignment);
                        if (typeof field.setText === 'function') field.setText(value);
                        return;
                    }
                }

                const matchingFields = form.getFields().filter(f => f.getName() === fieldName);
                if (matchingFields.length > 0) {
                    matchingFields.forEach(field => {
                        field.setFontSize(fontSize);
                        if (alignment !== undefined && typeof field.setAlignment === 'function') {
                            field.setAlignment(alignment);
                        }
                        if (typeof field.setText === 'function') {
                            field.setText(value);
                        }
                    });
                }
            } catch (err) { }
        };

        // 1. FILL HEADER DATA
        fillField('nurse_name', profile.name || '');
        fillField('grade', profile.grade || '');
        fillField('ward_number_name', profile.ward || '');
        fillField('basic_salary', profile.basicSalary || '');
        fillField('ot_rate_per_hour', profile.otRate || '');
        fillField('salary_number', profile.salaryNumber || ''); // Attempt to fill if exists

        // Dates
        fillField('start_year_month1', format(startDate, 'yy/MM'));
        fillField('Month_Start_date2', format(startDate, 'dd'));
        fillField('start_date1', format(startDate, 'yyyy/MM/dd'));
        fillField('start_YY_MM1', format(startDate, 'yy/MM'));
        fillField('start_DD1', format(startDate, 'dd'));

        // Month_Start_YY_MM_DD2: decrease font size (9pt) and center align
        fillField('Month_Start_YY_MM_DD2', format(startDate, 'yy/MM/dd'), { fontSize: 9, alignment: TextAlignment.Center });

        fillField('end_year_month1', format(endDate, 'yy/MM'));
        fillField('Month_end_date2', format(endDate, 'dd'));
        fillField('Month_end_year_month2', format(endDate, 'yy/MM'));
        fillField('end_date1', format(endDate, 'yyyy/MM/dd'));
        fillField('end_YY_MM1', format(endDate, 'yy/MM'));
        fillField('end_DD1', format(endDate, 'dd'));
        fillField('Month_end_YY_MM2', format(endDate, 'yy/MM'));
        fillField('Month_end_DD2', format(endDate, 'dd'));

        fillField('date_form_downloaded', format(new Date(), 'yyyy/MM/dd'));

        // Table Dates
        // start_year_month_date3 & end_year_month_date3: Center align
        fillField('start_year_month_date3', format(startDate, 'yy/MM/dd'), { alignment: TextAlignment.Center });
        fillField('end_year_month_date3', format(endDate, 'yy/MM/dd'), { alignment: TextAlignment.Center });

        fillField('start_year_month_date4', format(startDate, 'yy/MM/dd'));
        fillField('end_year_month_date4', format(endDate, 'yy/MM/dd'));
        fillField('date_submitted', format(endDate, 'yy/MM/dd'));

        // 2. FILL LEAVE DATA
        const leaves = [];
        const dateIterator = new Date(startDate);
        while (dateIterator <= endDate) {
            const dateStr = format(dateIterator, 'yyyy-MM-dd');
            const data = shifts[dateStr];

            // Check Explicit Types - CL, VL, PH, PH_LEAVE (displayed as PH)
            if (data?.type && ['CL', 'VL', 'PH', 'PH_LEAVE'].includes(data.type)) {
                leaves.push({ date: dateStr, type: data.type === 'PH_LEAVE' ? 'PH' : data.type });
            }

            dateIterator.setDate(dateIterator.getDate() + 1);
        }

        leaves.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Page 1 (1-7)
        for (let i = 0; i < 7; i++) {
            if (leaves[i]) {
                fillField(`CL_date${i + 1}`, format(new Date(leaves[i].date), 'yyyy/MM/dd'));
                fillField(`cl_type${i + 1}`, leaves[i].type);
                fillField(`no_of_dates${i + 1}`, "1");
            }
        }
        // Page 2 (8-14)
        for (let i = 7; i < 14; i++) {
            if (leaves[i]) {
                const num = i + 1;
                fillField(`CL_date${num}`, format(new Date(leaves[i].date), 'yyyy/MM/dd'));
                fillField(`cl_type${num}`, leaves[i].type);
                fillField(`no_of_dates${num}`, "1");
            }
        }
        if (leaves.length > 0) {
            fillField('total_leaves1', leaves.length.toString());
            fillField('total_leaves2', leaves.length.toString());
        }

        // 3. FILL TABLE DATA FROM CALCULATED STATS
        weeks.forEach((week, wIndex) => {
            const weekNum = wIndex + 1;

            week.days.forEach((day, dIndex) => {
                const dayNum = dIndex + 1;
                fillField(`week${weekNum}_date${dayNum}`, format(day.date, 'MM/dd'));

                if (day.dutyIn) fillField(`week${weekNum}_in${dayNum}`, day.dutyIn === 'PH_LEAVE' ? 'PH' : day.dutyIn);
                if (day.dutyOut) fillField(`week${weekNum}_out${dayNum}`, day.dutyOut);
                if (day.dutyHrs) fillField(`week${weekNum}_hrs${dayNum}`, day.dutyHrs);

                if (day.otIn) fillField(`week${weekNum}_ot_in${dayNum}`, day.otIn);
                if (day.otOut) fillField(`week${weekNum}_ot_out${dayNum}`, day.otOut);
                if (day.reason) fillField(`week${weekNum}_reason${dayNum}`, day.reason);
                if (day.otHrs) fillField(`week${weekNum}_ot_hrs${dayNum}`, day.otHrs);
            });

            // Weekly Totals
            if (week.stats.box3 > 0) {
                fillField(`week${weekNum}_total_duty`, `${week.stats.box1}H`);
                if (week.stats.box2 > 0) fillField(`week${weekNum}_total_ot`, `${week.stats.box2}H`);
                fillField(`week${weekNum}_total_hours`, `${week.stats.box3}H`);
                if (week.stats.box4 > 0) fillField(`week${weekNum}_total_ot_calc`, week.stats.box4.toString());
            }
        });

        // Grand Totals
        fillField('grand_total_hours', `${monthlyStats.box3}H`);
        fillField('grand_total_ot_calc', `${monthlyStats.box4}H`);

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;

    } catch (error) {
        console.error("PDF Generation failed:", error);
        throw error; // Re-throw to handle in UI
    }
};
