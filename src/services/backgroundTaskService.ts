import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notificationService';

// Task names
const BACKGROUND_FETCH_TASK = 'background-gemini-task';
const ACTIVE_TASKS_KEY = '@active_gemini_tasks';

export interface GeminiBackgroundTask {
  id: string;
  projectId: string;
  sessionId: string;
  message: string;
  startTime: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  projectName?: string;
}

class BackgroundTaskService {
  private isRegistered = false;

  /**
   * Initialize background task service
   */
  async initialize(): Promise<boolean> {
    try {
      // Define the background fetch task
      this.defineBackgroundTask();

      // Register the background fetch task
      await this.registerBackgroundFetch();

      console.log('Background task service initialized');
      return true;
    } catch (error) {
      console.error('Error initializing background task service:', error);
      return false;
    }
  }

  /**
   * Define the background task handler
   */
  private defineBackgroundTask() {
    TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
      try {
        console.log('Background fetch task running...');

        // Check for active tasks
        const activeTasks = await this.getActiveTasks();

        // Process each active task
        for (const task of activeTasks) {
          if (task.status === 'running') {
            // Calculate elapsed time
            const elapsedMinutes = Math.floor(
              (Date.now() - task.startTime) / 60000
            );

            // Show progress notification every few minutes
            if (elapsedMinutes > 0 && elapsedMinutes % 5 === 0) {
              await notificationService.notifyTaskProgress(
                task.message,
                `Still working... (${elapsedMinutes} min)`,
                task.projectName
              );
            }
          }
        }

        // Return success to the system
        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch (error) {
        console.error('Background fetch error:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });
  }

  /**
   * Register background fetch task
   */
  private async registerBackgroundFetch(): Promise<void> {
    try {
      // Check if already registered
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_FETCH_TASK
      );

      if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
          minimumInterval: 60 * 5, // 5 minutes (minimum allowed by iOS)
          stopOnTerminate: false, // Continue after app is closed
          startOnBoot: true, // Start when device boots
        });

        this.isRegistered = true;
        console.log('Background fetch task registered');
      } else {
        this.isRegistered = true;
        console.log('Background fetch task already registered');
      }
    } catch (error) {
      console.error('Error registering background fetch:', error);
      throw error;
    }
  }

  /**
   * Unregister background fetch task
   */
  async unregisterBackgroundFetch(): Promise<void> {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      this.isRegistered = false;
      console.log('Background fetch task unregistered');
    } catch (error) {
      console.error('Error unregistering background fetch:', error);
    }
  }

  /**
   * Add a task to the active tasks list
   */
  async addTask(task: GeminiBackgroundTask): Promise<void> {
    try {
      const tasks = await this.getActiveTasks();
      tasks.push(task);
      await AsyncStorage.setItem(ACTIVE_TASKS_KEY, JSON.stringify(tasks));
      console.log('Task added to background queue:', task.id);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  /**
   * Update a task status
   */
  async updateTaskStatus(
    taskId: string,
    status: GeminiBackgroundTask['status']
  ): Promise<void> {
    try {
      const tasks = await this.getActiveTasks();
      const taskIndex = tasks.findIndex((t) => t.id === taskId);

      if (taskIndex !== -1) {
        tasks[taskIndex].status = status;
        await AsyncStorage.setItem(ACTIVE_TASKS_KEY, JSON.stringify(tasks));
        console.log(`Task ${taskId} status updated to ${status}`);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  }

  /**
   * Remove a task from the active tasks list
   */
  async removeTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getActiveTasks();
      const filteredTasks = tasks.filter((t) => t.id !== taskId);
      await AsyncStorage.setItem(ACTIVE_TASKS_KEY, JSON.stringify(filteredTasks));
      console.log('Task removed from background queue:', taskId);
    } catch (error) {
      console.error('Error removing task:', error);
    }
  }

  /**
   * Get all active tasks
   */
  async getActiveTasks(): Promise<GeminiBackgroundTask[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(ACTIVE_TASKS_KEY);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error('Error getting active tasks:', error);
      return [];
    }
  }

  /**
   * Clear all completed tasks
   */
  async clearCompletedTasks(): Promise<void> {
    try {
      const tasks = await this.getActiveTasks();
      const activeTasks = tasks.filter(
        (t) => t.status !== 'completed' && t.status !== 'error'
      );
      await AsyncStorage.setItem(ACTIVE_TASKS_KEY, JSON.stringify(activeTasks));
      console.log('Completed tasks cleared');
    } catch (error) {
      console.error('Error clearing completed tasks:', error);
    }
  }

  /**
   * Get background fetch status
   */
  async getStatus(): Promise<BackgroundFetch.BackgroundFetchStatus> {
    try {
      return await BackgroundFetch.getStatusAsync();
    } catch (error) {
      console.error('Error getting background fetch status:', error);
      return BackgroundFetch.BackgroundFetchStatus.Denied;
    }
  }

  /**
   * Check if background fetch is available
   */
  async isAvailable(): Promise<boolean> {
    const status = await this.getStatus();
    return status === BackgroundFetch.BackgroundFetchStatus.Available;
  }
}

// Export singleton instance
export const backgroundTaskService = new BackgroundTaskService();
export default backgroundTaskService;
