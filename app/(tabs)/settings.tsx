import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { getSettings, updateSettings } from '../../store/storage';
import { getAllProfiles } from '../../constants/profiles';
import { ALARM_SOUNDS, AMBIENT_SOUNDS } from '../../constants/sounds';
import { useTimerContext } from '../../store/timerContext';
import type { Settings, AlarmSound, AmbientSound } from '../../types';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const { loadSettings } = useTimerContext();

  const loadData = useCallback(async () => {
    const loadedSettings = await getSettings();
    setSettings(loadedSettings);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleUpdateSetting = async <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    if (!settings) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await updateSettings({ [key]: value });
    await loadSettings(); // Refresh timer context
  };

  const handleSelectProfile = (profileId: string) => {
    Alert.alert(
      'Выбрать профиль?',
      'Таймер будет сброшен к настройкам выбранного профиля.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выбрать',
          onPress: () => handleUpdateSetting('activeProfileId', profileId),
        },
      ]
    );
  };

  const handleSelectAlarmSound = (soundId: AlarmSound) => {
    handleUpdateSetting('selectedAlarmSound', soundId);
  };

  const handleSelectAmbientSound = (soundId: AmbientSound) => {
    handleUpdateSetting('selectedAmbientSound', soundId);
    if (soundId !== 'none') {
      handleUpdateSetting('ambientSoundEnabled', true);
    }
  };

  if (!settings) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const allProfiles = getAllProfiles(settings.customProfiles);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Настройки</Text>

        {/* Timer Profiles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Профили таймера</Text>
          <Text style={styles.sectionDescription}>
            Выберите готовый профиль или создайте свой
          </Text>

          {allProfiles.map((profile) => (
            <Pressable
              key={profile.id}
              style={[
                styles.profileCard,
                profile.id === settings.activeProfileId && styles.profileCardActive,
              ]}
              onPress={() => handleSelectProfile(profile.id)}
            >
              <View style={styles.profileHeader}>
                <Text style={styles.profileName}>{profile.name}</Text>
                {profile.id === settings.activeProfileId && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </View>
              <Text style={styles.profileDescription}>{profile.description}</Text>
              <View style={styles.profileTimes}>
                <Text style={styles.profileTime}>
                  Работа: {profile.workDuration} мин
                </Text>
                <Text style={styles.profileTime}>
                  Перерыв: {profile.shortBreakDuration} мин
                </Text>
                <Text style={styles.profileTime}>
                  Длинный: {profile.longBreakDuration} мин
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Behavior Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Поведение</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Авто-старт перерывов</Text>
              <Text style={styles.settingDescription}>
                Автоматически начинать перерыв после рабочего интервала
              </Text>
            </View>
            <Switch
              value={settings.autoStartBreaks}
              onValueChange={(value) => handleUpdateSetting('autoStartBreaks', value)}
              trackColor={{ false: colors.surfaceLight, true: colors.primaryLight }}
              thumbColor={settings.autoStartBreaks ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Авто-старт работы</Text>
              <Text style={styles.settingDescription}>
                Автоматически начинать работу после перерыва
              </Text>
            </View>
            <Switch
              value={settings.autoStartWork}
              onValueChange={(value) => handleUpdateSetting('autoStartWork', value)}
              trackColor={{ false: colors.surfaceLight, true: colors.primaryLight }}
              thumbColor={settings.autoStartWork ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Строгий режим</Text>
              <Text style={styles.settingDescription}>
                Скрыть кнопку сброса во время работы (помидор неделим!)
              </Text>
            </View>
            <Switch
              value={settings.strictMode}
              onValueChange={(value) => handleUpdateSetting('strictMode', value)}
              trackColor={{ false: colors.surfaceLight, true: colors.primaryLight }}
              thumbColor={settings.strictMode ? colors.primary : colors.textMuted}
            />
          </View>
        </View>

        {/* Sound Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Звуки</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Звук уведомлений</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => handleUpdateSetting('soundEnabled', value)}
              trackColor={{ false: colors.surfaceLight, true: colors.primaryLight }}
              thumbColor={settings.soundEnabled ? colors.primary : colors.textMuted}
            />
          </View>

          {settings.soundEnabled && (
            <View style={styles.soundOptions}>
              {Object.values(ALARM_SOUNDS).map((sound) => (
                <Pressable
                  key={sound.id}
                  style={[
                    styles.soundOption,
                    settings.selectedAlarmSound === sound.id && styles.soundOptionActive,
                  ]}
                  onPress={() => handleSelectAlarmSound(sound.id as AlarmSound)}
                >
                  <Text
                    style={[
                      styles.soundOptionText,
                      settings.selectedAlarmSound === sound.id && styles.soundOptionTextActive,
                    ]}
                  >
                    {sound.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Тиканье таймера</Text>
            </View>
            <Switch
              value={settings.tickingEnabled}
              onValueChange={(value) => handleUpdateSetting('tickingEnabled', value)}
              trackColor={{ false: colors.surfaceLight, true: colors.primaryLight }}
              thumbColor={settings.tickingEnabled ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Тактильная отдача</Text>
            </View>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={(value) => handleUpdateSetting('hapticEnabled', value)}
              trackColor={{ false: colors.surfaceLight, true: colors.primaryLight }}
              thumbColor={settings.hapticEnabled ? colors.primary : colors.textMuted}
            />
          </View>
        </View>

        {/* Ambient Sounds */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Фоновые звуки</Text>
          <Text style={styles.sectionDescription}>
            Создайте рабочую атмосферу с помощью ambient-звуков
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Включить фоновые звуки</Text>
            </View>
            <Switch
              value={settings.ambientSoundEnabled}
              onValueChange={(value) => handleUpdateSetting('ambientSoundEnabled', value)}
              trackColor={{ false: colors.surfaceLight, true: colors.primaryLight }}
              thumbColor={settings.ambientSoundEnabled ? colors.primary : colors.textMuted}
            />
          </View>

          {settings.ambientSoundEnabled && (
            <View style={styles.soundOptions}>
              {Object.values(AMBIENT_SOUNDS)
                .filter((s) => s.id !== 'none')
                .map((sound) => (
                  <Pressable
                    key={sound.id}
                    style={[
                      styles.soundOption,
                      settings.selectedAmbientSound === sound.id && styles.soundOptionActive,
                    ]}
                    onPress={() => handleSelectAmbientSound(sound.id as AmbientSound)}
                  >
                    <Text
                      style={[
                        styles.soundOptionText,
                        settings.selectedAmbientSound === sound.id &&
                          styles.soundOptionTextActive,
                      ]}
                    >
                      {sound.name}
                    </Text>
                  </Pressable>
                ))}
            </View>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>О приложении</Text>
          <Text style={styles.aboutText}>
            Pomodoro Flow v1.0.0{'\n'}
            Основано на технике Помидора Франческо Чирилло
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: typography.body,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    color: colors.textMuted,
    fontSize: typography.bodySmall,
    marginBottom: spacing.md,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileCardActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  profileName: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.text,
  },
  profileDescription: {
    color: colors.textSecondary,
    fontSize: typography.bodySmall,
    marginBottom: spacing.sm,
  },
  profileTimes: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  profileTime: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: typography.medium,
  },
  settingDescription: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  soundOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  soundOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  soundOptionActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}20`,
  },
  soundOptionText: {
    color: colors.textSecondary,
    fontSize: typography.bodySmall,
  },
  soundOptionTextActive: {
    color: colors.primary,
    fontWeight: typography.medium,
  },
  aboutText: {
    color: colors.textMuted,
    fontSize: typography.bodySmall,
    textAlign: 'center',
    lineHeight: 22,
  },
});
