import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Typography, Shadow } from '../../constants/theme';

interface LiquidGlassButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  hapticFeedback?: boolean;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  onPress,
  title,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary',
  hapticFeedback = true,
}) => {
  const handlePress = () => {
    if (hapticFeedback && !disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return [
          Colors.chloro.primary + '66',
          Colors.chloro.secondary + '66',
          Colors.chloro.tertiary + '66',
        ];
      case 'secondary':
        return [
          Colors.glass.medium,
          Colors.glass.light,
        ];
      case 'danger':
        return [
          Colors.semantic.error + '66',
          Colors.semantic.error + '44',
        ];
      default:
        return [
          Colors.chloro.primary + '66',
          Colors.chloro.secondary + '66',
        ];
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.container,
        variant === 'primary' && styles.primaryContainer,
        style,
        (disabled || loading) && styles.disabled,
      ]}
      activeOpacity={0.7}
    >
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={Colors.chloro.primary} />
          ) : (
            <Text style={[styles.text, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    minHeight: 48,
    backgroundColor: Colors.background.tertiary,
  },
  primaryContainer: {
    ...Shadow.medium,
  },
  blur: {
    flex: 1,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  text: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});
