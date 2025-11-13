import React from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Typography } from '../../constants/theme';

interface LiquidGlassInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  intensity?: number;
  focused?: boolean;
}

export const LiquidGlassInput: React.FC<LiquidGlassInputProps> = ({
  containerStyle,
  intensity = 80,
  focused = false,
  style,
  ...inputProps
}) => {
  return (
    <View style={[styles.container, focused && styles.focusedContainer, containerStyle]}>
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={
            focused
              ? [Colors.glass.green, Colors.glass.light]
              : [Colors.glass.light, Colors.glass.medium]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.text.tertiary}
          selectionColor={Colors.chloro.primary}
          cursorColor={Colors.chloro.primary}
          {...inputProps}
        />
      </BlurView>
    </View>
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
  focusedContainer: {
    borderColor: Colors.chloro.primary,
    borderWidth: 1.5,
  },
  blur: {
    flex: 1,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
  },
});
