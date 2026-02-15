/**
 * Medical Calculation Logic
 * Pure functions for offline use.
 */

/**
 * Calculate IV Drip Rate
 * Formula: (Volume (ml) * Drop Factor (gtt/ml)) / Time (minutes)
 * @param {number} volume - Volume in ml
 * @param {number} hours - Duration in hours
 * @param {number} minutes - Duration in minutes
 * @param {number} dropFactor - Drops per ml (gtt/ml)
 * @returns {string} - Flow rate in drops per minute (gtt/min)
 */
export const calculateIVRate = (volume, hours, minutes, dropFactor) => {
    const totalMinutes = (Number(hours) * 60) + Number(minutes);
    if (totalMinutes <= 0 || volume <= 0 || dropFactor <= 0) return 0;

    const rate = (volume * dropFactor) / totalMinutes;
    return Math.round(rate); // Round to nearest whole drop
};

/**
 * Calculate BMI (Body Mass Index)
 * Formula: Weight (kg) / (Height (m))^2
 * @param {number} weight - Weight in kg
 * @param {number} heightCm - Height in cm
 * @returns {object} - { value: number, category: string }
 */
export const calculateBMI = (weight, heightCm) => {
    if (weight <= 0 || heightCm <= 0) return null;

    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    const value = parseFloat(bmi.toFixed(1));

    let category = '';
    if (value < 18.5) category = 'Underweight';
    else if (value < 25) category = 'Normal';
    else if (value < 30) category = 'Overweight';
    else category = 'Obese';

    return { value, category };
};

/**
 * Calculate BSA (Body Surface Area)
 * Formula: Mosteller = sqrt((Height (cm) * Weight (kg)) / 3600)
 * @param {number} weight - Weight in kg
 * @param {number} heightCm - Height in cm
 * @returns {string} - BSA in m²
 */
export const calculateBSA = (weight, heightCm) => {
    if (weight <= 0 || heightCm <= 0) return null;

    const bsa = Math.sqrt((weight * heightCm) / 3600);
    return parseFloat(bsa.toFixed(2));
};
