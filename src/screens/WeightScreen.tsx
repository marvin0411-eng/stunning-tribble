import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, LabeledInput, Pill, PrimaryButton } from '../components/ui';
import { LineChart } from '../components/LineChart';
import { useApp } from '../storage/AppContext';
import { colors, spacing, typography } from '../theme/theme';
import { bmiCategory, calculateBMI, formatWeight, kgToLb, lbToKg, todayISO } from '../utils/calculations';

export default function WeightScreen() {
  const { profile, weightEntries, addWeightEntry, deleteWeightEntry } = useApp();
  const { width } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const [input, setInput] = useState('');

  const sorted = useMemo(
    () => [...weightEntries].sort((a, b) => (a.dateISO > b.dateISO ? 1 : -1)),
    [weightEntries]
  );
  const chartData = sorted.slice(-14).map((e) => e.weightKg);
  const listDesc = [...sorted].reverse();

  if (!profile) return null;

  const latest = sorted.length > 0 ? sorted[sorted.length - 1].weightKg : profile.startWeightKg;
  const bmi = calculateBMI(latest, profile.heightCm);

  const submit = async () => {
    const raw = Number(input);
    if (!raw || raw <= 0) {
      Alert.alert('Invalid weight', 'Please enter a valid weight.');
      return;
    }
    const weightKg = profile.units === 'metric' ? raw : lbToKg(raw);
    await addWeightEntry(weightKg, todayISO());
    setInput('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Weight</Text>
        <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Log weight</Text>
        </Pressable>
      </View>

      <FlatList
        data={listDesc}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={
          <View>
            <Card>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.smallMuted}>Current weight</Text>
                  <Text style={styles.bigNumber}>{formatWeight(latest, profile.units)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.smallMuted}>BMI</Text>
                  <Text style={styles.bmiNumber}>{bmi.toFixed(1)}</Text>
                  <Pill text={bmiCategory(bmi)} tone={bmi >= 25 ? 'warning' : 'success'} />
                </View>
              </View>
              {chartData.length > 1 && (
                <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
                  <LineChart data={chartData} width={width - spacing.lg * 2 - spacing.md * 2} goalY={profile.goalWeightKg} />
                </View>
              )}
            </Card>
            <Text style={styles.sectionTitle}>History</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={{ marginBottom: spacing.sm }}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.entryWeight}>{formatWeight(item.weightKg, profile.units)}</Text>
                <Text style={styles.smallMuted}>{item.dateISO}</Text>
              </View>
              <Pressable onPress={() => deleteWeightEntry(item.id)}>
                <Text style={styles.deleteText}>Remove</Text>
              </Pressable>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={[styles.smallMuted, { textAlign: 'center', marginTop: spacing.lg }]}>
            No entries yet. Log your first weigh-in to start tracking progress.
          </Text>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log today's weight</Text>
            <LabeledInput
              label={`Weight (${profile.units === 'metric' ? 'kg' : 'lb'})`}
              value={input}
              onChangeText={setInput}
              keyboardType="decimal-pad"
              placeholder={profile.units === 'metric' ? '75' : String(Math.round(kgToLb(profile.startWeightKg)))}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <PrimaryButton title="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton title="Save" onPress={submit} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: { ...typography.h1, color: colors.text },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  smallMuted: { ...typography.small, color: colors.textMuted },
  bigNumber: { fontSize: 30, fontWeight: '800', color: colors.text, marginTop: 2 },
  bmiNumber: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 },
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  entryWeight: { fontSize: 16, fontWeight: '700', color: colors.text },
  deleteText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  modalWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
  },
  modalTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
});
