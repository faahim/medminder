/**
 * Theme Context for Medminder
 * 
 * Provides theme values to all components via React Context.
 * Supports light mode with potential for dark mode extension.
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import {
  colors,
  spacing,
  typography,
  shadows,
  shadowsNative,
  radii,
  animation,
  easing,
  touchTargets,
  iconSizes,
  fontWeights,
  type SpacingKey,
  type TypographyKey,
  type ShadowKey,
  type RadiusKey,
} from './tokens';

// ============================================================================
// THEME TYPE DEFINITIONS
// ============================================================================

export type ColorMode = 'light' | 'dark';

export interface ThemeColors {
  /** Primary brand color */
  primary: string;
  /** Primary color variants for backgrounds, borders, etc. */
  primaryLight: string;
  primaryDark: string;
  
  /** Background colors */
  background: string;
  backgroundSecondary: string;
  
  /** Surface colors for cards and containers */
  surface: string;
  surfaceElevated: string;
  
  /** Text colors */
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  /** Border colors */
  border: string;
  borderLight: string;
  
  /** Semantic colors */
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  
  /** Utility */
  overlay: string;
  disabled: string;
}

export interface Theme {
  mode: ColorMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows;
  shadowsNative: typeof shadowsNative;
  radii: typeof radii;
  animation: typeof animation;
  easing: typeof easing;
  touchTargets: typeof touchTargets;
  iconSizes: typeof iconSizes;
  fontWeights: typeof fontWeights;
}

// ============================================================================
// LIGHT THEME
// ============================================================================

const lightThemeColors: ThemeColors = {
  // Primary
  primary: colors.primary[500],
  primaryLight: colors.primary[100],
  primaryDark: colors.primary[700],
  
  // Backgrounds
  background: colors.surface[50],
  backgroundSecondary: colors.surface[100],
  
  // Surfaces
  surface: colors.white,
  surfaceElevated: colors.white,
  
  // Text
  textPrimary: colors.surface[900],
  textSecondary: colors.surface[500],
  textTertiary: colors.surface[300],
  textInverse: colors.white,
  
  // Borders
  border: colors.surface[200],
  borderLight: colors.surface[100],
  
  // Semantic
  success: colors.success[500],
  successLight: colors.success[50],
  warning: colors.warning[500],
  warningLight: colors.warning[50],
  error: colors.error[500],
  errorLight: colors.error[50],
  
  // Utility
  overlay: 'rgba(0, 0, 0, 0.5)',
  disabled: colors.surface[300],
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightThemeColors,
  spacing,
  typography,
  shadows,
  shadowsNative,
  radii,
  animation,
  easing,
  touchTargets,
  iconSizes,
  fontWeights,
};

// ============================================================================
// DARK THEME (Future Extension)
// ============================================================================

const darkThemeColors: ThemeColors = {
  // Primary
  primary: colors.primary[400],
  primaryLight: colors.primary[700],
  primaryDark: colors.primary[300],
  
  // Backgrounds
  background: colors.surface[900],
  backgroundSecondary: colors.surface[700],
  
  // Surfaces
  surface: colors.surface[700],
  surfaceElevated: colors.surface[700],
  
  // Text
  textPrimary: colors.surface[50],
  textSecondary: colors.surface[300],
  textTertiary: colors.surface[500],
  textInverse: colors.surface[900],
  
  // Borders
  border: colors.surface[700],
  borderLight: colors.surface[700],
  
  // Semantic
  success: colors.success[400],
  successLight: colors.success[700],
  warning: colors.warning[400],
  warningLight: colors.warning[600],
  error: colors.error[400],
  errorLight: colors.error[600],
  
  // Utility
  overlay: 'rgba(0, 0, 0, 0.7)',
  disabled: colors.surface[500],
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkThemeColors,
  spacing,
  typography,
  shadows,
  shadowsNative,
  radii,
  animation,
  easing,
  touchTargets,
  iconSizes,
  fontWeights,
};

// ============================================================================
// THEME CONTEXT
// ============================================================================

const ThemeContext = createContext<Theme | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
  mode?: ColorMode;
}

/**
 * ThemeProvider - Wraps the app to provide theme values
 * 
 * @example
 * ```tsx
 * <ThemeProvider mode="light">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children, mode = 'light' }: ThemeProviderProps) {
  const theme = useMemo(() => {
    return mode === 'dark' ? darkTheme : lightTheme;
  }, [mode]);

  return React.createElement(
    ThemeContext.Provider,
    { value: theme },
    children
  );
}

/**
 * useTheme - Access theme values in any component
 * 
 * @example
 * ```tsx
 * const { colors, spacing } = useTheme();
 * 
 * <View style={{ 
 *   backgroundColor: colors.surface,
 *   padding: spacing.md 
 * }}>
 * ```
 */
export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return light theme as default if not in provider
    return lightTheme;
  }
  return context;
}

// ============================================================================
// THEME UTILITIES
// ============================================================================

/**
 * Get spacing value by key
 */
export function getSpacing(key: SpacingKey): number {
  return spacing[key];
}

/**
 * Get typography style by key
 */
export function getTypography(key: TypographyKey) {
  return typography[key];
}

/**
 * Get shadow style by key
 */
export function getShadow(key: ShadowKey): string {
  return shadows[key];
}

/**
 * Get native shadow style by key
 */
export function getNativeShadow(key: ShadowKey) {
  return shadowsNative[key];
}

/**
 * Get border radius by key
 */
export function getRadius(key: RadiusKey): number {
  return radii[key];
}

/**
 * Create a style object for typography
 */
export function createTypographyStyle(variant: TypographyKey, color?: string) {
  const style = typography[variant];
  return {
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.fontSize * style.lineHeight,
    ...(color && { color }),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { colors, spacing, typography, shadows, radii, animation, easing };
export default {
  ThemeProvider,
  useTheme,
  lightTheme,
  darkTheme,
  getSpacing,
  getTypography,
  getShadow,
  getNativeShadow,
  getRadius,
  createTypographyStyle,
};
