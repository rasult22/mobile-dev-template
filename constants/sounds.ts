import type { AlarmSound, AmbientSound } from '../types';

export interface SoundOption {
  id: string;
  name: string;
  description: string;
}

export const ALARM_SOUNDS: Record<AlarmSound, SoundOption> = {
  bell: {
    id: 'bell',
    name: 'Колокольчик',
    description: 'Мягкий звук колокольчика',
  },
  chime: {
    id: 'chime',
    name: 'Перезвон',
    description: 'Нежный перезвон',
  },
  digital: {
    id: 'digital',
    name: 'Цифровой',
    description: 'Классический цифровой сигнал',
  },
  gentle: {
    id: 'gentle',
    name: 'Спокойный',
    description: 'Очень мягкий сигнал',
  },
};

export const AMBIENT_SOUNDS: Record<AmbientSound, SoundOption> = {
  rain: {
    id: 'rain',
    name: 'Дождь',
    description: 'Звук дождя за окном',
  },
  cafe: {
    id: 'cafe',
    name: 'Кафе',
    description: 'Атмосфера уютного кафе',
  },
  whiteNoise: {
    id: 'whiteNoise',
    name: 'Белый шум',
    description: 'Ровный фоновый шум',
  },
  none: {
    id: 'none',
    name: 'Без звука',
    description: 'Тишина',
  },
};

export const DEFAULT_ALARM_SOUND: AlarmSound = 'bell';
export const DEFAULT_AMBIENT_SOUND: AmbientSound = 'none';
