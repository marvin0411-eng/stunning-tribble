import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodEntry, UserProfile, WaterDay, WeightEntry, WorkoutLogEntry } from '../types';

const KEYS = {
  profile: '@bloom/profile',
  weightEntries: '@bloom/weightEntries',
  foodEntries: '@bloom/foodEntries',
  waterDays: '@bloom/waterDays',
  workoutLogs: '@bloom/workoutLogs',
};

export async function loadProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.profile);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

export async function loadWeightEntries(): Promise<WeightEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.weightEntries);
  return raw ? (JSON.parse(raw) as WeightEntry[]) : [];
}

export async function saveWeightEntries(entries: WeightEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.weightEntries, JSON.stringify(entries));
}

export async function loadFoodEntries(): Promise<FoodEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.foodEntries);
  return raw ? (JSON.parse(raw) as FoodEntry[]) : [];
}

export async function saveFoodEntries(entries: FoodEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.foodEntries, JSON.stringify(entries));
}

export async function loadWaterDays(): Promise<WaterDay[]> {
  const raw = await AsyncStorage.getItem(KEYS.waterDays);
  return raw ? (JSON.parse(raw) as WaterDay[]) : [];
}

export async function saveWaterDays(days: WaterDay[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.waterDays, JSON.stringify(days));
}

export async function loadWorkoutLogs(): Promise<WorkoutLogEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.workoutLogs);
  return raw ? (JSON.parse(raw) as WorkoutLogEntry[]) : [];
}

export async function saveWorkoutLogs(logs: WorkoutLogEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.workoutLogs, JSON.stringify(logs));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.profile,
    KEYS.weightEntries,
    KEYS.foodEntries,
    KEYS.waterDays,
    KEYS.workoutLogs,
  ]);
}
