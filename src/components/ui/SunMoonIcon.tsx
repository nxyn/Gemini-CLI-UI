import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface SunMoonIconProps {
  size?: number;
}

export const SunMoonIcon: React.FC<SunMoonIconProps> = ({ size = 80 }) => {
  const glowOpacity = useSharedValue(0.6);

  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.glow, glowStyle]}>
        <LinearGradient
          colors={['rgba(255, 193, 7, 0)', 'rgba(255, 193, 7, 0.3)', 'rgba(255, 193, 7, 0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
      <View style={[styles.sun, { width: size * 0.7, height: size * 0.7, borderRadius: size * 0.35 }]}>
        <LinearGradient
          colors={['#FFD54F', '#FFC107', '#FFA000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sun: {
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
});
