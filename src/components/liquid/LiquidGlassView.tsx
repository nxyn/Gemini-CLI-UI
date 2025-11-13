import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../../constants/theme';

interface LiquidGlassViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  gradient?: boolean;
  gradientColors?: string[];
  animated?: boolean;
}

export const LiquidGlassView: React.FC<LiquidGlassViewProps> = ({
  children,
  style,
  intensity = 100,
  tint = 'dark',
  gradient = true,
  gradientColors = [
    'rgba(0, 255, 136, 0.1)',
    'rgba(0, 204, 111, 0.08)',
    'rgba(0, 170, 92, 0.06)',
    'rgba(0, 0, 0, 0.4)',
  ],
  animated = true,
}) => {
  const shimmerTranslateX = useSharedValue(-300);
  const pulseOpacity = useSharedValue(0.8);

  useEffect(() => {
    if (animated) {
      shimmerTranslateX.value = withRepeat(
        withTiming(300, {
          duration: 3000,
          easing: Easing.linear,
        }),
        -1,
        false
      );

      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [animated]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} tint={tint} style={styles.blur}>
        {gradient && (
          <Animated.View style={[styles.gradientContainer, pulseStyle]}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            />
          </Animated.View>
        )}
        {animated && (
          <Animated.View style={[styles.shimmer, shimmerStyle]}>
            <LinearGradient
              colors={[
                'transparent',
                'rgba(0, 255, 136, 0.1)',
                'rgba(0, 255, 136, 0.2)',
                'rgba(0, 255, 136, 0.1)',
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    shadowColor: Colors.chloro.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  blur: {
    flex: 1,
    overflow: 'hidden',
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: 100,
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
