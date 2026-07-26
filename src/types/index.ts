export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';
export type UnitSystem = 'metric' | 'imperial';
export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  startWeightKg: number;
  goalWeightKg: number;
  activityLevel: ActivityLevel;
  units: UnitSystem;
  createdAt: string;
  reminderEnabled?: boolean;
  reminderHour?: number;
}

export interface WeightEntry {
  id: string;
  dateISO: string;
  weightKg: number;
  note?: string;
}

export interface FoodEntry {
  id: string;
  dateISO: string;
  meal: Meal;
  name: string;
  calories: number;
}

export interface WaterDay {
  dateISO: string;
  cups: number;
}

export interface Exercise {
  name: string;
  detail: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  category: 'Low-Impact Cardio' | 'Strength' | 'Full Body' | 'Stretch & Recover';
  level: 'Beginner' | 'Intermediate';
  durationMinutes: number;
  caloriesBurnEstimate: number;
  description: string;
  exercises: Exercise[];
}

export interface WorkoutLogEntry {
  id: string;
  dateISO: string;
  workoutId: string;
}
