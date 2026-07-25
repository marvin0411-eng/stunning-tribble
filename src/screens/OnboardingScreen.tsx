import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LabeledInput, PrimaryButton, SegmentedControl } from '../components/ui';
import { useApp } from '../storage/AppContext';
import { colors, spacing, typography } from '../theme/theme';
import { ActivityLevel, UnitSystem } from '../types';
import { ACTIVITY_LABELS, feetInchesToCm, lbToKg } from '../utils/calculations';

const STEPS = ['welcome', 'basics', 'body', 'goal', 'activity'] as const;
type Step = (typeof STEPS)[number];

export default function OnboardingScreen() {
  const { setProfile } = useApp();
  const [stepIndex, setStepIndex] = useState(0);
  const step: Step = STEPS[stepIndex];

  const [units, setUnits] = useState<UnitSystem>('imperial');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weight, setWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('light');
  const [error, setError] = useState('');

  const goNext = () => {
    setError('');
    if (step === 'basics') {
      if (!name.trim()) return setError('Please enter your name.');
      const ageNum = Number(age);
      if (!ageNum || ageNum < 13 || ageNum > 100) return setError('Please enter a valid age (13-100).');
    }
    if (step === 'body') {
      if (units === 'metric') {
        const h = Number(heightCm);
        if (!h || h < 100 || h > 250) return setError('Please enter a valid height in cm.');
      } else {
        const f = Number(heightFeet);
        const i = Number(heightInches || '0');
        if (!f || f < 3 || f > 8) return setError('Please enter a valid height.');
        if (i < 0 || i > 11) return setError('Inches should be between 0 and 11.');
      }
    }
    if (step === 'goal') {
      const w = Number(weight);
      const g = Number(goalWeight);
      if (!w || w <= 0) return setError('Please enter your current weight.');
      if (!g || g <= 0) return setError('Please enter a goal weight.');
      if (g >= w) return setError('Your goal weight should be lower than your current weight.');
    }
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      finish();
    }
  };

  const goBack = () => {
    setError('');
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const finish = async () => {
    const finalHeightCm =
      units === 'metric' ? Number(heightCm) : feetInchesToCm(Number(heightFeet), Number(heightInches || '0'));
    const startWeightKg = units === 'metric' ? Number(weight) : lbToKg(Number(weight));
    const goalWeightKg = units === 'metric' ? Number(goalWeight) : lbToKg(Number(goalWeight));

    await setProfile({
      name: name.trim(),
      age: Number(age),
      heightCm: finalHeightCm,
      startWeightKg,
      goalWeightKg,
      activityLevel,
      units,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {step === 'welcome' && (
            <View>
              <Text style={styles.emoji}>🌸</Text>
              <Text style={styles.title}>Welcome to Bloom</Text>
              <Text style={styles.subtitle}>
                A gentle, encouraging companion to help you track your weight, food, and movement on your own
                terms. No judgment — just steady progress.
              </Text>
            </View>
          )}

          {step === 'basics' && (
            <View>
              <Text style={styles.title}>Let's get to know you</Text>
              <LabeledInput label="Your name" value={name} onChangeText={setName} placeholder="Jane" />
              <LabeledInput
                label="Age"
                value={age}
                onChangeText={setAge}
                placeholder="30"
                keyboardType="number-pad"
              />
            </View>
          )}

          {step === 'body' && (
            <View>
              <Text style={styles.title}>Your measurements</Text>
              <Text style={styles.label}>Units</Text>
              <View style={{ marginBottom: spacing.md }}>
                <SegmentedControl
                  value={units}
                  onChange={setUnits}
                  options={[
                    { label: 'Imperial (lb/ft)', value: 'imperial' },
                    { label: 'Metric (kg/cm)', value: 'metric' },
                  ]}
                />
              </View>
              {units === 'metric' ? (
                <LabeledInput
                  label="Height (cm)"
                  value={heightCm}
                  onChangeText={setHeightCm}
                  placeholder="165"
                  keyboardType="number-pad"
                />
              ) : (
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <LabeledInput
                      label="Height (ft)"
                      value={heightFeet}
                      onChangeText={setHeightFeet}
                      placeholder="5"
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <LabeledInput
                      label="Height (in)"
                      value={heightInches}
                      onChangeText={setHeightInches}
                      placeholder="5"
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              )}
            </View>
          )}

          {step === 'goal' && (
            <View>
              <Text style={styles.title}>Weight &amp; goal</Text>
              <LabeledInput
                label={`Current weight (${units === 'metric' ? 'kg' : 'lb'})`}
                value={weight}
                onChangeText={setWeight}
                placeholder={units === 'metric' ? '80' : '176'}
                keyboardType="decimal-pad"
              />
              <LabeledInput
                label={`Goal weight (${units === 'metric' ? 'kg' : 'lb'})`}
                value={goalWeight}
                onChangeText={setGoalWeight}
                placeholder={units === 'metric' ? '68' : '150'}
                keyboardType="decimal-pad"
              />
            </View>
          )}

          {step === 'activity' && (
            <View>
              <Text style={styles.title}>How active are you?</Text>
              <Text style={styles.subtitle}>This helps us suggest a safe daily calorie target.</Text>
              <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => (
                  <PrimaryButton
                    key={level}
                    title={ACTIVITY_LABELS[level]}
                    variant={activityLevel === level ? 'primary' : 'outline'}
                    onPress={() => setActivityLevel(level)}
                  />
                ))}
              </View>
            </View>
          )}

          {!!error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>

        <View style={styles.footer}>
          {stepIndex > 0 && (
            <View style={{ flex: 1 }}>
              <PrimaryButton title="Back" variant="outline" onPress={goBack} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <PrimaryButton
              title={step === 'activity' ? "Let's go" : step === 'welcome' ? 'Get started' : 'Continue'}
              onPress={goNext}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, flexGrow: 1, justifyContent: 'center' },
  emoji: { fontSize: 48, marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
  label: { ...typography.label, color: colors.textMuted, marginBottom: spacing.xs },
  error: { color: colors.danger, marginTop: spacing.sm, fontSize: 14 },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
});
