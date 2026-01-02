import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { TimerState, TimerMode, TimerProfile, Settings } from '../types';
import { getProfileById, DEFAULT_PROFILE_ID } from '../constants/profiles';
import { getSettings, incrementPomodoro, addSession, getTodayDate, generateId } from './storage';

// Timer actions
type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'TICK' }
  | { type: 'SKIP_BREAK' }
  | { type: 'SET_MODE'; mode: TimerMode; duration: number }
  | { type: 'SET_TASK'; taskId: string | undefined }
  | { type: 'COMPLETE_POMODORO' }
  | { type: 'SET_PROFILE'; profile: TimerProfile }
  | { type: 'LOAD_STATE'; state: Partial<TimerState> };

// Initial state
const initialState: TimerState = {
  mode: 'idle',
  timeRemaining: 25 * 60, // 25 minutes in seconds
  totalTime: 25 * 60,
  currentPomodoro: 1,
  isRunning: false,
  activeTaskId: undefined,
};

// Reducer
function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      return { ...state, isRunning: true };

    case 'PAUSE':
      return { ...state, isRunning: false };

    case 'RESET':
      return {
        ...state,
        isRunning: false,
        timeRemaining: state.totalTime,
      };

    case 'TICK':
      if (state.timeRemaining <= 0) {
        return state;
      }
      return { ...state, timeRemaining: state.timeRemaining - 1 };

    case 'SET_MODE':
      return {
        ...state,
        mode: action.mode,
        timeRemaining: action.duration,
        totalTime: action.duration,
        isRunning: false,
      };

    case 'SET_TASK':
      return { ...state, activeTaskId: action.taskId };

    case 'COMPLETE_POMODORO':
      return { ...state, currentPomodoro: state.currentPomodoro + 1 };

    case 'SET_PROFILE':
      return {
        ...state,
        timeRemaining: action.profile.workDuration * 60,
        totalTime: action.profile.workDuration * 60,
        mode: 'idle',
        isRunning: false,
        currentPomodoro: 1,
      };

    case 'LOAD_STATE':
      return { ...state, ...action.state };

    default:
      return state;
  }
}

// Context types
interface TimerContextType {
  state: TimerState;
  profile: TimerProfile;
  settings: Settings | null;

  // Actions
  start: () => void;
  pause: () => void;
  reset: () => void;
  skipBreak: () => void;
  setActiveTask: (taskId: string | undefined) => void;
  loadSettings: () => Promise<void>;
}

const TimerContext = createContext<TimerContextType | null>(null);

// Provider
interface TimerProviderProps {
  children: React.ReactNode;
}

export function TimerProvider({ children }: TimerProviderProps) {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [profile, setProfile] = React.useState<TimerProfile>(() =>
    getProfileById(DEFAULT_PROFILE_ID)!
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<string | null>(null);

  // Load settings on mount
  const loadSettings = useCallback(async () => {
    const loadedSettings = await getSettings();
    setSettings(loadedSettings);

    const loadedProfile = getProfileById(
      loadedSettings.activeProfileId,
      loadedSettings.customProfiles
    );

    if (loadedProfile) {
      setProfile(loadedProfile);
      dispatch({ type: 'SET_PROFILE', profile: loadedProfile });
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handle timer tick
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning]);

  // Handle timer completion
  useEffect(() => {
    if (state.timeRemaining === 0 && state.mode !== 'idle') {
      handleTimerComplete();
    }
  }, [state.timeRemaining, state.mode]);

  const handleTimerComplete = async () => {
    dispatch({ type: 'PAUSE' });

    // Record session
    if (sessionStartRef.current) {
      await addSession({
        id: generateId(),
        taskId: state.activeTaskId,
        startedAt: sessionStartRef.current,
        completedAt: new Date().toISOString(),
        durationMinutes: state.mode === 'work'
          ? profile.workDuration
          : state.mode === 'shortBreak'
            ? profile.shortBreakDuration
            : profile.longBreakDuration,
        type: state.mode as 'work' | 'shortBreak' | 'longBreak',
      });
      sessionStartRef.current = null;
    }

    if (state.mode === 'work') {
      // Increment stats
      await incrementPomodoro(getTodayDate(), profile.workDuration);

      // Check if we need long break
      const isLongBreakTime = state.currentPomodoro >= profile.pomodorosPerCycle;

      if (isLongBreakTime) {
        dispatch({
          type: 'SET_MODE',
          mode: 'longBreak',
          duration: profile.longBreakDuration * 60
        });
        dispatch({ type: 'LOAD_STATE', state: { currentPomodoro: 1 } });
      } else {
        dispatch({ type: 'COMPLETE_POMODORO' });
        dispatch({
          type: 'SET_MODE',
          mode: 'shortBreak',
          duration: profile.shortBreakDuration * 60
        });
      }

      // Auto-start break if enabled
      if (settings?.autoStartBreaks) {
        setTimeout(() => dispatch({ type: 'START' }), 5000);
      }
    } else {
      // Break completed, go back to work mode
      dispatch({
        type: 'SET_MODE',
        mode: 'work',
        duration: profile.workDuration * 60
      });

      // Auto-start work if enabled
      if (settings?.autoStartWork) {
        setTimeout(() => dispatch({ type: 'START' }), 5000);
      }
    }
  };

  // Actions
  const start = useCallback(() => {
    if (state.mode === 'idle') {
      dispatch({
        type: 'SET_MODE',
        mode: 'work',
        duration: profile.workDuration * 60
      });
    }
    sessionStartRef.current = new Date().toISOString();
    dispatch({ type: 'START' });
  }, [state.mode, profile.workDuration]);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
  }, []);

  const reset = useCallback(() => {
    sessionStartRef.current = null;
    dispatch({ type: 'RESET' });
    dispatch({
      type: 'SET_MODE',
      mode: 'idle',
      duration: profile.workDuration * 60
    });
    dispatch({ type: 'LOAD_STATE', state: { currentPomodoro: 1 } });
  }, [profile.workDuration]);

  const skipBreak = useCallback(() => {
    if (state.mode === 'shortBreak' || state.mode === 'longBreak') {
      dispatch({
        type: 'SET_MODE',
        mode: 'work',
        duration: profile.workDuration * 60
      });
    }
  }, [state.mode, profile.workDuration]);

  const setActiveTask = useCallback((taskId: string | undefined) => {
    dispatch({ type: 'SET_TASK', taskId });
  }, []);

  const value: TimerContextType = {
    state,
    profile,
    settings,
    start,
    pause,
    reset,
    skipBreak,
    setActiveTask,
    loadSettings,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}

// Hook
export function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
}
