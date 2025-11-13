import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

interface FadeInViewProps extends ViewProps {
  duration?: number;
  delay?: number;
  children: React.ReactNode;
  from?: 'top' | 'bottom' | 'left' | 'right' | 'none';
  distance?: number;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  duration = 600,
  delay = 0,
  children,
  from = 'bottom',
  distance = 30,
  style,
  ...props
}) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(from === 'left' ? -distance : from === 'right' ? distance : 0);
  const translateY = useSharedValue(from === 'top' ? -distance : from === 'bottom' ? distance : 0);

  useEffect(() => {
    // Delay then animate
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });

      if (from !== 'none') {
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 100,
        });
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 100,
        });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[style, animatedStyle]} {...props}>
      {children}
    </Animated.View>
  );
};
