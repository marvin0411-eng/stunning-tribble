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
  cmToFeetInches,
  feetInchesToCm,
  formatHeight,
  formatWeight,
  kgToLb,
  lbToKg,
} from '../utils/calculations';
import { cancelDailyReminder, scheduleDailyReminder } from '../utils/notifications';
import { ActivityLevel, UnitSystem } from '../types';

const REMINDER_TIMES = [
  { label: 'Morning (8am)', hour: 8 },
  { label: 'Midday (12pm)', hour: 12 },
  { label: 'Evening (6pm)', hour: 18 },
  { label: 'Night (8pm)', hour: 20 },
];

export default function ProfileScreen() {
  const { profile, latestWeightKg, updateProfile, resetAllData } = useApp();
  const [reminderBusy, setReminderBusy] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [ageInput, setAgeInput] = useState('');
  const [heightCmInput, setHeightCmInput] = useState('');
  const [heightFeetInput, setHeightFeetInput] = useState('');
  const [heightInchesInput, setHeightInchesInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [activityInput, setActivityInput] = useState<ActivityLevel>('light');
  const [detailsError, setDetailsError] = useState('');

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

  const openEditDetails = () => {
    setAgeInput(String(profile.age));
    if (profile.units === 'metric') {
      setHeightCmInput(String(Math.round(profile.heightCm)));
    } else {
      const { feet, inches } = cmToFeetInches(profile.heightCm);
      setHeightFeetInput(String(feet));
      setHeightInchesInput(String(inches));
    }
    const goalDisplay = profile.units === 'metric' ? profile.goalWeightKg : kgToLb(profile.goalWeightKg);
    setGoalInput(goalDisplay.toFixed(1));
    setActivityInput(profile.activityLevel);
    setDetailsError('');
    setEditingDetails(true);
  };

  const saveDetails = () => {
    setDetailsError('');
    const age = Number(ageInput);
    if (!age || age < 13 || age > 100) {
      setDetailsError('Please enter a valid age (13-100).');
      return;
    }

    let heightCm: number;
    if (profile.units === 'metric') {
      heightCm = Number(heightCmInput);
      if (!heightCm || heightCm < 100 || heightCm > 250) {
        setDetailsError('Please enter a valid height in cm.');
        return;
      }
    } else {
      const feet = Number(heightFeetInput);
      const inches = Number(heightInchesInput || '0');
      if (!feet || feet < 3 || feet > 8 || inches < 0 || inches > 11) {
        setDetailsError('Please enter a valid height.');
        return;
      }
      heightCm = feetInchesToCm(feet, inches);
    }

    const rawGoal = Number(goalInput);
    if (!rawGoal || rawGoal <= 0) {
      setDetailsError('Please enter a valid goal weight.');
      return;
    }
    const goalWeightKg = profile.units === 'metric' ? rawGoal : lbToKg(rawGoal);

    updateProfile({ age, heightCm, goalWeightKg, activityLevel: activityInput });
    setEditingDetails(false);
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
          <Text style={styles.cardTitle}>Edit details</Text>
          {editingDetails ? (
            <View style={{ marginTop: spacing.sm }}>
              <LabeledInput label="Age" value={ageInput} onChangeText={setAgeInput} keyboardType="number-pad" />
              {profile.units === 'metric' ? (
                <LabeledInput
                  label="Height (cm)"
                  value={heightCmInput}
                  onChangeText={setHeightCmInput}
                  keyboardType="number-pad"
                />
              ) : (
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <LabeledInput
                      label="Height (ft)"
                      value={heightFeetInput}
                      onChangeText={setHeightFeetInput}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <LabeledInput
                      label="Height (in)"
                      value={heightInchesInput}
                      onChangeText={setHeightInchesInput}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              )}
              <LabeledInput
                label={`Goal weight (${profile.units === 'metric' ? 'kg' : 'lb'})`}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="decimal-pad"
              />
              <Text style={styles.label}>Activity level</Text>
              <View style={{ gap: spacing.sm, marginTop: spacing.xs, marginBottom: spacing.md }}>
                {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => (
                  <PrimaryButton
                    key={level}
                    title={ACTIVITY_LABELS[level]}
                    variant={activityInput === level ? 'primary' : 'outline'}
                    onPress={() => setActivityInput(level)}
                  />
                ))}
              </View>
              {!!detailsError && <Text style={styles.errorText}>{detailsError}</Text>}
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <PrimaryButton title="Cancel" variant="outline" onPress={() => setEditingDetails(false)} />
                </View>
                <View style={{ flex: 1 }}>
                  <PrimaryButton title="Save" onPress={saveDetails} />
                </View>
              </View>
            </View>
          ) : (
            <View style={{ marginTop: spacing.sm }}>
              <PrimaryButton title="Edit age, height, goal & activity" variant="outline" onPress={openEditDetails} />
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
  label: { ...typography.label, color: colors.textMuted },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
});
