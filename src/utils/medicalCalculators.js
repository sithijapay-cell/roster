/**
 * Medical Calculation Logic
 * Pure functions for offline use.
 */

/**
 * Calculate IV Drip Rate
 * Formula: (Volume (ml) × Drop Factor (gtt/ml)) / Time (minutes)
 * @param {number|string} volume - Volume in ml
 * @param {number|string} hours - Duration in hours
 * @param {number|string} minutes - Duration in minutes
 * @param {number|string} dropFactor - Drops per ml (gtt/ml)
 * @returns {number} - Flow rate in drops per minute (gtt/min), 0 on invalid input
 */
export const calculateIVRate = (volume, hours, minutes, dropFactor) => {
    const vol = Number(volume) || 0;
    const hrs = Number(hours) || 0;
    const mins = Number(minutes) || 0;
    const df = Number(dropFactor) || 0;

    const totalMinutes = (hrs * 60) + mins;
    if (totalMinutes <= 0 || vol <= 0 || df <= 0) return 0;

    const rate = (vol * df) / totalMinutes;
    return Math.round(rate); // Round to nearest whole drop
};

/**
 * Calculate BMI (Body Mass Index)
 * Formula: Weight (kg) / (Height (m))²
 * @param {number|string} weight - Weight in kg
 * @param {number|string} heightCm - Height in cm
 * @returns {object|null} - { value: number, category: string }
 */
export const calculateBMI = (weight, heightCm) => {
    const w = Number(weight) || 0;
    const h = Number(heightCm) || 0;
    if (w <= 0 || h <= 0) return null;

    const heightM = h / 100;
    const bmi = w / (heightM * heightM);
    const value = parseFloat(bmi.toFixed(1));

    let category = '';
    if (value < 18.5) category = 'Underweight';
    else if (value < 25) category = 'Normal';
    else if (value < 30) category = 'Overweight';
    else category = 'Obese';

    return { value, category };
};

/**
 * Calculate BSA (Body Surface Area) — DuBois Formula
 * Formula: BSA = 0.007184 × Weight(kg)^0.425 × Height(cm)^0.725
 * @param {number|string} weight - Weight in kg
 * @param {number|string} heightCm - Height in cm
 * @returns {number|null} - BSA in m²
 */
export const calculateBSA = (weight, heightCm) => {
    const w = Number(weight) || 0;
    const h = Number(heightCm) || 0;
    if (w <= 0 || h <= 0) return null;

    const bsa = 0.007184 * Math.pow(w, 0.425) * Math.pow(h, 0.725);
    return parseFloat(bsa.toFixed(2));
};

/**
 * Calculate MAP (Mean Arterial Pressure)
 * Formula: (SBP + 2 * DBP) / 3
 * @param {number|string} sbp - Systolic BP
 * @param {number|string} dbp - Diastolic BP
 * @returns {number|null} - MAP in mmHg
 */
export const calculateMAP = (sbp, dbp) => {
    const s = Number(sbp);
    const d = Number(dbp);
    if (!s || !d || s <= 0 || d <= 0) return null;

    const map = (s + (2 * d)) / 3;
    return Math.round(map);
};

// GCS Data Structure
export const GCS_SCALES = {
    eye: [
        { score: 4, label: "Spontaneously" },
        { score: 3, label: "To Speech" },
        { score: 2, label: "To Pain" },
        { score: 1, label: "None" }
    ],
    verbal: [
        { score: 5, label: "Oriented" },
        { score: 4, label: "Confused" },
        { score: 3, label: "Inappropriate Words" },
        { score: 2, label: "Incomprehensible Sounds" },
        { score: 1, label: "None" }
    ],
    motor: [
        { score: 6, label: "Obeys Commands" },
        { score: 5, label: "Localizes Pain" },
        { score: 4, label: "Withdraws from Pain" },
        { score: 3, label: "Flexion (Decorticate)" },
        { score: 2, label: "Extension (Decerebrate)" },
        { score: 1, label: "None" }
    ]
};
