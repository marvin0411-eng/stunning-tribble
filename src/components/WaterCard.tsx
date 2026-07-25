import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui';
import { colors, spacing, typography } from '../theme/theme';

export const DAILY_WATER_GOAL_CUPS = 8;

export function WaterCard({ cups, onChange }: { cups: number; onChange: (cups: number) => void }) {
  return (
    <Card>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>💧 Water</Text>
        <Text style={styles.smallMuted}>
          {cups} / {DAILY_WATER_GOAL_CUPS} cups
        </Text>
      </View>
      <View style={styles.controls}>
        <Pressable
          style={[styles.stepButton, cups === 0 && styles.stepButtonDisabled]}
          onPress={() => onChange(Math.max(0, cups - 1))}
          disabled={cups === 0}
        >
          <Ionicons name="remove" size={20} color={cups === 0 ? colors.textMuted : colors.primary} />
        </Pressable>
        <View style={styles.dropsRow}>
          {Array.from({ length: DAILY_WATER_GOAL_CUPS }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < cups ? 'water' : 'water-outline'}
              size={18}
              color={i < cups ? colors.secondary : colors.border}
              style={{ marginHorizontal: 1 }}
            />
          ))}
        </View>
        <Pressable style={styles.stepButton} onPress={() => onChange(cups + 1)}>
          <Ionicons name="add" size={20} color={colors.primary} />
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { ...typography.h3, color: colors.text },
  smallMuted: { ...typography.small, color: colors.textMuted },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonDisabled: {
    borderColor: colors.border,
  },
  dropsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    justifyContent: 'center',
  },
});
