import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface LiquidGlassViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  gradient?: boolean;
  gradientColors?: string[];
}

export const LiquidGlassView: React.FC<LiquidGlassViewProps> = ({
  children,
  style,
  intensity = 80,
  tint = 'dark',
  gradient = true,
  gradientColors = ['rgba(20, 184, 166, 0.1)', 'rgba(59, 130, 246, 0.1)', 'rgba(168, 85, 247, 0.1)'],
}) => {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} tint={tint} style={styles.blur}>
        {gradient && (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
        )}
        <View style={styles.content}>{children}</View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  blur: {
    flex: 1,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
