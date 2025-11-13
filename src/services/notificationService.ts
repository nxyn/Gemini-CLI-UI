import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationOptions {
  title: string;
  body: string;
  data?: any;
  categoryIdentifier?: string;
}

class NotificationService {
  private notificationListener: any;
  private responseListener: any;
  private channelId = 'gemini-tasks';

  /**
   * Initialize notification service and request permissions
   */
  async initialize(): Promise<boolean> {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(this.channelId, {
          name: 'Gemini Tasks',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00ff88',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      }

      // Set up notification listeners
      this.setupListeners();

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  /**
   * Set up listeners for notification events
   */
  private setupListeners() {
    // Listener for notifications received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received in foreground:', notification);
        // Trigger haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    );

    // Listener for when user taps on a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        // Handle navigation based on notification data
        const data = response.notification.request.content.data;
        if (data?.screen) {
          // Navigation will be handled by the app component
        }
      }
    );
  }

  /**
   * Show a local notification immediately
   */
  async showNotification(options: NotificationOptions): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: options.title,
          body: options.body,
          data: options.data || {},
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          color: '#00ff88',
          badge: 1,
          categoryIdentifier: options.categoryIdentifier,
        },
        trigger: null, // null means show immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  /**
   * Show a notification for Gemini task start
   */
  async notifyTaskStart(taskName: string, projectName?: string): Promise<string | null> {
    const title = '🤖 Gemini Task Started';
    const body = projectName
      ? `Working on ${taskName} in ${projectName}`
      : `Working on ${taskName}`;

    return this.showNotification({
      title,
      body,
      data: { type: 'task_start', taskName, projectName },
    });
  }

  /**
   * Show a notification for Gemini task progress
   */
  async notifyTaskProgress(
    taskName: string,
    progress: string,
    projectName?: string
  ): Promise<string | null> {
    const title = '⚙️ Task in Progress';
    const body = projectName
      ? `${progress} - ${projectName}`
      : progress;

    return this.showNotification({
      title,
      body,
      data: { type: 'task_progress', taskName, progress, projectName },
    });
  }

  /**
   * Show a notification for Gemini task completion
   */
  async notifyTaskComplete(
    taskName: string,
    projectName?: string
  ): Promise<string | null> {
    const title = '✅ Task Complete';
    const body = projectName
      ? `${taskName} finished in ${projectName}`
      : `${taskName} is complete`;

    // Trigger haptic success feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    return this.showNotification({
      title,
      body,
      data: { type: 'task_complete', taskName, projectName },
    });
  }

  /**
   * Show a notification for Gemini task error
   */
  async notifyTaskError(
    taskName: string,
    error: string,
    projectName?: string
  ): Promise<string | null> {
    const title = '❌ Task Error';
    const body = projectName
      ? `Error in ${taskName}: ${error}`
      : `Error: ${error}`;

    // Trigger haptic error feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    return this.showNotification({
      title,
      body,
      data: { type: 'task_error', taskName, error, projectName },
    });
  }

  /**
   * Cancel a specific notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.dismissNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Update notification badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Get the push notification token (for remote notifications)
   */
  async getPushToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'android') {
        const token = await Notifications.getDevicePushTokenAsync();
        return token.data;
      } else {
        const token = await Notifications.getExpoPushTokenAsync();
        return token.data;
      }
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Clean up listeners
   */
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
