import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
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
import { Colors, BorderRadius, Shadow } from '../../constants/theme';

interface LiquidGlassCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  pressable?: boolean;
  hapticFeedback?: boolean;
  glowEffect?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  style,
  intensity = 100,
  pressable = false,
  hapticFeedback = true,
  glowEffect = false,
  onPress,
  ...touchableProps
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);
  const shimmerTranslateX = useSharedValue(-400);

  useEffect(() => {
    if (glowEffect) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.9, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      shimmerTranslateX.value = withRepeat(
        withTiming(400, {
          duration: 4000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }
  }, [glowEffect]);

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.97, {
        damping: 20,
        stiffness: 300,
      });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
      });
    }
  };

  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value }],
  }));

  const content = (
    <>
      {glowEffect && (
        <Animated.View style={[styles.outerGlow, glowStyle]}>
          <LinearGradient
            colors={[
              'transparent',
              Colors.chloro.glow + '30',
              Colors.chloro.glow + '50',
              Colors.chloro.glow + '30',
              'transparent',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      )}
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={
            glowEffect
              ? [
                  Colors.glass.green,
                  Colors.glass.light,
                  Colors.glass.medium,
                  'rgba(0, 0, 0, 0.5)',
                ]
              : [Colors.glass.light, Colors.glass.medium, 'rgba(0, 0, 0, 0.4)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        {glowEffect && (
          <Animated.View style={[styles.shimmer, shimmerStyle]}>
            <LinearGradient
              colors={[
                'transparent',
                'rgba(0, 255, 136, 0.05)',
                'rgba(0, 255, 136, 0.1)',
                'rgba(0, 255, 136, 0.05)',
                'transparent',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        )}
        <View style={styles.content}>{children}</View>
      </BlurView>
    </>
  );

  const containerStyle = [
    styles.container,
    glowEffect && styles.glowContainer,
    style,
  ];

  if (pressable && onPress) {
    return (
      <AnimatedTouchableOpacity
        style={[containerStyle, animatedStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        {...touchableProps}
      >
        {content}
      </AnimatedTouchableOpacity>
    );
  }

  return <Animated.View style={[containerStyle, animatedStyle]}>{content}</Animated.View>;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.tertiary,
  },
  glowContainer: {
    ...Shadow.glow,
    borderColor: Colors.chloro.primary + '30',
  },
  outerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.xl,
  },
  blur: {
    flex: 1,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: 150,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
