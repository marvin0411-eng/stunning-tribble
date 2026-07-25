import { WorkoutPlan } from '../types';

export const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 'walk-intervals',
    title: 'Walking Intervals',
    category: 'Low-Impact Cardio',
    level: 'Beginner',
    durationMinutes: 25,
    caloriesBurnEstimate: 150,
    description:
      'A joint-friendly way to build cardio fitness. Alternates brisk walking with easy recovery paces — no equipment needed.',
    exercises: [
      { name: 'Easy walk warm-up', detail: '5 min at a comfortable pace' },
      { name: 'Brisk walk', detail: '3 min at a pace that raises your breathing' },
      { name: 'Easy walk recovery', detail: '2 min' },
      { name: 'Repeat brisk/easy cycle', detail: '3 rounds' },
      { name: 'Cool-down walk', detail: '5 min slow pace' },
    ],
  },
  {
    id: 'chair-strength',
    title: 'Chair-Assisted Strength',
    category: 'Strength',
    level: 'Beginner',
    durationMinutes: 20,
    caloriesBurnEstimate: 110,
    description:
      'Bodyweight strength moves using a sturdy chair for balance and support — great for building confidence with resistance training.',
    exercises: [
      { name: 'Chair sit-to-stand', detail: '3 sets of 8-10 reps' },
      { name: 'Seated leg extensions', detail: '3 sets of 10 reps per leg' },
      { name: 'Wall push-ups', detail: '3 sets of 8-10 reps' },
      { name: 'Standing chair-supported calf raises', detail: '3 sets of 12 reps' },
      { name: 'Seated overhead reach', detail: '2 sets of 10 reps' },
    ],
  },
  {
    id: 'full-body-beginner',
    title: 'Full Body Beginner Circuit',
    category: 'Full Body',
    level: 'Beginner',
    durationMinutes: 30,
    caloriesBurnEstimate: 180,
    description:
      'A gentle full-body circuit combining light cardio and strength. Rest as needed between rounds — this is about consistency, not intensity.',
    exercises: [
      { name: 'Marching in place', detail: '2 min' },
      { name: 'Bodyweight squats', detail: '3 sets of 10 reps' },
      { name: 'Incline push-ups (hands on counter)', detail: '3 sets of 8 reps' },
      { name: 'Standing side leg raises', detail: '3 sets of 10 reps per side' },
      { name: 'Glute bridges', detail: '3 sets of 12 reps' },
      { name: 'Standing march with knee raise', detail: '2 min' },
    ],
  },
  {
    id: 'gentle-stretch',
    title: 'Gentle Stretch & Recovery',
    category: 'Stretch & Recover',
    level: 'Beginner',
    durationMinutes: 15,
    caloriesBurnEstimate: 40,
    description:
      'A calming stretch sequence to improve mobility and help your body recover between active days. Great for rest days.',
    exercises: [
      { name: 'Neck and shoulder rolls', detail: '1 min' },
      { name: 'Seated forward fold', detail: 'Hold 30 sec x 2' },
      { name: 'Standing quad stretch', detail: 'Hold 30 sec per side' },
      { name: 'Cat-cow stretch', detail: '8 slow reps' },
      { name: 'Deep breathing', detail: '2 min, slow and relaxed' },
    ],
  },
  {
    id: 'low-impact-cardio-dance',
    title: 'Low-Impact Dance Cardio',
    category: 'Low-Impact Cardio',
    level: 'Beginner',
    durationMinutes: 20,
    caloriesBurnEstimate: 140,
    description:
      'Fun, music-driven movement that gets your heart rate up without any jumping or high-impact moves.',
    exercises: [
      { name: 'Warm-up sway and step-touch', detail: '3 min' },
      { name: 'Step-touch with arm reaches', detail: '4 min' },
      { name: 'Grapevine steps', detail: '4 min' },
      { name: 'Slow squat-to-tap', detail: '4 min' },
      { name: 'Cool-down stretch', detail: '5 min' },
    ],
  },
  {
    id: 'core-stability',
    title: 'Beginner Core & Stability',
    category: 'Strength',
    level: 'Beginner',
    durationMinutes: 15,
    caloriesBurnEstimate: 80,
    description:
      'Builds core strength and stability with gentle, controlled movements — supports better posture and everyday movement.',
    exercises: [
      { name: 'Standing pelvic tilts', detail: '2 sets of 10' },
      { name: 'Seated knee lifts', detail: '3 sets of 10 per side' },
      { name: 'Modified bird-dog (on hands and knees)', detail: '3 sets of 8 per side' },
      { name: 'Standing side bends', detail: '2 sets of 10 per side' },
    ],
  },
];

export const WORKOUT_CATEGORIES = [
  'Low-Impact Cardio',
  'Strength',
  'Full Body',
  'Stretch & Recover',
] as const;
