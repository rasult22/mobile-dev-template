import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, getModeLabel, getTimerColor } from '../../constants/theme';
import type { TimerMode } from '../../types';

interface SessionIndicatorProps {
  mode: TimerMode;
  currentPomodoro: number;
  totalPomodoros: number;
  taskTitle?: string;
}

export function SessionIndicator({
  mode,
  currentPomodoro,
  totalPomodoros,
  taskTitle,
}: SessionIndicatorProps) {
  const timerColor = getTimerColor(mode);
  const modeLabel = getModeLabel(mode);

  return (
    <View style={styles.container}>
      {/* Mode label */}
      <Text style={[styles.modeLabel, { color: timerColor }]}>
        {modeLabel}
      </Text>

      {/* Pomodoro counter */}
      {mode !== 'idle' && (
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            Помидор {currentPomodoro} из {totalPomodoros}
          </Text>
          <View style={styles.dotsContainer}>
            {Array.from({ length: totalPomodoros }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index < currentPomodoro
                        ? colors.primary
                        : colors.surfaceLight,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* Active task */}
      {taskTitle && (
        <View style={styles.taskContainer}>
          <Text style={styles.taskLabel}>Текущая задача:</Text>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {taskTitle}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  modeLabel: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  counterContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  counterText: {
    color: colors.textSecondary,
    fontSize: typography.bodySmall,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  taskContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  taskLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  taskTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: typography.medium,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
