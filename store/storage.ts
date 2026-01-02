import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task, Settings, DayStats, CompletedSession } from '../types';
import { STORAGE_KEYS } from '../types';
import { DEFAULT_PROFILE_ID } from '../constants/profiles';
import { DEFAULT_ALARM_SOUND } from '../constants/sounds';

// Default settings
export const DEFAULT_SETTINGS: Settings = {
  activeProfileId: DEFAULT_PROFILE_ID,
  customProfiles: [],
  autoStartBreaks: true,
  autoStartWork: false,
  strictMode: false,
  soundEnabled: true,
  tickingEnabled: false,
  selectedAlarmSound: DEFAULT_ALARM_SOUND,
  hapticEnabled: true,
  ambientSoundEnabled: false,
  selectedAmbientSound: undefined,
};

// Generic storage helpers
async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) {
      return defaultValue;
    }
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return defaultValue;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
    throw error;
  }
}

// Tasks
export async function getTasks(): Promise<Task[]> {
  return getItem<Task[]>(STORAGE_KEYS.TASKS, []);
}

export async function setTasks(tasks: Task[]): Promise<void> {
  return setItem(STORAGE_KEYS.TASKS, tasks);
}

export async function addTask(task: Task): Promise<void> {
  const tasks = await getTasks();
  tasks.push(task);
  await setTasks(tasks);
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
  const tasks = await getTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    await setTasks(tasks);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const tasks = await getTasks();
  const filtered = tasks.filter((t) => t.id !== taskId);
  await setTasks(filtered);
}

// Today's tasks (task IDs selected for today)
export async function getTodayTaskIds(): Promise<string[]> {
  return getItem<string[]>(STORAGE_KEYS.TODAY_TASKS, []);
}

export async function setTodayTaskIds(taskIds: string[]): Promise<void> {
  return setItem(STORAGE_KEYS.TODAY_TASKS, taskIds);
}

export async function addToTodayTasks(taskId: string): Promise<void> {
  const todayIds = await getTodayTaskIds();
  if (!todayIds.includes(taskId)) {
    todayIds.push(taskId);
    await setTodayTaskIds(todayIds);
  }
}

export async function removeFromTodayTasks(taskId: string): Promise<void> {
  const todayIds = await getTodayTaskIds();
  const filtered = todayIds.filter((id) => id !== taskId);
  await setTodayTaskIds(filtered);
}

// Settings
export async function getSettings(): Promise<Settings> {
  return getItem<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export async function setSettings(settings: Settings): Promise<void> {
  return setItem(STORAGE_KEYS.SETTINGS, settings);
}

export async function updateSettings(updates: Partial<Settings>): Promise<void> {
  const settings = await getSettings();
  await setSettings({ ...settings, ...updates });
}

// Statistics
export async function getAllStats(): Promise<Record<string, DayStats>> {
  return getItem<Record<string, DayStats>>(STORAGE_KEYS.STATS, {});
}

export async function getDayStats(date: string): Promise<DayStats> {
  const allStats = await getAllStats();
  return (
    allStats[date] || {
      date,
      completedPomodoros: 0,
      completedTasks: [],
      totalWorkMinutes: 0,
    }
  );
}

export async function updateDayStats(date: string, updates: Partial<DayStats>): Promise<void> {
  const allStats = await getAllStats();
  const currentStats = allStats[date] || {
    date,
    completedPomodoros: 0,
    completedTasks: [],
    totalWorkMinutes: 0,
  };
  allStats[date] = { ...currentStats, ...updates };
  await setItem(STORAGE_KEYS.STATS, allStats);
}

export async function incrementPomodoro(date: string, workMinutes: number): Promise<void> {
  const stats = await getDayStats(date);
  await updateDayStats(date, {
    completedPomodoros: stats.completedPomodoros + 1,
    totalWorkMinutes: stats.totalWorkMinutes + workMinutes,
  });
}

// Sessions history
export async function getSessions(): Promise<CompletedSession[]> {
  return getItem<CompletedSession[]>(STORAGE_KEYS.SESSIONS, []);
}

export async function addSession(session: CompletedSession): Promise<void> {
  const sessions = await getSessions();
  sessions.push(session);
  // Keep only last 100 sessions to prevent storage bloat
  const trimmed = sessions.slice(-100);
  await setItem(STORAGE_KEYS.SESSIONS, trimmed);
}

// Clear all data (for testing/reset)
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.TASKS,
    STORAGE_KEYS.TODAY_TASKS,
    STORAGE_KEYS.SETTINGS,
    STORAGE_KEYS.STATS,
    STORAGE_KEYS.SESSIONS,
  ]);
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
