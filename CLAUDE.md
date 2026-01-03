# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npx expo start       # Start Expo dev server
npx expo run:ios     # Run on iOS simulator
npx expo run:android # Run on Android emulator
npm run lint         # Run ESLint
npx tsc --noEmit     # Type check without emitting
```

## Project Constraints

- **Dark theme only** - do not add light theme support
- **TanStack Query** for async state management
- **Offline-first** - no server, no auth, local storage only (AsyncStorage)
- **Russian language** for all UI text

## Architecture

### Stack
- Expo SDK 54 with React Native 0.81.5
- Expo Router (file-based routing) with bottom tabs
- React Native Reanimated for animations
- react-native-svg for circular timer visualization
- expo-audio for sound playback
- expo-haptics for tactile feedback

### Key Directories

- `app/(tabs)/` - Main screens: Timer (index), Tasks, Stats, Settings
- `store/timerContext.tsx` - Timer state management via React Context + useReducer
- `store/storage.ts` - AsyncStorage wrapper for persistence
- `hooks/useSound.ts` - Audio playback hooks (alarm, ticking, ambient sounds)
- `constants/theme.ts` - Dark theme colors, typography, spacing
- `constants/profiles.ts` - Timer presets (Classic 25/5, Deep Work 50/10, etc.)
- `types/index.ts` - TypeScript interfaces for Task, TimerState, Settings, etc.

### Timer Flow
1. `TimerProvider` wraps the app and manages timer state
2. Timer uses `setInterval` for countdown, dispatches `TICK` action every second
3. On timer completion, auto-transitions between work/break modes
4. Sessions are recorded to AsyncStorage for statistics

### Data Persistence
All data stored in AsyncStorage with keys prefixed `@pomodoro/`:
- `tasks` - Activity inventory
- `settings` - User preferences and active profile
- `stats` - Daily pomodoro counts
- `sessions` - Completed work/break sessions
