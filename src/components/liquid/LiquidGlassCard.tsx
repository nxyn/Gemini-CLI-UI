import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  style,
  intensity = 80,
  pressable = false,
  hapticFeedback = true,
  glowEffect = false,
  onPress,
  ...touchableProps
}) => {
  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const content = (
    <>
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={
            glowEffect
              ? [Colors.glass.green, Colors.glass.light, Colors.glass.medium]
              : [Colors.glass.light, Colors.glass.medium]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
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
      <TouchableOpacity
        style={containerStyle}
        onPress={handlePress}
        activeOpacity={0.8}
        {...touchableProps}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.tertiary,
  },
  glowContainer: {
    ...Shadow.medium,
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
    padding: 16,
  },
});
