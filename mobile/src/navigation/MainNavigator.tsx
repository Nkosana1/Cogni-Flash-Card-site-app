/**
 * Main navigator (authenticated)
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '@/screens/Dashboard/DashboardScreen';
import DecksScreen from '@/screens/Decks/DecksScreen';
import StudyScreen from '@/screens/Study/StudyScreen';
import AnalyticsScreen from '@/screens/Analytics/AnalyticsScreen';
import SettingsScreen from '@/screens/Settings/SettingsScreen';
import DeckDetailScreen from '@/screens/Decks/DeckDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function DecksStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DecksList"
        component={DecksScreen}
        options={{ title: 'My Decks' }}
      />
      <Stack.Screen
        name="DeckDetail"
        component={DeckDetailScreen}
        options={{ title: 'Deck Details' }}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Decks') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Study') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Decks" component={DecksStack} />
      <Tab.Screen name="Study" component={StudyScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

