import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Pill, PrimaryButton } from '../components/ui';
import { WORKOUT_PLANS } from '../data/workouts';
import { useApp } from '../storage/AppContext';
import { colors, spacing, typography } from '../theme/theme';
import { WorkoutPlan } from '../types';

export type WorkoutsStackParamList = {
  WorkoutsList: undefined;
  WorkoutDetail: { workoutId: string };
};

type ListProps = NativeStackScreenProps<WorkoutsStackParamList, 'WorkoutsList'>;
type DetailProps = NativeStackScreenProps<WorkoutsStackParamList, 'WorkoutDetail'>;

export function WorkoutsListScreen({ navigation }: ListProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={WORKOUT_PLANS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Workouts</Text>
            <Text style={styles.subtitle}>Beginner-friendly plans. Move at your own pace.</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => <WorkoutCard plan={item} onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item.id })} />}
      />
    </SafeAreaView>
  );
}

function WorkoutCard({ plan, onPress }: { plan: WorkoutPlan; onPress: () => void }) {
  const { isWorkoutDoneToday } = useApp();
  const doneToday = isWorkoutDoneToday(plan.id);
  return (
    <Pressable onPress={onPress}>
      <Card>
        <View style={styles.rowBetween}>
          <Pill text={plan.category} />
          {doneToday ? <Pill text="✓ Done today" tone="success" /> : <Text style={styles.smallMuted}>{plan.durationMinutes} min</Text>}
        </View>
        <Text style={styles.cardTitle}>{plan.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {plan.description}
        </Text>
        <Text style={styles.smallMuted}>~{plan.caloriesBurnEstimate} kcal burned · {plan.level}</Text>
      </Card>
    </Pressable>
  );
}

export function WorkoutDetailScreen({ route }: DetailProps) {
  const plan = WORKOUT_PLANS.find((p) => p.id === route.params.workoutId);
  const { isWorkoutDoneToday, logWorkoutToday, unlogWorkoutToday } = useApp();
  if (!plan) return null;

  const doneToday = isWorkoutDoneToday(plan.id);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pill text={plan.category} />
        <Text style={styles.title}>{plan.title}</Text>
        <Text style={styles.subtitle}>{plan.description}</Text>

        <View style={[styles.rowBetween, { marginTop: spacing.md }]}>
          <Stat label="Duration" value={`${plan.durationMinutes} min`} />
          <Stat label="Est. burn" value={`~${plan.caloriesBurnEstimate} kcal`} />
          <Stat label="Level" value={plan.level} />
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <PrimaryButton
            title={doneToday ? '✓ Done today — tap to undo' : 'Mark as done today'}
            variant={doneToday ? 'primary' : 'outline'}
            onPress={() => (doneToday ? unlogWorkoutToday(plan.id) : logWorkoutToday(plan.id))}
          />
        </View>

        <Text style={styles.sectionTitle}>Exercises</Text>
        {plan.exercises.map((ex, i) => (
          <Card key={i} style={{ marginBottom: spacing.sm }}>
            <Text style={styles.exerciseName}>
              {i + 1}. {ex.name}
            </Text>
            <Text style={styles.smallMuted}>{ex.detail}</Text>
          </Card>
        ))}
        <Text style={styles.footnote}>
          Listen to your body — modify or rest whenever you need to. Consult a doctor before starting a new
          exercise routine if you have any health concerns.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.smallMuted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  title: { ...typography.h1, color: colors.text, marginTop: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallMuted: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  cardTitle: { ...typography.h3, color: colors.text, marginTop: spacing.sm },
  cardDesc: { ...typography.body, color: colors.textMuted, marginVertical: spacing.xs },
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  exerciseName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  footnote: { ...typography.small, color: colors.textMuted, marginTop: spacing.md, lineHeight: 18 },
});
