import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { CircularTimer } from '../../components/timer/CircularTimer';
import { TimerControls } from '../../components/timer/TimerControls';
import { SessionIndicator } from '../../components/timer/SessionIndicator';
import { TaskSelectModal } from '../../components/tasks/TaskSelectModal';
import { useTimerContext } from '../../store/timerContext';
import { useTickingSound, useAlarmSound, useAmbientSound } from '../../hooks/useSound';
import { useNotifications } from '../../hooks/useNotifications';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { getTasks, getDayStats, getTodayDate, updateTask } from '../../store/storage';
import type { Task, TimerMode, AlarmSound, AmbientSound } from '../../types';

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

  // Track state for timer completion detection
  const prevModeRef = useRef<TimerMode>(state.mode);
  const completionHandledRef = useRef<boolean>(false);

  // Calculate responsive timer size
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const availableHeight = height - insets.top - insets.bottom - 60; // 60 for tab bar
  // Reserve space for other elements: header(60) + session(80) + task button(60) + controls(100) + paddings(60)
  const reservedSpace = 360;
  const maxTimerSize = Math.min(width * 0.75, availableHeight - reservedSpace, 300);
  const timerSize = Math.max(maxTimerSize, 200); // Minimum 200px

  // Sound hooks
  const soundEnabled = settings?.soundEnabled ?? true;
  const tickingEnabled = settings?.tickingEnabled ?? false;
  const ambientEnabled = settings?.ambientSoundEnabled ?? false;
  const selectedAlarmSound = (settings?.selectedAlarmSound ?? 'bell') as AlarmSound;
  const selectedAmbientSound = (settings?.selectedAmbientSound ?? 'none') as AmbientSound;

  const { start: startTicking, stop: stopTicking } = useTickingSound({
    enabled: tickingEnabled,
  });
  const { play: playAlarm } = useAlarmSound({ enabled: soundEnabled });
  const { play: playAmbient, stop: stopAmbient } = useAmbientSound({
    enabled: ambientEnabled,
  });

  // Notifications
  const { sendImmediateNotification } = useNotifications();

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

  // Control ambient sound based on timer state
  useEffect(() => {
    if (state.isRunning && state.mode === 'work' && ambientEnabled && selectedAmbientSound !== 'none') {
      playAmbient(selectedAmbientSound);
    } else {
      stopAmbient();
    }

    return () => {
      stopAmbient();
    };
  }, [state.isRunning, state.mode, ambientEnabled, selectedAmbientSound, playAmbient, stopAmbient]);

  // Helper to load today stats
  const loadTodayStats = useCallback(async () => {
    const stats = await getDayStats(getTodayDate());
    setTodayPomodoros(stats.completedPomodoros);
  }, []);

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

  // Detect timer completion (when timeRemaining hits 0)
  useEffect(() => {
    // Timer completed when time reaches 0 and we're in an active mode
    const timerJustCompleted = state.timeRemaining === 0 &&
      state.mode !== 'idle' &&
      !completionHandledRef.current;

    if (timerJustCompleted) {
      completionHandledRef.current = true;
      const completedMode = state.mode;

      // Play alarm sound
      if (soundEnabled) {
        playAlarm(selectedAlarmSound);
      }

      // Haptic feedback
      if (settings?.hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Send notification
      const isWorkComplete = completedMode === 'work';
      const title = isWorkComplete ? 'Помодоро завершён!' : 'Перерыв окончен!';
      const body = isWorkComplete
        ? 'Время сделать перерыв'
        : 'Готов к новому помодоро?';
      sendImmediateNotification(title, body);

      // Increment task pomodoros if work session completed
      if (isWorkComplete && state.activeTaskId) {
        (async () => {
          const tasks = await getTasks();
          const task = tasks.find(t => t.id === state.activeTaskId);
          if (task) {
            await updateTask(state.activeTaskId!, {
              completedPomodoros: task.completedPomodoros + 1,
            });
          }
        })();
      }

      // Reload today stats and tasks
      loadTodayStats();
      loadTasks();
    }
  }, [state.timeRemaining, state.mode, state.activeTaskId,
      soundEnabled, selectedAlarmSound, settings?.hapticEnabled,
      playAlarm, sendImmediateNotification, loadTodayStats, loadTasks]);

  // Reset completion flag when mode changes (new timer started)
  useEffect(() => {
    if (prevModeRef.current !== state.mode) {
      completionHandledRef.current = false;
      prevModeRef.current = state.mode;
    }
  }, [state.mode]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  // Handle task selection
  const handleSelectTask = useCallback((taskId: string | undefined) => {
    setContextActiveTask(taskId);
  }, [setContextActiveTask]);

  // Load today's stats on mount
  useEffect(() => {
    loadTodayStats();
  }, [loadTodayStats]);

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
