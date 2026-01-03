import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { CircularTimer } from '../../components/timer/CircularTimer';
import { TimerControls } from '../../components/timer/TimerControls';
import { SessionIndicator } from '../../components/timer/SessionIndicator';
import { TaskSelectModal } from '../../components/tasks/TaskSelectModal';
import { useTimerContext } from '../../store/timerContext';
import { useTickingSound } from '../../hooks/useSound';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
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
    setActiveTask: setContextActiveTask,
  } = useTimerContext();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [todayPomodoros, setTodayPomodoros] = useState(0);
  const [taskModalVisible, setTaskModalVisible] = useState(false);

  // Calculate responsive timer size
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const availableHeight = height - insets.top - insets.bottom - 60; // 60 for tab bar
  // Reserve space for other elements: header(60) + session(80) + task button(60) + controls(100) + paddings(60)
  const reservedSpace = 360;
  const maxTimerSize = Math.min(width * 0.75, availableHeight - reservedSpace, 300);
  const timerSize = Math.max(maxTimerSize, 200); // Minimum 200px

  // Ticking sound
  const tickingEnabled = settings?.tickingEnabled ?? false;
  const { start: startTicking, stop: stopTicking } = useTickingSound({
    enabled: tickingEnabled,
  });

  // Control ticking sound based on timer state
  useEffect(() => {
    if (state.isRunning && state.mode === 'work' && tickingEnabled) {
      startTicking();
    } else {
      stopTicking();
    }

    return () => {
      stopTicking();
    };
  }, [state.isRunning, state.mode, tickingEnabled, startTicking, stopTicking]);

  // Load tasks list when screen is focused
  const loadTasks = useCallback(async () => {
    const tasks = await getTasks();
    setAllTasks(tasks);

    // Update active task
    if (state.activeTaskId) {
      const task = tasks.find((t) => t.id === state.activeTaskId);
      setActiveTask(task || null);
    } else {
      setActiveTask(null);
    }
  }, [state.activeTaskId]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  // Handle task selection
  const handleSelectTask = useCallback((taskId: string | undefined) => {
    setContextActiveTask(taskId);
  }, [setContextActiveTask]);

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
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
            size={timerSize}
          />
        </View>

        {/* Task selection button */}
        <Pressable
          style={({ pressed }) => [
            styles.taskButton,
            pressed && styles.taskButtonPressed,
          ]}
          onPress={() => setTaskModalVisible(true)}
        >
          {activeTask ? (
            <View style={styles.taskButtonContent}>
              <View style={styles.taskButtonInfo}>
                <Text style={styles.taskButtonLabel}>Текущая задача</Text>
                <Text style={styles.taskButtonTitle} numberOfLines={1}>
                  {activeTask.title}
                </Text>
              </View>
              <Ionicons name="swap-horizontal" size={20} color={colors.textSecondary} />
            </View>
          ) : (
            <View style={styles.taskButtonContent}>
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
              <Text style={styles.taskButtonPlaceholder}>Выбрать задачу</Text>
            </View>
          )}
        </Pressable>

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
      </ScrollView>

      {/* Task selection modal */}
      <TaskSelectModal
        visible={taskModalVisible}
        tasks={allTasks}
        selectedTaskId={state.activeTaskId}
        onSelect={handleSelectTask}
        onClose={() => setTaskModalVisible(false)}
      />
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.sm,
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
    paddingVertical: spacing.md,
  },
  taskButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskButtonPressed: {
    opacity: 0.8,
  },
  taskButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  taskButtonInfo: {
    flex: 1,
  },
  taskButtonLabel: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  taskButtonTitle: {
    fontSize: typography.body,
    fontWeight: typography.medium,
    color: colors.text,
  },
  taskButtonPlaceholder: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: typography.medium,
  },
});
