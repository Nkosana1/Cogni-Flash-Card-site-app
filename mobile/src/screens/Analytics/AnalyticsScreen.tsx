/**
 * Analytics dashboard screen
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setOverview, setStreak } from '@/store/slices/analyticsSlice';
import { apiService } from '@/services/api';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { overview, streak, loading } = useSelector(
    (state: RootState) => state.analytics
  );

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [overviewData, streakData] = await Promise.all([
        apiService.getOverview(),
        apiService.getStreak(),
      ]);
      dispatch(setOverview(overviewData));
      dispatch(
        setStreak({
          current: streakData.current_streak,
          longest: streakData.longest_streak,
          startDate: streakData.streak_start_date,
        })
      );
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      {/* Streak Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Current Streak</Text>
        <Text style={styles.streakNumber}>{streak.current} days</Text>
        <Text style={styles.streakSubtext}>
          Longest: {streak.longest} days
        </Text>
      </View>

      {/* Overview Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{overview?.due_cards || 0}</Text>
          <Text style={styles.statLabel}>Due Cards</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{overview?.reviewed_today || 0}</Text>
          <Text style={styles.statLabel}>Reviewed Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {overview?.average_accuracy_today?.toFixed(0) || 0}%
          </Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {overview?.study_time_today_minutes || 0}m
          </Text>
          <Text style={styles.statLabel}>Study Time</Text>
        </View>
      </View>

      {/* Progress Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Progress</Text>
        <LineChart
          data={chartData}
          width={SCREEN_WIDTH - 64}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3b82f6',
    textAlign: 'center',
  },
  streakSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (SCREEN_WIDTH - 48) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

