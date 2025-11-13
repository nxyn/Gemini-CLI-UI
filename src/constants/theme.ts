/**
 * Chloro Code - Professional Design System
 * AMOLED-optimized liquid glass UI with animated glowing green accents
 */

export const Colors = {
  // AMOLED Black Backgrounds
  background: {
    primary: '#000000',      // Pure AMOLED black
    secondary: '#0a0a0a',    // Slightly elevated black
    tertiary: '#121212',     // Card/modal backgrounds
    elevated: '#1a1a1a',     // Elevated surfaces
  },

  // Chloro Green Accents (Glowing)
  chloro: {
    primary: '#00ff88',      // Bright chlorophyll green
    secondary: '#00cc6f',    // Medium green
    tertiary: '#00aa5c',     // Dark green
    glow: '#00ff88',         // Glow color for animations
    dim: '#00884d',          // Dimmed green
  },

  // Gradient Sets
  gradient: {
    // Green glow gradients
    greenGlow: ['#00ff8800', '#00ff8844', '#00ff8822', '#00ff8800'],
    greenPrimary: ['#00ff88', '#00cc6f', '#00aa5c'],
    greenAccent: ['#00ff8833', '#00cc6f22', '#00000000'],

    // AMOLED backgrounds
    amoled: ['#000000', '#0a0a0a', '#121212'],
    amoledElevated: ['#121212', '#1a1a1a', '#222222'],

    // Glass overlay
    glass: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.01)'],
  },

  // Text Colors
  text: {
    primary: '#ffffff',         // Pure white for main text
    secondary: '#b3b3b3',       // Light gray for secondary text
    tertiary: '#808080',        // Medium gray for tertiary text
    disabled: '#4d4d4d',        // Disabled text
    accent: '#00ff88',          // Chloro green for accents
    inverse: '#000000',         // Black text on light backgrounds
  },

  // Semantic Colors
  semantic: {
    success: '#00ff88',         // Chloro green for success
    warning: '#ffaa00',         // Amber for warnings
    error: '#ff4444',           // Red for errors
    info: '#00ccff',            // Cyan for info
  },

  // UI Elements
  ui: {
    border: 'rgba(0, 255, 136, 0.2)',      // Green tinted borders
    borderDim: 'rgba(255, 255, 255, 0.1)', // Dim borders
    divider: 'rgba(255, 255, 255, 0.08)',  // Dividers
    shadow: 'rgba(0, 255, 136, 0.3)',      // Green glow shadows
    overlay: 'rgba(0, 0, 0, 0.8)',         // Modal overlays
  },

  // Glass Morphism
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.12)',
    green: 'rgba(0, 255, 136, 0.08)',      // Green tinted glass
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Typography = {
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    huge: 28,
    massive: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
    verySlow: 500,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const BlurIntensity = {
  subtle: 20,
  light: 40,
  medium: 60,
  strong: 80,
  intense: 100,
};

export const Shadow = {
  small: {
    shadowColor: Colors.chloro.glow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.chloro.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.chloro.glow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: Colors.chloro.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const Theme = {
  colors: Colors,
  spacing: Spacing,
  borderRadius: BorderRadius,
  typography: Typography,
  animation: Animation,
  blurIntensity: BlurIntensity,
  shadow: Shadow,
};

export default Theme;
