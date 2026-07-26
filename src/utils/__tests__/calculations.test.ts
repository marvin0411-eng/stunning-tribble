import {
  bmiCategory,
  calculateBMI,
  calculateBMR,
  calculateDailyCalorieTarget,
  calculateLoggingStreak,
  calculateTDEE,
  calculateWeeklyWeightChangeKg,
  cmToFeetInches,
  estimatedWeeksToGoal,
  feetInchesToCm,
  formatHeight,
  formatWeight,
  kgToLb,
  lbToKg,
  MIN_SAFE_CALORIES,
  todayISO,
} from '../calculations';

const FIXED_NOW = new Date('2026-07-26T12:00:00Z');

function daysAgoISO(n: number): string {
  const d = new Date(FIXED_NOW);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('unit conversions', () => {
  test('kg <-> lb round trip', () => {
    expect(kgToLb(1)).toBeCloseTo(2.20462, 4);
    expect(lbToKg(kgToLb(80))).toBeCloseTo(80, 5);
  });

  test('cm <-> feet/inches round trip', () => {
    const { feet, inches } = cmToFeetInches(165);
    expect(feet).toBe(5);
    expect(inches).toBe(5);
    expect(feetInchesToCm(5, 5)).toBeCloseTo(165, 0);
  });

  test('formatWeight respects unit system', () => {
    expect(formatWeight(80, 'metric')).toBe('80.0 kg');
    expect(formatWeight(80, 'imperial')).toBe(`${kgToLb(80).toFixed(1)} lb`);
  });

  test('formatHeight respects unit system', () => {
    expect(formatHeight(180, 'metric')).toBe('180 cm');
    expect(formatHeight(165, 'imperial')).toBe("5'5\"");
  });
});

describe('BMI', () => {
  test('calculates BMI from weight and height', () => {
    // 70kg at 175cm -> 70 / 1.75^2 = 22.857...
    expect(calculateBMI(70, 175)).toBeCloseTo(22.857, 2);
  });

  test('returns 0 for non-positive height', () => {
    expect(calculateBMI(70, 0)).toBe(0);
  });

  test('bmiCategory buckets correctly', () => {
    expect(bmiCategory(17)).toBe('Underweight');
    expect(bmiCategory(22)).toBe('Healthy range');
    expect(bmiCategory(27)).toBe('Overweight');
    expect(bmiCategory(32)).toBe('Obesity');
  });
});

describe('calorie targets', () => {
  test('BMR uses the Mifflin-St Jeor equation for women', () => {
    // 80kg, 165cm, 30yo -> 10*80 + 6.25*165 - 5*30 - 161 = 800 + 1031.25 - 150 - 161 = 1520.25
    expect(calculateBMR(80, 165, 30)).toBeCloseTo(1520.25, 2);
  });

  test('TDEE scales BMR by activity multiplier', () => {
    const bmr = 1500;
    expect(calculateTDEE(bmr, 'sedentary')).toBeCloseTo(1800, 5);
    expect(calculateTDEE(bmr, 'active')).toBeCloseTo(2587.5, 5);
  });

  test('daily target applies a 500 kcal deficit', () => {
    // BMR(80,165,30)=1520.25, TDEE sedentary = *1.2 = 1824.3, target = 1324.3 -> rounds to 1324
    const target = calculateDailyCalorieTarget(80, 165, 30, 'sedentary');
    expect(target).toBe(1324);
  });

  test('daily target never drops below the safety floor', () => {
    // Small, older, sedentary body would otherwise compute well under 1200
    const target = calculateDailyCalorieTarget(45, 150, 70, 'sedentary');
    expect(target).toBeGreaterThanOrEqual(MIN_SAFE_CALORIES);
  });
});

describe('estimatedWeeksToGoal', () => {
  test('estimates weeks at 0.5kg/week pace', () => {
    expect(estimatedWeeksToGoal(80, 75)).toBe(10);
  });

  test('returns 0 when already at or past goal', () => {
    expect(estimatedWeeksToGoal(70, 70)).toBe(0);
    expect(estimatedWeeksToGoal(68, 70)).toBe(0);
  });
});

describe('calculateLoggingStreak', () => {
  test('counts consecutive days ending today', () => {
    const dates = [daysAgoISO(0), daysAgoISO(1), daysAgoISO(2)];
    expect(calculateLoggingStreak(dates)).toBe(3);
  });

  test('still counts a streak ending yesterday (grace day)', () => {
    const dates = [daysAgoISO(1), daysAgoISO(2), daysAgoISO(3)];
    expect(calculateLoggingStreak(dates)).toBe(3);
  });

  test('breaks on a gap', () => {
    const dates = [daysAgoISO(0), daysAgoISO(2)];
    expect(calculateLoggingStreak(dates)).toBe(1);
  });

  test('returns 0 when nothing logged recently', () => {
    expect(calculateLoggingStreak([daysAgoISO(5)])).toBe(0);
    expect(calculateLoggingStreak([])).toBe(0);
  });
});

describe('calculateWeeklyWeightChangeKg', () => {
  test('returns null with fewer than two entries', () => {
    expect(calculateWeeklyWeightChangeKg([])).toBeNull();
    expect(calculateWeeklyWeightChangeKg([{ dateISO: todayISO(), weightKg: 80 }])).toBeNull();
  });

  test('compares latest entry to the closest one 7+ days back', () => {
    const entries = [
      { dateISO: daysAgoISO(10), weightKg: 82 },
      { dateISO: daysAgoISO(3), weightKg: 81 },
      { dateISO: daysAgoISO(0), weightKg: 80 },
    ];
    // reference should be the daysAgoISO(10) entry (closest to/at the 7-day cutoff), 80 - 82 = -2
    expect(calculateWeeklyWeightChangeKg(entries)).toBeCloseTo(-2, 5);
  });

  test('returns null when the only comparison point is the latest entry itself', () => {
    const entries = [{ dateISO: daysAgoISO(0), weightKg: 80 }];
    expect(calculateWeeklyWeightChangeKg(entries)).toBeNull();
  });
});
