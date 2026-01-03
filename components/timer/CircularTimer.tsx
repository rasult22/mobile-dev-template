import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, getTimerColor } from '../../constants/theme';
import type { TimerMode } from '../../types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const STROKE_WIDTH = 12;

interface CircularTimerProps {
  timeRemaining: number; // in seconds
  totalTime: number; // in seconds
  mode: TimerMode;
  isRunning: boolean;
  size?: number;
}

const DEFAULT_SIZE = 280;

export function CircularTimer({
  timeRemaining,
  totalTime,
  mode,
  isRunning,
  size = DEFAULT_SIZE,
}: CircularTimerProps) {
  const timerSize = size;
  const radius = (timerSize - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useDerivedValue(() => {
    if (totalTime === 0) return 0;
    return timeRemaining / totalTime;
  }, [timeRemaining, totalTime]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return {
      strokeDashoffset: withTiming(strokeDashoffset, {
        duration: 300,
        easing: Easing.linear,
      }),
    };
  });

  const timerColor = getTimerColor(mode);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { width: timerSize, height: timerSize }]}>
      <Svg width={timerSize} height={timerSize} style={styles.svg}>
        <G rotation="-90" origin={`${timerSize / 2}, ${timerSize / 2}`}>
          {/* Background circle */}
          <Circle
            cx={timerSize / 2}
            cy={timerSize / 2}
            r={radius}
            stroke={colors.surfaceLight}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={timerSize / 2}
            cy={timerSize / 2}
            r={radius}
            stroke={timerColor}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Time display in center */}
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, { color: timerColor }]}>
          {formatTime(timeRemaining)}
        </Text>
        {isRunning && (
          <View style={[styles.runningIndicator, { backgroundColor: timerColor }]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: typography.h1 + 16,
    fontWeight: typography.bold,
    fontVariant: ['tabular-nums'],
  },
  runningIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
});
