import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { FoodEntry, UserProfile, WaterDay, WeightEntry } from '../types';
import {
  clearAllData,
  loadFoodEntries,
  loadProfile,
  loadWaterDays,
  loadWeightEntries,
  saveFoodEntries,
  saveProfile,
  saveWaterDays,
  saveWeightEntries,
} from './storage';
import { todayISO } from '../utils/calculations';

interface AppContextValue {
  loading: boolean;
  profile: UserProfile | null;
  weightEntries: WeightEntry[];
  foodEntries: FoodEntry[];
  waterDays: WaterDay[];
  latestWeightKg: number;
  todayWaterCups: number;
  setProfile: (profile: UserProfile) => Promise<void>;
  updateProfile: (partial: Partial<UserProfile>) => Promise<void>;
  addWeightEntry: (weightKg: number, dateISO?: string, note?: string) => Promise<void>;
  editWeightEntry: (id: string, weightKg: number) => Promise<void>;
  deleteWeightEntry: (id: string) => Promise<void>;
  addFoodEntry: (entry: Omit<FoodEntry, 'id'>) => Promise<void>;
  editFoodEntry: (id: string, partial: Partial<Omit<FoodEntry, 'id'>>) => Promise<void>;
  deleteFoodEntry: (id: string) => Promise<void>;
  setTodayWaterCups: (cups: number) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [waterDays, setWaterDays] = useState<WaterDay[]>([]);

  useEffect(() => {
    (async () => {
      const [p, w, f, wd] = await Promise.all([
        loadProfile(),
        loadWeightEntries(),
        loadFoodEntries(),
        loadWaterDays(),
      ]);
      setProfileState(p);
      setWeightEntries(w);
      setFoodEntries(f);
      setWaterDays(wd);
      setLoading(false);
    })();
  }, []);

  const latestWeightKg = useMemo(() => {
    if (weightEntries.length === 0) return profile?.startWeightKg ?? 0;
    const sorted = [...weightEntries].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
    return sorted[0].weightKg;
  }, [weightEntries, profile]);

  const todayWaterCups = useMemo(() => {
    const today = todayISO();
    return waterDays.find((d) => d.dateISO === today)?.cups ?? 0;
  }, [waterDays]);

  const setProfile = async (next: UserProfile) => {
    setProfileState(next);
    await saveProfile(next);
    const entry: WeightEntry = { id: makeId(), dateISO: todayISO(), weightKg: next.startWeightKg };
    const nextEntries = [entry, ...weightEntries.filter((e) => e.dateISO !== entry.dateISO)];
    setWeightEntries(nextEntries);
    await saveWeightEntries(nextEntries);
  };

  const updateProfile = async (partial: Partial<UserProfile>) => {
    if (!profile) return;
    const next = { ...profile, ...partial };
    setProfileState(next);
    await saveProfile(next);
  };

  const addWeightEntry = async (weightKg: number, dateISO: string = todayISO(), note?: string) => {
    const entry: WeightEntry = { id: makeId(), dateISO, weightKg, note };
    const next = [entry, ...weightEntries.filter((e) => e.dateISO !== dateISO)].sort((a, b) =>
      a.dateISO < b.dateISO ? 1 : -1
    );
    setWeightEntries(next);
    await saveWeightEntries(next);
  };

  const editWeightEntry = async (id: string, weightKg: number) => {
    const next = weightEntries.map((e) => (e.id === id ? { ...e, weightKg } : e));
    setWeightEntries(next);
    await saveWeightEntries(next);
  };

  const deleteWeightEntry = async (id: string) => {
    const next = weightEntries.filter((e) => e.id !== id);
    setWeightEntries(next);
    await saveWeightEntries(next);
  };

  const addFoodEntry = async (entry: Omit<FoodEntry, 'id'>) => {
    const next = [{ ...entry, id: makeId() }, ...foodEntries];
    setFoodEntries(next);
    await saveFoodEntries(next);
  };

  const editFoodEntry = async (id: string, partial: Partial<Omit<FoodEntry, 'id'>>) => {
    const next = foodEntries.map((e) => (e.id === id ? { ...e, ...partial } : e));
    setFoodEntries(next);
    await saveFoodEntries(next);
  };

  const deleteFoodEntry = async (id: string) => {
    const next = foodEntries.filter((e) => e.id !== id);
    setFoodEntries(next);
    await saveFoodEntries(next);
  };

  const setTodayWaterCups = async (cups: number) => {
    const today = todayISO();
    const clamped = Math.max(0, cups);
    const next = [{ dateISO: today, cups: clamped }, ...waterDays.filter((d) => d.dateISO !== today)];
    setWaterDays(next);
    await saveWaterDays(next);
  };

  const resetAllData = async () => {
    await clearAllData();
    setProfileState(null);
    setWeightEntries([]);
    setFoodEntries([]);
    setWaterDays([]);
  };

  const value: AppContextValue = {
    loading,
    profile,
    weightEntries,
    foodEntries,
    waterDays,
    latestWeightKg,
    todayWaterCups,
    setProfile,
    updateProfile,
    addWeightEntry,
    editWeightEntry,
    deleteWeightEntry,
    addFoodEntry,
    editFoodEntry,
    deleteFoodEntry,
    setTodayWaterCups,
    resetAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
