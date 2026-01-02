import type { TimerProfile } from '../types';

export const DEFAULT_PROFILES: TimerProfile[] = [
  {
    id: 'classic',
    name: 'Классика',
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 20,
    pomodorosPerCycle: 4,
    description: 'Стандартный режим по методике Чирилло. Идеален для большинства задач.',
    isCustom: false,
  },
  {
    id: 'deep-work',
    name: 'Глубокая работа',
    workDuration: 50,
    shortBreakDuration: 10,
    longBreakDuration: 30,
    pomodorosPerCycle: 4,
    description: 'Для задач с высокой когнитивной нагрузкой: программирование, анализ, исследования.',
    isCustom: false,
  },
  {
    id: 'creative',
    name: 'Творческая работа',
    workDuration: 45,
    shortBreakDuration: 15,
    longBreakDuration: 30,
    pomodorosPerCycle: 4,
    description: 'Для креативных задач, где мозгу нужно время, чтобы войти в состояние потока.',
    isCustom: false,
  },
  {
    id: 'learning',
    name: 'Обучение',
    workDuration: 45,
    shortBreakDuration: 15,
    longBreakDuration: 30,
    pomodorosPerCycle: 4,
    description: 'Оптимально для изучения нового материала с перерывами для усвоения информации.',
    isCustom: false,
  },
];

export const DEFAULT_PROFILE_ID = 'classic';

export const getProfileById = (
  id: string,
  customProfiles: TimerProfile[] = []
): TimerProfile | undefined => {
  return (
    DEFAULT_PROFILES.find((p) => p.id === id) ||
    customProfiles.find((p) => p.id === id)
  );
};

export const getAllProfiles = (customProfiles: TimerProfile[] = []): TimerProfile[] => {
  return [...DEFAULT_PROFILES, ...customProfiles];
};

// Validation constants
export const PROFILE_LIMITS = {
  workDuration: { min: 1, max: 120 },
  shortBreakDuration: { min: 1, max: 30 },
  longBreakDuration: { min: 5, max: 60 },
  pomodorosPerCycle: { min: 2, max: 6 },
  nameMaxLength: 30,
} as const;

// Helper to create a new custom profile
export const createCustomProfile = (
  name: string,
  workDuration: number,
  shortBreakDuration: number,
  longBreakDuration: number,
  pomodorosPerCycle: number
): TimerProfile => ({
  id: `custom-${Date.now()}`,
  name,
  workDuration,
  shortBreakDuration,
  longBreakDuration,
  pomodorosPerCycle,
  description: 'Пользовательский профиль',
  isCustom: true,
});
