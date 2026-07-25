import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, LabeledInput, Pill, PrimaryButton, SegmentedControl } from '../components/ui';
import { useApp } from '../storage/AppContext';
import { colors, spacing, typography } from '../theme/theme';
import {
  ACTIVITY_LABELS,
  calculateBMR,
  calculateDailyCalorieTarget,
  calculateTDEE,
  formatHeight,
  formatWeight,
  lbToKg,
} from '../utils/calculations';
import { cancelDailyReminder, scheduleDailyReminder } from '../utils/notifications';
import { UnitSystem } from '../types';

const REMINDER_TIMES = [
  { label: 'Morning (8am)', hour: 8 },
  { label: 'Midday (12pm)', hour: 12 },
  { label: 'Evening (6pm)', hour: 18 },
  { label: 'Night (8pm)', hour: 20 },
];

export default function ProfileScreen() {
  const { profile, latestWeightKg, updateProfile, resetAllData } = useApp();
  const [goalInput, setGoalInput] = useState('');
  const [editingGoal, setEditingGoal] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);

  if (!profile) return null;

  const reminderHour = profile.reminderHour ?? 18;

  const onToggleReminder = async (enabled: boolean) => {
    setReminderBusy(true);
    if (enabled) {
      const granted = await scheduleDailyReminder(reminderHour);
      if (!granted) {
        Alert.alert(
          'Notifications disabled',
          'Enable notifications for this app in your device settings to receive daily reminders.'
        );
        setReminderBusy(false);
        return;
      }
      await updateProfile({ reminderEnabled: true, reminderHour });
    } else {
      await cancelDailyReminder();
      await updateProfile({ reminderEnabled: false });
    }
    setReminderBusy(false);
  };

  const onChangeReminderHour = async (hour: number) => {
    await updateProfile({ reminderHour: hour });
    if (profile.reminderEnabled) {
      setReminderBusy(true);
      await scheduleDailyReminder(hour);
      setReminderBusy(false);
    }
  };

  const bmr = calculateBMR(latestWeightKg, profile.heightCm, profile.age);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const target = calculateDailyCalorieTarget(latestWeightKg, profile.heightCm, profile.age, profile.activityLevel);

  const toggleUnits = (units: UnitSystem) => updateProfile({ units });

  const saveGoal = () => {
    const raw = Number(goalInput);
    if (!raw || raw <= 0) {
      Alert.alert('Invalid goal', 'Please enter a valid goal weight.');
      return;
    }
    const goalWeightKg = profile.units === 'metric' ? raw : lbToKg(raw);
    updateProfile({ goalWeightKg });
    setEditingGoal(false);
    setGoalInput('');
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset all data',
      'This will permanently delete your profile, weight history, and food log. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetAllData },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{profile.name}</Text>
        <Text style={styles.subtitle}>Member since {new Date(profile.createdAt).toLocaleDateString()}</Text>

        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.cardTitle}>Your stats</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Age</Text>
            <Text style={styles.statValue}>{profile.age}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Height</Text>
            <Text style={styles.statValue}>{formatHeight(profile.heightCm, profile.units)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Current weight</Text>
            <Text style={styles.statValue}>{formatWeight(latestWeightKg, profile.units)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Goal weight</Text>
            <Text style={styles.statValue}>{formatWeight(profile.goalWeightKg, profile.units)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Activity level</Text>
            <Text style={[styles.statValue, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>
              {ACTIVITY_LABELS[profile.activityLevel]}
            </Text>
          </View>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.cardTitle}>Calorie targets</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Resting energy (BMR)</Text>
            <Text style={styles.statValue}>{Math.round(bmr)} kcal</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Maintenance (TDEE)</Text>
            <Text style={styles.statValue}>{Math.round(tdee)} kcal</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Daily target</Text>
            <Pill text={`${target} kcal`} tone="success" />
          </View>
          <Text style={styles.footnote}>
            Your target reflects a safe ~500 kcal/day deficit for gradual, sustainable weight loss and never
            drops below 1200 kcal.
          </Text>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.cardTitle}>Units</Text>
          <View style={{ marginTop: spacing.sm }}>
            <SegmentedControl
              value={profile.units}
              onChange={toggleUnits}
              options={[
                { label: 'Imperial', value: 'imperial' },
                { label: 'Metric', value: 'metric' },
              ]}
            />
          </View>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.cardTitle}>Update goal weight</Text>
          {editingGoal ? (
            <View style={{ marginTop: spacing.sm }}>
              <LabeledInput
                label={`New goal (${profile.units === 'metric' ? 'kg' : 'lb'})`}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="decimal-pad"
                autoFocus
              />
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <PrimaryButton title="Cancel" variant="outline" onPress={() => setEditingGoal(false)} />
                </View>
                <View style={{ flex: 1 }}>
                  <PrimaryButton title="Save" onPress={saveGoal} />
                </View>
              </View>
            </View>
          ) : (
            <View style={{ marginTop: spacing.sm }}>
              <PrimaryButton title="Change goal weight" variant="outline" onPress={() => setEditingGoal(true)} />
            </View>
          )}
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Daily reminder</Text>
            <Switch
              value={!!profile.reminderEnabled}
              onValueChange={onToggleReminder}
              disabled={reminderBusy}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>
          <Text style={styles.footnote}>Get a gentle nudge to log your weight, food, or a workout.</Text>
          {profile.reminderEnabled && (
            <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
              {REMINDER_TIMES.map((t) => (
                <PrimaryButton
                  key={t.hour}
                  title={t.label}
                  variant={reminderHour === t.hour ? 'primary' : 'outline'}
                  onPress={() => onChangeReminderHour(t.hour)}
                />
              ))}
            </View>
          )}
        </Card>

        <View style={{ marginTop: spacing.xl }}>
          <PrimaryButton title="Reset all data" variant="outline" onPress={confirmReset} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 2 },
  cardTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  statLabel: { ...typography.body, color: colors.textMuted },
  statValue: { ...typography.body, color: colors.text, fontWeight: '700' },
  footnote: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 18 },
});
