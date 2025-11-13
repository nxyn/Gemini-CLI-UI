import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  enabled?: boolean;
}

const SWIPE_THRESHOLD = 100;

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = 'Delete',
  rightLabel = 'Archive',
  leftIcon = 'trash-outline',
  rightIcon = 'archive-outline',
  enabled = true,
}) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onUpdate((event) => {
      if (event.translationX < 0 && onSwipeLeft) {
        translateX.value = event.translationX;
      } else if (event.translationX > 0 && onSwipeRight) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        if (event.translationX < 0 && onSwipeLeft) {
          runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Warning);

          // Animate out
          translateX.value = withTiming(-500, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 });

          // Call callback after animation
          setTimeout(() => {
            runOnJS(onSwipeLeft)();
          }, 300);
        } else if (event.translationX > 0 && onSwipeRight) {
          runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);

          // Animate out
          translateX.value = withTiming(500, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 });

          // Call callback after animation
          setTimeout(() => {
            runOnJS(onSwipeRight)();
          }, 300);
        } else {
          translateX.value = withSpring(0, { damping: 20 });
        }
      } else {
        translateX.value = withSpring(0, { damping: 20 });
      }

      // Haptic feedback for threshold
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD / 2) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < 0 ? Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1) : 0,
  }));

  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 0 ? Math.min(translateX.value / SWIPE_THRESHOLD, 1) : 0,
  }));

  return (
    <View style={styles.container}>
      {onSwipeRight && (
        <Animated.View style={[styles.actionRight, rightActionStyle]}>
          <Ionicons name={rightIcon} size={28} color={Colors.chloro.primary} />
          <Text style={styles.actionTextRight}>{rightLabel}</Text>
        </Animated.View>
      )}
      {onSwipeLeft && (
        <Animated.View style={[styles.actionLeft, leftActionStyle]}>
          <Ionicons name={leftIcon} size={28} color={Colors.semantic.error} />
          <Text style={styles.actionTextLeft}>{leftLabel}</Text>
        </Animated.View>
      )}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  actionLeft: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    backgroundColor: Colors.semantic.error + '20',
    borderRadius: BorderRadius.xl,
    minWidth: 120,
    zIndex: 0,
  },
  actionRight: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    backgroundColor: Colors.chloro.primary + '20',
    borderRadius: BorderRadius.xl,
    minWidth: 120,
    zIndex: 0,
  },
  actionTextLeft: {
    color: Colors.semantic.error,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
  actionTextRight: {
    color: Colors.chloro.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
});
