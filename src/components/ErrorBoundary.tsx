import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { AnimatedBackground } from './animated/AnimatedBackground';
import { GlowingGreenAccent } from './animated/GlowingGreenAccent';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <View style={styles.container}>
          <AnimatedBackground />
          <View style={styles.content}>
            <GlowingGreenAccent size={80} intensity="high" speed="fast" />

            <View style={styles.errorIconContainer}>
              <Ionicons name="warning-outline" size={64} color={Colors.semantic.error} />
            </View>

            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              We encountered an unexpected error. Don't worry, your data is safe.
            </Text>

            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Error Details:</Text>
              <Text style={styles.errorMessage} numberOfLines={5}>
                {this.state.error.message}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={this.resetError}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[
                  Colors.chloro.primary + '88',
                  Colors.chloro.secondary + '88',
                  Colors.chloro.tertiary + '88',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="refresh" size={24} color={Colors.text.primary} />
                <Text style={styles.buttonText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
    gap: Spacing.lg,
  },
  errorIconContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.heavy,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.lg,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.lg,
    maxWidth: 320,
  },
  errorBox: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.semantic.error + '40',
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  errorTitle: {
    color: Colors.semantic.error,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    fontFamily: 'monospace',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  button: {
    marginTop: Spacing.xl,
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.chloro.primary + '40',
    minHeight: 52,
    minWidth: 200,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: Spacing.sm,
  },
  buttonText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});
