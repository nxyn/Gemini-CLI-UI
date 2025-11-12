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
        return ['rgba(20, 184, 166, 0.4)', 'rgba(14, 165, 233, 0.4)'];
      case 'secondary':
        return ['rgba(100, 116, 139, 0.4)', 'rgba(71, 85, 105, 0.4)'];
      case 'danger':
        return ['rgba(239, 68, 68, 0.4)', 'rgba(220, 38, 38, 0.4)'];
      default:
        return ['rgba(20, 184, 166, 0.4)', 'rgba(14, 165, 233, 0.4)'];
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.container,
        style,
        (disabled || loading) && styles.disabled,
      ]}
      activeOpacity={0.7}
    >
      <BlurView intensity={60} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 48,
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
