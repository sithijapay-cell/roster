const { pool } = require('../config/db');
const { calculateRosterStats } = require('../utils/rosterCalculations');

// Get Nurse Profile
exports.getProfile = async (req, res) => {
    try {
        const profile = await pool.query('SELECT * FROM nurses WHERE user_id = $1', [req.user.id]);
        if (profile.rows.length === 0) {
            return res.json({});
        }
        res.json(profile.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update Nurse Profile
exports.updateProfile = async (req, res) => {
    const { name, grade, designation, institution, ward, salary_number, basic_salary, ot_rate } = req.body;
    try {
        // Upsert Profile
        const query = `
            INSERT INTO nurses (user_id, name, grade, designation, institution, ward, salary_number, basic_salary, ot_rate)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                name = EXCLUDED.name,
                grade = EXCLUDED.grade,
                designation = EXCLUDED.designation,
                institution = EXCLUDED.institution,
                ward = EXCLUDED.ward,
                salary_number = EXCLUDED.salary_number,
                basic_salary = EXCLUDED.basic_salary,
                ot_rate = EXCLUDED.ot_rate
            RETURNING *;
        `;
        const values = [req.user.id, name, grade, designation, institution, ward, salary_number, basic_salary, ot_rate];
        const newProfile = await pool.query(query, values);
        res.json(newProfile.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Shifts
exports.getShifts = async (req, res) => {
    try {
        const shifts = await pool.query('SELECT date, shifts, type FROM shifts WHERE nurse_id = (SELECT id FROM nurses WHERE user_id = $1)', [req.user.id]);

        // Transform to object format expected by frontend: { "YYYY-MM-DD": { shifts: [], type: "" } }
        const shiftsMap = {};
        shifts.rows.forEach(row => {
            const dateKey = row.date.toISOString().split('T')[0];
            shiftsMap[dateKey] = {
                shifts: row.shifts,
                type: row.type
            };
        });

        res.json(shiftsMap);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Add/Update Shift
exports.updateShift = async (req, res) => {
    const { date, shifts, type } = req.body; // date: "YYYY-MM-DD", shifts: ["M"], type: "DO"
    try {
        const nurse = await pool.query('SELECT id FROM nurses WHERE user_id = $1', [req.user.id]);
        if (nurse.rows.length === 0) return res.status(404).json({ msg: 'Nurse profile not found' });

        const nurseId = nurse.rows[0].id;

        const query = `
            INSERT INTO shifts (nurse_id, date, shifts, type)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (nurse_id, date)
            DO UPDATE SET shifts = EXCLUDED.shifts, type = EXCLUDED.type
            RETURNING *;
        `;
        const updatedShift = await pool.query(query, [nurseId, date, JSON.stringify(shifts), type]);
        res.json(updatedShift.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Remove Shift
exports.deleteShift = async (req, res) => {
    const { date } = req.params;
    try {
        const nurse = await pool.query('SELECT id FROM nurses WHERE user_id = $1', [req.user.id]);
        if (nurse.rows.length === 0) return res.status(404).json({ msg: 'Nurse profile not found' });

        await pool.query('DELETE FROM shifts WHERE nurse_id = $1 AND date = $2', [nurse.rows[0].id, date]);
        res.json({ msg: 'Shift removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Calculate OT (Protected Endpoint using Lifted Logic)
exports.calculateOT = async (req, res) => {
    // Expects { shifts: { "2024-02-01": ... }, currentMonthDate: "2024-02-01" }
    // Or it could fetch data from DB. Prompt says "Wrap my original OT calculation code... frontend remains 'thin'".
    // So frontend sends request, backend calculates.
    // Better to fetch data from DB here to be truly secure/thin?
    // "returns data in the exact JSON format my current frontend functions expect"

    // Let's implement it such that it takes potential local state or fetches from DB.
    // Ideally, for a thin client, we fetch from DB.

    try {
        const { currentMonthDate } = req.body;

        // Fetch all shifts for user
        // Optimization: Fetch only relevant range? calculateRosterStats handles logic, wants all shifts dict.
        // Let's fetch all for simplicity of the port, or ideally filter by range.

        const shiftsResult = await pool.query('SELECT date, shifts, type FROM shifts WHERE nurse_id = (SELECT id FROM nurses WHERE user_id = $1)', [req.user.id]);

        const shiftsMap = {};
        shiftsResult.rows.forEach(row => {
            const dateKey = row.date.toISOString().split('T')[0];
            shiftsMap[dateKey] = {
                shifts: row.shifts,
                type: row.type
            };
        });

        const stats = calculateRosterStats(shiftsMap, currentMonthDate);
        res.json(stats);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
