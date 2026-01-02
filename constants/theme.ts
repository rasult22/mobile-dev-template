export const colors = {
  // Background colors
  background: '#121212',
  surface: '#1E1E1E',
  surfaceLight: '#2A2A2A',

  // Primary colors (tomato red for work)
  primary: '#E53935',
  primaryDark: '#B71C1C',
  primaryLight: '#FF6F60',

  // Secondary colors (green for breaks)
  secondary: '#4CAF50',
  secondaryDark: '#2E7D32',
  secondaryLight: '#81C784',

  // Accent colors
  accent: '#FFC107', // Amber for warnings/highlights

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: '#757575',

  // Border and divider
  border: '#333333',
  divider: '#404040',

  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',

  // Timer specific
  timerWork: '#E53935',
  timerShortBreak: '#4CAF50',
  timerLongBreak: '#2196F3',
  timerIdle: '#757575',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  // Font sizes
  h1: 48,
  h2: 32,
  h3: 24,
  h4: 20,
  body: 16,
  bodySmall: 14,
  caption: 12,

  // Font weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 8,
  },
} as const;

// Timer colors based on mode
export const getTimerColor = (mode: 'work' | 'shortBreak' | 'longBreak' | 'idle') => {
  switch (mode) {
    case 'work':
      return colors.timerWork;
    case 'shortBreak':
      return colors.timerShortBreak;
    case 'longBreak':
      return colors.timerLongBreak;
    default:
      return colors.timerIdle;
  }
};

// Mode labels in Russian
export const getModeLabel = (mode: 'work' | 'shortBreak' | 'longBreak' | 'idle') => {
  switch (mode) {
    case 'work':
      return 'Работа';
    case 'shortBreak':
      return 'Короткий перерыв';
    case 'longBreak':
      return 'Длинный перерыв';
    default:
      return 'Готов к работе';
  }
};
