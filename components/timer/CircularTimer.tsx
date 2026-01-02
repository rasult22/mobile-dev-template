import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMER_SIZE = Math.min(SCREEN_WIDTH * 0.8, 320);
const STROKE_WIDTH = 12;
const RADIUS = (TIMER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface CircularTimerProps {
  timeRemaining: number; // in seconds
  totalTime: number; // in seconds
  mode: TimerMode;
  isRunning: boolean;
}

export function CircularTimer({
  timeRemaining,
  totalTime,
  mode,
  isRunning,
}: CircularTimerProps) {
  const progress = useDerivedValue(() => {
    if (totalTime === 0) return 0;
    return timeRemaining / totalTime;
  }, [timeRemaining, totalTime]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value);
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
    <View style={styles.container}>
      <Svg width={TIMER_SIZE} height={TIMER_SIZE} style={styles.svg}>
        <G rotation="-90" origin={`${TIMER_SIZE / 2}, ${TIMER_SIZE / 2}`}>
          {/* Background circle */}
          <Circle
            cx={TIMER_SIZE / 2}
            cy={TIMER_SIZE / 2}
            r={RADIUS}
            stroke={colors.surfaceLight}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={TIMER_SIZE / 2}
            cy={TIMER_SIZE / 2}
            r={RADIUS}
            stroke={timerColor}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
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
    width: TIMER_SIZE,
    height: TIMER_SIZE,
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
