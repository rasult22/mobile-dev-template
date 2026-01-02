import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  getTodayTaskIds,
  addToTodayTasks,
  removeFromTodayTasks,
  generateId,
} from '../../store/storage';
import { useTimerContext } from '../../store/timerContext';
import type { Task } from '../../types';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayTaskIds, setTodayTaskIds] = useState<string[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { setActiveTask, state } = useTimerContext();

  const loadData = useCallback(async () => {
    const [loadedTasks, loadedTodayIds] = await Promise.all([
      getTasks(),
      getTodayTaskIds(),
    ]);
    setTasks(loadedTasks);
    setTodayTaskIds(loadedTodayIds);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const todayTasks = tasks.filter((t) => todayTaskIds.includes(t.id));
  const otherTasks = tasks.filter((t) => !todayTaskIds.includes(t.id) && !t.isCompleted);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    const task: Task = {
      id: generateId(),
      title: newTaskTitle.trim(),
      estimatedPomodoros: 1,
      completedPomodoros: 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    await addTask(task);
    await addToTodayTasks(task.id);
    setNewTaskTitle('');
    setIsAdding(false);
    loadData();
  };

  const handleToggleToday = async (taskId: string, isInToday: boolean) => {
    if (isInToday) {
      await removeFromTodayTasks(taskId);
    } else {
      await addToTodayTasks(taskId);
    }
    loadData();
  };

  const handleToggleComplete = async (task: Task) => {
    await updateTask(task.id, {
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? new Date().toISOString() : undefined,
    });
    loadData();
  };

  const handleDelete = (taskId: string) => {
    Alert.alert(
      'Удалить задачу?',
      'Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(taskId);
            await removeFromTodayTasks(taskId);
            if (state.activeTaskId === taskId) {
              setActiveTask(undefined);
            }
            loadData();
          },
        },
      ]
    );
  };

  const handleSelectForTimer = (task: Task) => {
    setActiveTask(task.id);
    Alert.alert('Задача выбрана', `"${task.title}" будет отображаться на таймере.`);
  };

  const handleUpdatePomodoros = async (taskId: string, delta: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newEstimate = Math.max(1, Math.min(10, task.estimatedPomodoros + delta));
    await updateTask(taskId, { estimatedPomodoros: newEstimate });
    loadData();
  };

  const renderTask = (task: Task, isInToday: boolean) => (
    <View style={styles.taskItem} key={task.id}>
      <Pressable
        style={styles.checkbox}
        onPress={() => handleToggleComplete(task)}
      >
        <Ionicons
          name={task.isCompleted ? 'checkbox' : 'square-outline'}
          size={24}
          color={task.isCompleted ? colors.success : colors.textMuted}
        />
      </Pressable>

      <Pressable
        style={styles.taskContent}
        onPress={() => handleSelectForTimer(task)}
        onLongPress={() => handleDelete(task.id)}
      >
        <Text
          style={[
            styles.taskTitle,
            task.isCompleted && styles.taskCompleted,
            state.activeTaskId === task.id && styles.taskActive,
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        <View style={styles.pomodoroEstimate}>
          <Pressable onPress={() => handleUpdatePomodoros(task.id, -1)}>
            <Ionicons name="remove-circle-outline" size={20} color={colors.textMuted} />
          </Pressable>
          <Text style={styles.pomodoroCount}>
            {task.completedPomodoros}/{task.estimatedPomodoros}
          </Text>
          <Pressable onPress={() => handleUpdatePomodoros(task.id, 1)}>
            <Ionicons name="add-circle-outline" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      </Pressable>

      <Pressable
        style={styles.todayButton}
        onPress={() => handleToggleToday(task.id, isInToday)}
      >
        <Ionicons
          name={isInToday ? 'today' : 'today-outline'}
          size={20}
          color={isInToday ? colors.primary : colors.textMuted}
        />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Задачи</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setIsAdding(true)}
        >
          <Ionicons name="add" size={24} color={colors.text} />
        </Pressable>
      </View>

      {/* Add task input */}
      {isAdding && (
        <View style={styles.addContainer}>
          <TextInput
            style={styles.input}
            placeholder="Название задачи..."
            placeholderTextColor={colors.textMuted}
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            autoFocus
            onSubmitEditing={handleAddTask}
          />
          <Pressable style={styles.saveButton} onPress={handleAddTask}>
            <Text style={styles.saveButtonText}>Добавить</Text>
          </Pressable>
          <Pressable onPress={() => setIsAdding(false)}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </Pressable>
        </View>
      )}

      {/* Decomposition hint */}
      <View style={styles.hintContainer}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
        <Text style={styles.hintText}>
          Задачи более 5-7 помидоров лучше разбить. Менее 1 - объединить.
        </Text>
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {/* Today's tasks */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>План на сегодня</Text>
              {todayTasks.length === 0 ? (
                <Text style={styles.emptyText}>
                  Выберите задачи для работы сегодня
                </Text>
              ) : (
                todayTasks.map((task) => renderTask(task, true))
              )}
            </View>

            {/* Other tasks */}
            {otherTasks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Все задачи</Text>
                {otherTasks.map((task) => renderTask(task, false))}
              </View>
            )}
          </>
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: typography.body,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  saveButtonText: {
    color: colors.text,
    fontWeight: typography.medium,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  hintText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.body,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  checkbox: {
    padding: spacing.xs,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    color: colors.text,
    fontSize: typography.body,
    marginBottom: spacing.xs,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  taskActive: {
    color: colors.primary,
  },
  pomodoroEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pomodoroCount: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    minWidth: 30,
    textAlign: 'center',
  },
  todayButton: {
    padding: spacing.xs,
  },
});
