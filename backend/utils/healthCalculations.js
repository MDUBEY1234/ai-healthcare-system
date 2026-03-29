// utils/healthCalculations.js

/**
 * Calculates Body Mass Index (BMI).
 * @param {number} weight - Weight in kilograms (kg).
 * @param {number} height - Height in centimeters (cm).
 * @returns {object} An object containing the BMI value and its corresponding category.
 */
exports.calculateBMI = (weight, height) => {
    if (height <= 0 || weight <= 0) {
        return { bmi: 0, category: 'Invalid input' };
    }

    // Convert height from cm to meters for the formula
    const heightInMeters = height / 100;
    
    // BMI formula: weight(kg) / (height(m))^2
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));

    let category;
    if (bmi < 18.5) {
        category = 'Underweight';
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        category = 'Normal weight';
    } else if (bmi >= 25 && bmi <= 29.9) {
        category = 'Overweight';
    } else {
        category = 'Obese';
    }

    return { bmi, category };
};

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 * @param {number} weight - Weight in kilograms (kg).
 * @param {number} height - Height in centimeters (cm).
 * @param {number} age - Age in years.
 * @param {string} gender - "male" or "female".
 * @returns {number} The calculated BMR value in calories/day.
 */
exports.calculateBMR = (weight, height, age, gender) => {
    if (weight <= 0 || height <= 0 || age <= 0) {
        return 0;
    }

    let bmr;
    
    // Formula for men: BMR = 88.362 + (13.397 × weight) + (4.799 × height) - (5.677 × age)
    if (gender.toLowerCase() === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } 
    // Formula for women: BMR = 447.593 + (9.247 × weight) + (3.098 × height) - (4.330 × age)
    else if (gender.toLowerCase() === 'female') {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    } else {
        // Return 0 or handle as an error if gender is not specified correctly
        return 0;
    }
    
    // BMR is typically rounded to the nearest whole number
    return Math.round(bmr);
};