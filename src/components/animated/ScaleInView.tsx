import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ScaleInViewProps extends ViewProps {
  duration?: number;
  delay?: number;
  children: React.ReactNode;
  initialScale?: number;
  springy?: boolean;
}

export const ScaleInView: React.FC<ScaleInViewProps> = ({
  duration = 400,
  delay = 0,
  children,
  initialScale = 0.8,
  springy = true,
  style,
  ...props
}) => {
  const scale = useSharedValue(initialScale);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: duration * 0.6,
        easing: Easing.out(Easing.ease),
      });

      if (springy) {
        scale.value = withSpring(1, {
          damping: 12,
          stiffness: 100,
          mass: 0.8,
        });
      } else {
        scale.value = withTiming(1, {
          duration,
          easing: Easing.out(Easing.back(1.2)),
        });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]} {...props}>
      {children}
    </Animated.View>
  );
};
