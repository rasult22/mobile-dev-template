// Task types
export interface Task {
  id: string;
  title: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
}

// Timer profile types
export interface TimerProfile {
  id: string;
  name: string;
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  pomodorosPerCycle: number; // 2-6
  description: string;
  isCustom?: boolean;
}

// Timer state types
export type TimerMode = 'work' | 'shortBreak' | 'longBreak' | 'idle';

export interface TimerState {
  mode: TimerMode;
  timeRemaining: number; // in seconds
  totalTime: number; // in seconds (for progress calculation)
  currentPomodoro: number; // 1 to pomodorosPerCycle
  isRunning: boolean;
  activeTaskId?: string;
}

// Settings types
export interface Settings {
  activeProfileId: string;
  customProfiles: TimerProfile[];
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  strictMode: boolean;
  soundEnabled: boolean;
  tickingEnabled: boolean;
  selectedAlarmSound: string;
  hapticEnabled: boolean;
  ambientSoundEnabled: boolean;
  selectedAmbientSound?: string;
}

// Statistics types
export interface DayStats {
  date: string; // YYYY-MM-DD format
  completedPomodoros: number;
  completedTasks: string[]; // task IDs
  totalWorkMinutes: number;
}

export interface CompletedSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  type: 'work' | 'shortBreak' | 'longBreak';
}

// Sound types
export type AlarmSound = 'bell' | 'chime' | 'digital' | 'gentle';
export type AmbientSound = 'rain' | 'cafe' | 'whiteNoise' | 'none';

// Storage keys
export const STORAGE_KEYS = {
  TASKS: '@pomodoro/tasks',
  TODAY_TASKS: '@pomodoro/todayTasks',
  SETTINGS: '@pomodoro/settings',
  STATS: '@pomodoro/stats',
  SESSIONS: '@pomodoro/sessions',
} as const;
