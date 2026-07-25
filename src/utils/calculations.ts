import { ActivityLevel, UnitSystem } from '../types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little or no exercise)',
  light: 'Light (exercise 1-3 days/week)',
  moderate: 'Moderate (exercise 3-5 days/week)',
  active: 'Active (exercise 6-7 days/week)',
};

export const MIN_SAFE_CALORIES = 1200;
const WEEKLY_LOSS_KG_TARGET = 0.5;
const DAILY_DEFICIT = 500;

export function kgToLb(kg: number): number {
  return kg * 2.20462;
}

export function lbToKg(lb: number): number {
  return lb / 2.20462;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

export function formatWeight(kg: number, units: UnitSystem): string {
  if (units === 'imperial') return `${kgToLb(kg).toFixed(1)} lb`;
  return `${kg.toFixed(1)} kg`;
}

export function formatHeight(cm: number, units: UnitSystem): string {
  if (units === 'imperial') {
    const { feet, inches } = cmToFeetInches(cm);
    return `${feet}'${inches}"`;
  }
  return `${Math.round(cm)} cm`;
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  if (heightM <= 0) return 0;
  return weightKg / (heightM * heightM);
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy range';
  if (bmi < 30) return 'Overweight';
  return 'Obesity';
}

// Mifflin-St Jeor equation for women
export function calculateBMR(weightKg: number, heightCm: number, age: number): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

export function calculateDailyCalorieTarget(
  weightKg: number,
  heightCm: number,
  age: number,
  activityLevel: ActivityLevel
): number {
  const bmr = calculateBMR(weightKg, heightCm, age);
  const tdee = calculateTDEE(bmr, activityLevel);
  const target = tdee - DAILY_DEFICIT;
  return Math.round(Math.max(MIN_SAFE_CALORIES, target));
}

export function estimatedWeeksToGoal(currentWeightKg: number, goalWeightKg: number): number {
  const diff = currentWeightKg - goalWeightKg;
  if (diff <= 0) return 0;
  return Math.ceil(diff / WEEKLY_LOSS_KG_TARGET);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Consecutive days (ending today or yesterday) with at least one food entry logged. */
export function calculateLoggingStreak(loggedDates: string[]): number {
  const daySet = new Set(loggedDates);
  const startsToday = daySet.has(todayISO());
  let streak = 0;
  let offset = startsToday ? 0 : 1;
  if (!startsToday && !daySet.has(isoDaysAgo(1))) return 0;
  while (daySet.has(isoDaysAgo(offset))) {
    streak += 1;
    offset += 1;
  }
  return streak;
}

/** Weight change over the last ~7 days: latest entry minus the closest entry from 7+ days ago. Negative = loss. */
export function calculateWeeklyWeightChangeKg(
  entries: { dateISO: string; weightKg: number }[]
): number | null {
  if (entries.length < 2) return null;
  const sorted = [...entries].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
  const latest = sorted[0];
  const weekAgoCutoff = isoDaysAgo(7);
  const reference = sorted.find((e) => e.dateISO <= weekAgoCutoff) ?? sorted[sorted.length - 1];
  if (reference.dateISO === latest.dateISO) return null;
  return latest.weightKg - reference.weightKg;
}
