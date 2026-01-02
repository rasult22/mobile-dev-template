import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircularTimer } from '../../components/timer/CircularTimer';
import { TimerControls } from '../../components/timer/TimerControls';
import { SessionIndicator } from '../../components/timer/SessionIndicator';
import { useTimerContext } from '../../store/timerContext';
import { colors, spacing, typography } from '../../constants/theme';
import { getTasks, getDayStats, getTodayDate } from '../../store/storage';
import type { Task } from '../../types';

export default function TimerScreen() {
  const {
    state,
    profile,
    settings,
    start,
    pause,
    reset,
    skipBreak,
  } = useTimerContext();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [todayPomodoros, setTodayPomodoros] = useState(0);

  // Load active task title
  useEffect(() => {
    async function loadActiveTask() {
      if (state.activeTaskId) {
        const tasks = await getTasks();
        const task = tasks.find((t) => t.id === state.activeTaskId);
        setActiveTask(task || null);
      } else {
        setActiveTask(null);
      }
    }
    loadActiveTask();
  }, [state.activeTaskId]);

  // Load today's stats
  useEffect(() => {
    async function loadTodayStats() {
      const stats = await getDayStats(getTodayDate());
      setTodayPomodoros(stats.completedPomodoros);
    }
    loadTodayStats();

    // Refresh when timer completes a pomodoro
    const interval = setInterval(loadTodayStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header with today's count */}
        <View style={styles.header}>
          <Text style={styles.todayLabel}>Сегодня</Text>
          <View style={styles.todayCount}>
            <Text style={styles.todayNumber}>{todayPomodoros}</Text>
            <Text style={styles.todayUnit}>
              {getPomodoroWord(todayPomodoros)}
            </Text>
          </View>
        </View>

        {/* Session indicator */}
        <SessionIndicator
          mode={state.mode}
          currentPomodoro={state.currentPomodoro}
          totalPomodoros={profile.pomodorosPerCycle}
          taskTitle={activeTask?.title}
        />

        {/* Circular timer */}
        <View style={styles.timerContainer}>
          <CircularTimer
            timeRemaining={state.timeRemaining}
            totalTime={state.totalTime}
            mode={state.mode}
            isRunning={state.isRunning}
          />
        </View>

        {/* Controls */}
        <TimerControls
          mode={state.mode}
          isRunning={state.isRunning}
          strictMode={settings?.strictMode}
          onStart={start}
          onPause={pause}
          onReset={reset}
          onSkipBreak={skipBreak}
          hapticEnabled={settings?.hapticEnabled}
        />
      </View>
    </SafeAreaView>
  );
}

// Helper to get correct Russian word form
function getPomodoroWord(count: number): string {
  const lastTwo = count % 100;
  const lastOne = count % 10;

  if (lastTwo >= 11 && lastTwo <= 19) {
    return 'помидоров';
  }

  if (lastOne === 1) {
    return 'помидор';
  }

  if (lastOne >= 2 && lastOne <= 4) {
    return 'помидора';
  }

  return 'помидоров';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  todayLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  todayCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  todayNumber: {
    color: colors.text,
    fontSize: typography.h2,
    fontWeight: typography.bold,
  },
  todayUnit: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
