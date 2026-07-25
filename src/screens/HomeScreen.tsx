import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Pill, ProgressBar } from '../components/ui';
import { useApp } from '../storage/AppContext';
import { colors, spacing, typography } from '../theme/theme';
import {
  calculateDailyCalorieTarget,
  estimatedWeeksToGoal,
  formatWeight,
  todayISO,
} from '../utils/calculations';

export default function HomeScreen() {
  const { profile, foodEntries, latestWeightKg } = useApp();

  const todaysFood = useMemo(
    () => foodEntries.filter((e) => e.dateISO === todayISO()),
    [foodEntries]
  );
  const caloriesConsumed = todaysFood.reduce((sum, e) => sum + e.calories, 0);

  if (!profile) return null;

  const target = calculateDailyCalorieTarget(latestWeightKg, profile.heightCm, profile.age, profile.activityLevel);
  const remaining = target - caloriesConsumed;
  const caloriesProgress = target > 0 ? caloriesConsumed / target : 0;

  const totalToLose = profile.startWeightKg - profile.goalWeightKg;
  const lostSoFar = profile.startWeightKg - latestWeightKg;
  const weightProgress = totalToLose > 0 ? Math.max(0, lostSoFar / totalToLose) : 0;
  const weeksLeft = estimatedWeeksToGoal(latestWeightKg, profile.goalWeightKg);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.greeting}>Hi {profile.name} 👋</Text>
        <Text style={styles.subtitle}>Here's your progress today</Text>

        <Card style={{ marginTop: spacing.lg }}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Today's calories</Text>
            <Pill text={remaining >= 0 ? `${remaining} left` : 'Over target'} tone={remaining >= 0 ? 'success' : 'warning'} />
          </View>
          <Text style={styles.bigNumber}>
            {caloriesConsumed} <Text style={styles.bigNumberUnit}>/ {target} kcal</Text>
          </Text>
          <View style={{ marginTop: spacing.sm }}>
            <ProgressBar progress={caloriesProgress} />
          </View>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Weight progress</Text>
            <Pill text={`${formatWeight(latestWeightKg, profile.units)}`} />
          </View>
          <View style={{ marginTop: spacing.sm }}>
            <ProgressBar progress={weightProgress} />
          </View>
          <View style={[styles.rowBetween, { marginTop: spacing.sm }]}>
            <Text style={styles.smallMuted}>Start: {formatWeight(profile.startWeightKg, profile.units)}</Text>
            <Text style={styles.smallMuted}>Goal: {formatWeight(profile.goalWeightKg, profile.units)}</Text>
          </View>
          {weeksLeft > 0 && (
            <Text style={[styles.smallMuted, { marginTop: spacing.sm }]}>
              At a safe, steady pace you're about {weeksLeft} week{weeksLeft === 1 ? '' : 's'} from your goal.
            </Text>
          )}
        </Card>

        <Card style={{ marginTop: spacing.md, backgroundColor: colors.primaryLight }}>
          <Text style={[styles.cardTitle, { color: colors.primaryDark }]}>💡 Today's tip</Text>
          <Text style={[styles.body, { color: colors.primaryDark, marginTop: spacing.xs }]}>
            Small, consistent changes beat big, unsustainable ones. Aim for progress, not perfection — one meal
            and one workout at a time.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  greeting: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 2 },
  cardTitle: { ...typography.h3, color: colors.text },
  bigNumber: { fontSize: 34, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  bigNumberUnit: { fontSize: 16, fontWeight: '500', color: colors.textMuted },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallMuted: { ...typography.small, color: colors.textMuted },
  body: { ...typography.body, lineHeight: 20 },
});
