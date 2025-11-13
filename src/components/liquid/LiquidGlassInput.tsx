import React, { useState, useEffect } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors, BorderRadius, Typography } from '../../constants/theme';

interface LiquidGlassInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  intensity?: number;
}

export const LiquidGlassInput: React.FC<LiquidGlassInputProps> = ({
  containerStyle,
  intensity = 100,
  style,
  ...inputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusedScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const shimmerTranslateX = useSharedValue(-300);

  useEffect(() => {
    if (isFocused) {
      focusedScale.value = withTiming(1.02, { duration: 200, easing: Easing.out(Easing.ease) });
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      shimmerTranslateX.value = withRepeat(
        withTiming(300, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      focusedScale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isFocused]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusedScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        isFocused && styles.focusedContainer,
        containerStyle,
        animatedContainerStyle,
      ]}
    >
      {isFocused && (
        <Animated.View style={[styles.glowContainer, glowStyle]}>
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
            isFocused
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
        {isFocused && (
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
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.text.tertiary}
          selectionColor={Colors.chloro.primary}
          cursorColor={Colors.chloro.primary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...inputProps}
        />
      </BlurView>
    </Animated.View>
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
  focusedContainer: {
    borderColor: Colors.chloro.primary,
    borderWidth: 2,
    shadowColor: Colors.chloro.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glowContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.lg,
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
    width: 100,
  },
  input: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
  },
});
