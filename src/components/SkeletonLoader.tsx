import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, BorderRadius } from '../constants/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.md,
  style,
}) => {
  const shimmerTranslateX = useSharedValue(-300);

  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(300, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          width: width as any,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(0, 255, 136, 0.08)',
            'rgba(0, 255, 136, 0.15)',
            'rgba(0, 255, 136, 0.08)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
};

interface SkeletonCardProps {
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      <SkeletonLoader width={40} height={40} borderRadius={BorderRadius.md} />
      <View style={styles.cardContent}>
        <SkeletonLoader width="70%" height={24} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="90%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="60%" height={16} />
      </View>
    </View>
  );
};

interface SkeletonListProps {
  count?: number;
  style?: ViewStyle;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ count = 3, style }) => {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} style={{ marginBottom: 16 }} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.tertiary,
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: 200,
  },
  card: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    gap: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
});
