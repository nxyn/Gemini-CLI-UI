import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/theme';

interface GlowingGreenAccentProps {
  size?: number;
  intensity?: 'low' | 'medium' | 'high';
  speed?: 'slow' | 'normal' | 'fast';
  style?: any;
}

export const GlowingGreenAccent: React.FC<GlowingGreenAccentProps> = ({
  size = 100,
  intensity = 'medium',
  speed = 'normal',
  style,
}) => {
  const animation = useSharedValue(0);

  const speeds = {
    slow: 3000,
    normal: 2000,
    fast: 1000,
  };

  const intensities = {
    low: 0.3,
    medium: 0.6,
    high: 1,
  };

  useEffect(() => {
    animation.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: speeds[speed],
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: speeds[speed],
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
  }, [speed]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animation.value, [0, 0.5, 1], [0.2, intensities[intensity], 0.2]);
    const scale = interpolate(animation.value, [0, 0.5, 1], [0.8, 1.2, 0.8]);

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={[
            Colors.chloro.glow + '00',
            Colors.chloro.glow + '44',
            Colors.chloro.glow + '88',
            Colors.chloro.glow + '44',
            Colors.chloro.glow + '00',
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
