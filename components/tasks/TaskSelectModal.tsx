import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import type { Task } from '../../types';

interface TaskSelectModalProps {
  visible: boolean;
  tasks: Task[];
  selectedTaskId?: string;
  onSelect: (taskId: string | undefined) => void;
  onClose: () => void;
}

export function TaskSelectModal({
  visible,
  tasks,
  selectedTaskId,
  onSelect,
  onClose,
}: TaskSelectModalProps) {
  const incompleteTasks = tasks.filter((t) => !t.isCompleted);

  const renderTask = ({ item }: { item: Task }) => {
    const isSelected = item.id === selectedTaskId;
    const progress = item.estimatedPomodoros > 0
      ? item.completedPomodoros / item.estimatedPomodoros
      : 0;

    return (
      <Pressable
        style={[styles.taskItem, isSelected && styles.taskItemSelected]}
        onPress={() => {
          onSelect(item.id);
          onClose();
        }}
      >
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.taskMeta}>
            <Text style={styles.taskProgress}>
              {item.completedPomodoros}/{item.estimatedPomodoros} помидоров
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
          </View>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Выбрать задачу</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          {incompleteTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Нет активных задач</Text>
              <Text style={styles.emptyHint}>
                Добавьте задачи на вкладке «Задачи»
              </Text>
            </View>
          ) : (
            <>
              {selectedTaskId && (
                <Pressable
                  style={styles.clearButton}
                  onPress={() => {
                    onSelect(undefined);
                    onClose();
                  }}
                >
                  <Ionicons name="close-circle-outline" size={20} color={colors.textSecondary} />
                  <Text style={styles.clearButtonText}>Работать без задачи</Text>
                </Pressable>
              )}
              <FlatList
                data={incompleteTasks}
                keyExtractor={(item) => item.id}
                renderItem={renderTask}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  list: {
    padding: spacing.md,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskItemSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  taskContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  taskTitle: {
    fontSize: typography.body,
    fontWeight: typography.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  taskMeta: {
    gap: spacing.xs,
  },
  taskProgress: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    borderStyle: 'dashed',
  },
  clearButtonText: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.body,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyHint: {
    fontSize: typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
