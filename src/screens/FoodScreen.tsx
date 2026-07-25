import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, LabeledInput, Pill, PrimaryButton, ProgressBar } from '../components/ui';
import { useApp } from '../storage/AppContext';
import { colors, spacing, typography } from '../theme/theme';
import { calculateDailyCalorieTarget, todayISO } from '../utils/calculations';
import { Meal } from '../types';

const MEALS: { key: Meal; label: string; emoji: string }[] = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { key: 'lunch', label: 'Lunch', emoji: '🥗' },
  { key: 'dinner', label: 'Dinner', emoji: '🍽️' },
  { key: 'snack', label: 'Snacks', emoji: '🍎' },
];

export default function FoodScreen() {
  const { profile, foodEntries, latestWeightKg, addFoodEntry, deleteFoodEntry } = useApp();
  const [modalMeal, setModalMeal] = useState<Meal | null>(null);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');

  const todays = useMemo(() => foodEntries.filter((e) => e.dateISO === todayISO()), [foodEntries]);

  if (!profile) return null;

  const target = calculateDailyCalorieTarget(latestWeightKg, profile.heightCm, profile.age, profile.activityLevel);
  const consumed = todays.reduce((sum, e) => sum + e.calories, 0);

  const openModal = (meal: Meal) => {
    setModalMeal(meal);
    setName('');
    setCalories('');
  };

  const submit = async () => {
    const cal = Number(calories);
    if (!name.trim()) {
      Alert.alert('Missing name', 'Give this food a name.');
      return;
    }
    if (!cal || cal <= 0) {
      Alert.alert('Invalid calories', 'Enter a positive calorie amount.');
      return;
    }
    await addFoodEntry({ dateISO: todayISO(), meal: modalMeal as Meal, name: name.trim(), calories: cal });
    setModalMeal(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Food log</Text>

        <Card style={{ marginTop: spacing.md }}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Today's total</Text>
            <Pill text={`${target - consumed >= 0 ? target - consumed : 0} kcal left`} />
          </View>
          <Text style={styles.bigNumber}>
            {consumed} <Text style={styles.bigNumberUnit}>/ {target} kcal</Text>
          </Text>
          <View style={{ marginTop: spacing.sm }}>
            <ProgressBar progress={target > 0 ? consumed / target : 0} />
          </View>
        </Card>

        {MEALS.map((meal) => {
          const entries = todays.filter((e) => e.meal === meal.key);
          const mealTotal = entries.reduce((s, e) => s + e.calories, 0);
          return (
            <View key={meal.key} style={{ marginTop: spacing.lg }}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>
                  {meal.emoji} {meal.label}
                </Text>
                <Text style={styles.smallMuted}>{mealTotal} kcal</Text>
              </View>
              {entries.map((e) => (
                <Card key={e.id} style={{ marginTop: spacing.sm }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.entryName}>{e.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                      <Text style={styles.smallMuted}>{e.calories} kcal</Text>
                      <Pressable onPress={() => deleteFoodEntry(e.id)}>
                        <Text style={styles.deleteText}>Remove</Text>
                      </Pressable>
                    </View>
                  </View>
                </Card>
              ))}
              <Pressable style={styles.addRow} onPress={() => openModal(meal.key)}>
                <Text style={styles.addRowText}>+ Add food to {meal.label.toLowerCase()}</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={modalMeal !== null} transparent animationType="slide" onRequestClose={() => setModalMeal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add food</Text>
            <LabeledInput label="Food name" value={name} onChangeText={setName} placeholder="Greek yogurt" />
            <LabeledInput
              label="Calories"
              value={calories}
              onChangeText={setCalories}
              placeholder="150"
              keyboardType="number-pad"
            />
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <PrimaryButton title="Cancel" variant="outline" onPress={() => setModalMeal(null)} />
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton title="Add" onPress={submit} />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  title: { ...typography.h1, color: colors.text },
  cardTitle: { ...typography.h3, color: colors.text },
  bigNumber: { fontSize: 30, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  bigNumberUnit: { fontSize: 15, fontWeight: '500', color: colors.textMuted },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallMuted: { ...typography.small, color: colors.textMuted },
  sectionTitle: { ...typography.h3, color: colors.text },
  entryName: { fontSize: 15, fontWeight: '600', color: colors.text },
  deleteText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  addRow: {
    marginTop: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addRowText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  modalWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
  },
  modalTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
});
