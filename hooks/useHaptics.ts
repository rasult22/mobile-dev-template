import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

interface UseHapticsOptions {
  enabled?: boolean;
}

export function useHaptics({ enabled = true }: UseHapticsOptions = {}) {
  const light = useCallback(() => {
    if (enabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [enabled]);

  const medium = useCallback(() => {
    if (enabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [enabled]);

  const heavy = useCallback(() => {
    if (enabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [enabled]);

  const success = useCallback(() => {
    if (enabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [enabled]);

  const warning = useCallback(() => {
    if (enabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [enabled]);

  const error = useCallback(() => {
    if (enabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [enabled]);

  const selection = useCallback(() => {
    if (enabled) {
      Haptics.selectionAsync();
    }
  }, [enabled]);

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
  };
}
