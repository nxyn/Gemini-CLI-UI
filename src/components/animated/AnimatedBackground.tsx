import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export const AnimatedBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = withRepeat(
      withTiming(1, {
        duration: 8000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(animation.value, [0, 1], [-width * 0.1, width * 0.1]);
    const translateY = interpolate(animation.value, [0, 1], [-height * 0.05, height * 0.05]);

    return {
      transform: [{ translateX }, { translateY }],
    };
  });

  return (
    <>
      <LinearGradient
        colors={Colors.gradient.amoled}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Animated.View style={[styles.glowContainer, animatedStyle]}>
        <LinearGradient
          colors={[
            Colors.chloro.glow + '00',
            Colors.chloro.glow + '11',
            Colors.chloro.glow + '22',
            Colors.chloro.glow + '11',
            Colors.chloro.glow + '00',
          ]}
          style={styles.glow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      {children}
    </>
  );
};

const styles = StyleSheet.create({
  glowContainer: {
    position: 'absolute',
    width: width * 1.5,
    height: height * 1.5,
    top: -height * 0.25,
    left: -width * 0.25,
  },
  glow: {
    flex: 1,
    opacity: 0.6,
  },
});
