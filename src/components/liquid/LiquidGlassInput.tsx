import React from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { BlurView } from 'expo-blur';

interface LiquidGlassInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  intensity?: number;
}

export const LiquidGlassInput: React.FC<LiquidGlassInputProps> = ({
  containerStyle,
  intensity = 60,
  style,
  ...inputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          {...inputProps}
        />
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minHeight: 48,
  },
  blur: {
    flex: 1,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
});
