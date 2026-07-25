import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import FoodScreen from '../screens/FoodScreen';
import HomeScreen from '../screens/HomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WeightScreen from '../screens/WeightScreen';
import { WorkoutDetailScreen, WorkoutsListScreen, WorkoutsStackParamList } from '../screens/WorkoutsScreen';
import { useApp } from '../storage/AppContext';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();
const WorkoutsStack = createNativeStackNavigator<WorkoutsStackParamList>();

function WorkoutsStackNavigator() {
  return (
    <WorkoutsStack.Navigator screenOptions={{ headerShown: false }}>
      <WorkoutsStack.Screen name="WorkoutsList" component={WorkoutsListScreen} />
      <WorkoutsStack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{ headerShown: true, title: '', headerTransparent: true, headerBackTitle: 'Back' }}
      />
    </WorkoutsStack.Navigator>
  );
}

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Weight: 'trending-down',
  Food: 'restaurant',
  Workouts: 'barbell',
  Profile: 'person-circle',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name] ?? 'ellipse'} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Weight" component={WeightScreen} />
      <Tab.Screen name="Food" component={FoodScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { loading, profile } = useApp();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <NavigationContainer>{profile ? <MainTabs /> : <OnboardingScreen />}</NavigationContainer>;
}
