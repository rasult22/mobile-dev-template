import { useCallback, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type { TimerMode } from '../types';
import { getModeLabel } from '../constants/theme';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface UseNotificationsOptions {
  enabled?: boolean;
}

export function useNotifications({ enabled = true }: UseNotificationsOptions = {}) {
  const scheduledNotificationRef = useRef<string | null>(null);

  // Request permissions on mount
  useEffect(() => {
    if (enabled) {
      registerForNotifications();
    }
  }, [enabled]);

  const registerForNotifications = useCallback(async () => {
    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('timer', {
        name: 'Timer Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E53935',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return false;
    }

    return true;
  }, []);

  const scheduleTimerEndNotification = useCallback(async (
    secondsRemaining: number,
    mode: TimerMode
  ) => {
    if (!enabled) return;

    // Cancel any existing scheduled notification
    await cancelScheduledNotification();

    try {
      const modeLabel = getModeLabel(mode);
      const nextMode = mode === 'work' ? 'перерыв' : 'работу';

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${modeLabel} завершен!`,
          body: `Время переходить к ${nextMode}.`,
          sound: true,
          data: { mode },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsRemaining,
        },
      });

      scheduledNotificationRef.current = notificationId;
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }, [enabled]);

  const cancelScheduledNotification = useCallback(async () => {
    if (scheduledNotificationRef.current) {
      await Notifications.cancelScheduledNotificationAsync(
        scheduledNotificationRef.current
      );
      scheduledNotificationRef.current = null;
    }
  }, []);

  const sendImmediateNotification = useCallback(async (
    title: string,
    body: string
  ) => {
    if (!enabled) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null, // Immediate
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [enabled]);

  const cancelAllNotifications = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    scheduledNotificationRef.current = null;
  }, []);

  return {
    registerForNotifications,
    scheduleTimerEndNotification,
    cancelScheduledNotification,
    sendImmediateNotification,
    cancelAllNotifications,
  };
}

// Hook to listen for notification responses
export function useNotificationResponse(
  onResponse: (response: Notifications.NotificationResponse) => void
) {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        onResponse(response);
      }
    );

    return () => subscription.remove();
  }, [onResponse]);
}
