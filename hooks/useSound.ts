import { useCallback, useRef, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import type { AlarmSound, AmbientSound } from '../types';

// Audio sources
const ALARM_SOURCES: Record<AlarmSound, number> = {
  bell: require('../assets/sounds/bell.mp3'),
  chime: require('../assets/sounds/chime.mp3'),
  digital: require('../assets/sounds/digital.mp3'),
  gentle: require('../assets/sounds/gentle.mp3'),
};

const AMBIENT_SOURCES: Record<Exclude<AmbientSound, 'none'>, number> = {
  rain: require('../assets/sounds/rain.mp3'),
  cafe: require('../assets/sounds/cafe.mp3'),
  whiteNoise: require('../assets/sounds/white-noise.mp3'),
};

interface UseSoundOptions {
  enabled?: boolean;
}

export function useAlarmSound({ enabled = true }: UseSoundOptions = {}) {
  const bellPlayer = useAudioPlayer(ALARM_SOURCES.bell);
  const chimePlayer = useAudioPlayer(ALARM_SOURCES.chime);
  const digitalPlayer = useAudioPlayer(ALARM_SOURCES.digital);
  const gentlePlayer = useAudioPlayer(ALARM_SOURCES.gentle);

  const getPlayer = useCallback((sound: AlarmSound) => {
    switch (sound) {
      case 'bell': return bellPlayer;
      case 'chime': return chimePlayer;
      case 'digital': return digitalPlayer;
      case 'gentle': return gentlePlayer;
    }
  }, [bellPlayer, chimePlayer, digitalPlayer, gentlePlayer]);

  const play = useCallback(async (sound: AlarmSound = 'bell') => {
    if (!enabled) return;

    try {
      const player = getPlayer(sound);
      player.seekTo(0);
      player.play();
    } catch (error) {
      console.error('Error playing alarm sound:', error);
    }
  }, [enabled, getPlayer]);

  const stop = useCallback(async () => {
    try {
      bellPlayer.pause();
      chimePlayer.pause();
      digitalPlayer.pause();
      gentlePlayer.pause();
    } catch (error) {
      console.error('Error stopping alarm sound:', error);
    }
  }, [bellPlayer, chimePlayer, digitalPlayer, gentlePlayer]);

  return { play, stop };
}

export function useTickingSound({ enabled = true }: UseSoundOptions = {}) {
  const isPlayingRef = useRef(false);

  const start = useCallback(async () => {
    if (!enabled || isPlayingRef.current) return;

    try {
      isPlayingRef.current = true;
      // Note: Ticking sound would require a separate short audio file
      // that loops. For now, this is a placeholder.
      console.log('Ticking sound not implemented yet');
    } catch (error) {
      console.error('Error starting ticking sound:', error);
    }
  }, [enabled]);

  const stop = useCallback(async () => {
    if (!isPlayingRef.current) return;

    try {
      isPlayingRef.current = false;
    } catch (error) {
      console.error('Error stopping ticking sound:', error);
    }
  }, []);

  return { start, stop, isPlaying: isPlayingRef.current };
}

export function useAmbientSound({ enabled = true }: UseSoundOptions = {}) {
  const rainPlayer = useAudioPlayer(AMBIENT_SOURCES.rain);
  const cafePlayer = useAudioPlayer(AMBIENT_SOURCES.cafe);
  const whiteNoisePlayer = useAudioPlayer(AMBIENT_SOURCES.whiteNoise);

  const currentSoundRef = useRef<AmbientSound | null>(null);
  const isPlayingRef = useRef(false);

  const getAllPlayers = useCallback(() => [rainPlayer, cafePlayer, whiteNoisePlayer],
    [rainPlayer, cafePlayer, whiteNoisePlayer]);

  const getPlayer = useCallback((sound: Exclude<AmbientSound, 'none'>) => {
    switch (sound) {
      case 'rain': return rainPlayer;
      case 'cafe': return cafePlayer;
      case 'whiteNoise': return whiteNoisePlayer;
    }
  }, [rainPlayer, cafePlayer, whiteNoisePlayer]);

  const play = useCallback(async (sound: AmbientSound) => {
    if (!enabled || sound === 'none') return;

    try {
      // Stop all other players first
      getAllPlayers().forEach(p => p.pause());

      const player = getPlayer(sound);
      player.loop = true;
      player.seekTo(0);
      player.play();

      currentSoundRef.current = sound;
      isPlayingRef.current = true;
    } catch (error) {
      console.error('Error playing ambient sound:', error);
    }
  }, [enabled, getAllPlayers, getPlayer]);

  const stop = useCallback(async () => {
    try {
      getAllPlayers().forEach(p => p.pause());
      isPlayingRef.current = false;
      currentSoundRef.current = null;
    } catch (error) {
      console.error('Error stopping ambient sound:', error);
    }
  }, [getAllPlayers]);

  const setVolume = useCallback(async (volume: number) => {
    try {
      getAllPlayers().forEach(p => {
        p.volume = volume;
      });
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }, [getAllPlayers]);

  return {
    play,
    stop,
    setVolume,
    isPlaying: isPlayingRef.current,
    currentSound: currentSoundRef.current,
  };
}
