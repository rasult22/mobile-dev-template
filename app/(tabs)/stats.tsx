import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { getAllStats, getDayStats, getTodayDate } from '../../store/storage';
import type { DayStats } from '../../types';

export default function StatsScreen() {
  const [todayStats, setTodayStats] = useState<DayStats | null>(null);
  const [monthStats, setMonthStats] = useState<Record<string, DayStats>>({});

  const loadStats = useCallback(async () => {
    const [today, all] = await Promise.all([
      getDayStats(getTodayDate()),
      getAllStats(),
    ]);
    setTodayStats(today);
    setMonthStats(all);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  // Generate calendar weeks for current month
  const generateCalendarWeeks = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    // We need to convert to Monday-first format: Mon=0, Tue=1, ..., Sun=6
    const startDayOfWeek = firstDay.getDay();
    const emptyDays = (startDayOfWeek + 6) % 7; // Convert to Monday-first

    const days: (number | null)[] = [];

    // Add empty slots for days before the first of the month
    for (let i = 0; i < emptyDays; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    // Pad end to complete the last week
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    // Split into weeks (arrays of 7 days)
    const weeks: (number | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  };

  const getColorForPomodoros = (count: number): string => {
    if (count === 0) return colors.surfaceLight;
    if (count <= 2) return `${colors.primary}40`;
    if (count <= 4) return `${colors.primary}70`;
    if (count <= 6) return `${colors.primary}A0`;
    return colors.primary;
  };

  const calendarWeeks = generateCalendarWeeks();
  const today = new Date();
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  // Calculate streak
  const calculateStreak = (): number => {
    let streak = 0;
    const todayDate = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(todayDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayStats = monthStats[dateStr];

      if (dayStats && dayStats.completedPomodoros > 0) {
        streak++;
      } else if (i > 0) {
        // Skip today if no pomodoros yet
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();
  const totalPomodoros = Object.values(monthStats).reduce(
    (sum, day) => sum + day.completedPomodoros,
    0
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Статистика</Text>

        {/* Today's stats */}
        <View style={styles.todayCard}>
          <Text style={styles.todayLabel}>Сегодня</Text>
          <View style={styles.todayStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{todayStats?.completedPomodoros || 0}</Text>
              <Text style={styles.statLabel}>помидоров</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{todayStats?.totalWorkMinutes || 0}</Text>
              <Text style={styles.statLabel}>минут работы</Text>
            </View>
          </View>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{streak}</Text>
            <Text style={styles.summaryLabel}>дней подряд</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalPomodoros}</Text>
            <Text style={styles.summaryLabel}>всего</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          <Text style={styles.calendarTitle}>
            {monthNames[today.getMonth()]} {today.getFullYear()}
          </Text>

          {/* Weekday headers */}
          <View style={styles.weekdayRow}>
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
              <Text key={day} style={styles.weekdayLabel}>{day}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {calendarWeeks.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} style={styles.weekRow}>
                {week.map((day, dayIndex) => {
                  if (day === null) {
                    return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.dayCell} />;
                  }

                  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayData = monthStats[dateStr];
                  const pomodoros = dayData?.completedPomodoros || 0;
                  const isToday = day === today.getDate();

                  return (
                    <View
                      key={day}
                      style={[
                        styles.dayCell,
                        { backgroundColor: getColorForPomodoros(pomodoros) },
                        isToday && styles.todayCell,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumber,
                          pomodoros > 0 && styles.dayNumberActive,
                          isToday && styles.todayNumber,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendLabel}>Меньше</Text>
            {[0, 2, 4, 6, 8].map((level) => (
              <View
                key={level}
                style={[
                  styles.legendBox,
                  { backgroundColor: getColorForPomodoros(level) },
                ]}
              />
            ))}
            <Text style={styles.legendLabel}>Больше</Text>
          </View>
        </View>

        {/* Motivation message */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>
            {streak > 0
              ? `Отличная работа! Не прерывай цепочку продуктивности.`
              : `Начни сегодня и построй свою цепочку продуктивности!`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  todayCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  todayLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  todayStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: typography.h1,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.bodySmall,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.text,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  calendarCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  calendarTitle: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  weekdayRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: spacing.sm,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  calendarGrid: {
    gap: 2,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 2,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  todayCell: {
    borderColor: colors.primary,
  },
  dayNumber: {
    color: colors.textMuted,
    fontSize: typography.bodySmall,
  },
  dayNumberActive: {
    color: colors.text,
    fontWeight: typography.medium,
  },
  todayNumber: {
    color: colors.text,
    fontWeight: typography.bold,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  legendLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.sm,
  },
  motivationCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  motivationText: {
    color: colors.text,
    fontSize: typography.body,
    fontStyle: 'italic',
  },
});
