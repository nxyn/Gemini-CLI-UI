import React, { useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Typography, Shadow } from '../../constants/theme';

interface LiquidGlassButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  hapticFeedback?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  onPress,
  title,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary',
  hapticFeedback = true,
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (variant === 'primary' && !disabled && !loading) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [variant, disabled, loading]);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePress = () => {
    if (hapticFeedback && !disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return [
          Colors.chloro.primary + '88',
          Colors.chloro.secondary + '88',
          Colors.chloro.tertiary + '88',
        ];
      case 'secondary':
        return [
          Colors.glass.medium,
          Colors.glass.light,
        ];
      case 'danger':
        return [
          Colors.semantic.error + '66',
          Colors.semantic.error + '44',
        ];
      default:
        return [
          Colors.chloro.primary + '66',
          Colors.chloro.secondary + '66',
        ];
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.container,
        variant === 'primary' && styles.primaryContainer,
        style,
        (disabled || loading) && styles.disabled,
        animatedStyle,
      ]}
      activeOpacity={0.9}
    >
      {variant === 'primary' && !disabled && !loading && (
        <Animated.View style={[styles.glowContainer, glowStyle]}>
          <LinearGradient
            colors={[
              'transparent',
              Colors.chloro.glow + '40',
              Colors.chloro.glow + '60',
              Colors.chloro.glow + '40',
              'transparent',
            ]}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      )}
      <BlurView intensity={100} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={Colors.chloro.primary} />
          ) : (
            <Text style={[styles.text, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      </BlurView>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    minHeight: 52,
    backgroundColor: Colors.background.tertiary,
  },
  primaryContainer: {
    ...Shadow.glow,
    borderColor: Colors.chloro.primary + '40',
  },
  glowContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  blur: {
    flex: 1,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  text: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
});
