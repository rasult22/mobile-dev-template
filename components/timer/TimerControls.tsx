import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography, getTimerColor } from '../../constants/theme';
import type { TimerMode } from '../../types';

interface TimerControlsProps {
  mode: TimerMode;
  isRunning: boolean;
  strictMode?: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkipBreak: () => void;
  hapticEnabled?: boolean;
}

export function TimerControls({
  mode,
  isRunning,
  strictMode = false,
  onStart,
  onPause,
  onReset,
  onSkipBreak,
  hapticEnabled = true,
}: TimerControlsProps) {
  const timerColor = getTimerColor(mode);
  const isBreak = mode === 'shortBreak' || mode === 'longBreak';
  const showStopButton = !strictMode || !isRunning || mode === 'idle';

  const handlePress = (action: () => void) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    action();
  };

  return (
    <View style={styles.container}>
      {/* Main action button */}
      {!isRunning ? (
        <Pressable
          style={({ pressed }) => [
            styles.mainButton,
            { backgroundColor: timerColor },
            pressed && styles.buttonPressed,
          ]}
          onPress={() => handlePress(onStart)}
        >
          <Text style={styles.mainButtonText}>
            {mode === 'idle' ? 'Старт' : 'Продолжить'}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.mainButton,
            { backgroundColor: colors.surfaceLight },
            pressed && styles.buttonPressed,
          ]}
          onPress={() => handlePress(onPause)}
        >
          <Text style={[styles.mainButtonText, { color: colors.text }]}>
            Пауза
          </Text>
        </Pressable>
      )}

      {/* Secondary buttons */}
      <View style={styles.secondaryContainer}>
        {/* Stop/Reset button - hidden in strict mode during work */}
        {showStopButton && (
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => handlePress(onReset)}
          >
            <Text style={styles.secondaryButtonText}>Сбросить</Text>
          </Pressable>
        )}

        {/* Skip break button - only during breaks */}
        {isBreak && (
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => handlePress(onSkipBreak)}
          >
            <Text style={styles.secondaryButtonText}>Пропустить</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  mainButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.full,
    minWidth: 200,
    alignItems: 'center',
  },
  mainButtonText: {
    color: colors.text,
    fontSize: typography.h4,
    fontWeight: typography.semibold,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  secondaryContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: typography.medium,
  },
});
