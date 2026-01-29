/**
 * Design Tokens for Medminder
 * 
 * This file defines all foundational design tokens including colors,
 * typography, spacing, shadows, and radii. These tokens are the
 * single source of truth for the design system.
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

/**
 * Primary color palette - Teal/Cyan
 * Used for primary actions, active states, and branding
 */
export const primaryColors = {
  50: '#ECFEFF',
  100: '#CFFAFE',
  200: '#A5F3FC',
  300: '#67E8F9',
  400: '#22D3EE',
  500: '#06B6D4',
  600: '#0891B2',
  700: '#0E7490',
} as const;

/**
 * Surface colors - Neutral grays
 * Used for backgrounds, text, borders, and UI chrome
 */
export const surfaceColors = {
  50: '#FAFAFA',   // Page background
  100: '#F4F4F5',  // Card backgrounds
  200: '#E4E4E7',  // Borders, dividers
  300: '#D4D4D8',  // Disabled elements
  500: '#71717A',  // Secondary text
  700: '#3F3F46',  // Primary text
  900: '#18181B',  // Headings
} as const;

/**
 * Success colors - Green
 * Used for taken doses, completed states, positive feedback
 */
export const successColors = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  400: '#4ADE80',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
} as const;

/**
 * Warning colors - Amber
 * Used for pending items, attention needed, cautions
 */
export const warningColors = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
} as const;

/**
 * Error colors - Red
 * Used for missed doses, critical states, destructive actions
 */
export const errorColors = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  400: '#F87171',
  500: '#EF4444',
  600: '#DC2626',
} as const;

/**
 * Combined color palette
 */
export const colors = {
  primary: primaryColors,
  surface: surfaceColors,
  success: successColors,
  warning: warningColors,
  error: errorColors,
  // Convenience aliases
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

/**
 * Spacing scale based on 4px base unit
 * Used for margins, paddings, and gaps
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

/**
 * Spacing in pixels for StyleSheet usage
 */
export const spacingPx = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

/**
 * Typography scale
 * Font sizes, weights, and line heights for consistent text hierarchy
 */
export const typography = {
  display: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 1.2,
  },
  h1: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 1.3,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 1.35,
  },
  h3: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 1.4,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 1.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 1.4,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 1.4,
  },
} as const;

/**
 * Font weight map for clarity
 */
export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

/**
 * Shadow styles for elevation
 * Designed for a soft, lifted feel without harsh edges
 */
export const shadows = {
  /** Subtle shadow for cards at rest */
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  /** Standard shadow for interactive cards */
  md: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  /** Elevated shadow for modals and floating elements */
  lg: '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
  /** No shadow */
  none: 'none',
} as const;

/**
 * iOS-compatible shadow styles for React Native
 */
export const shadowsNative = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

/**
 * Border radius scale
 * Uses continuous corner curves for native iOS feel
 */
export const radii = {
  /** Small radius - inputs, buttons */
  sm: 8,
  /** Medium radius - inputs, compact cards */
  md: 14,
  /** Large radius - cards, containers */
  lg: 20,
  /** Extra large radius - hero cards, modals */
  xl: 24,
  /** Full radius - pills, circular elements */
  full: 9999,
} as const;

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

/**
 * Animation timing values in milliseconds
 */
export const animation = {
  /** Quick micro-interactions */
  fast: 150,
  /** Standard transitions */
  normal: 300,
  /** Deliberate animations */
  slow: 450,
} as const;

/**
 * Common easing functions
 */
export const easing = {
  /** Standard ease-out for most animations */
  easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
  /** Slight spring for interactive feedback */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Linear for progress indicators */
  linear: 'linear',
} as const;

// ============================================================================
// COMPONENT TOKENS
// ============================================================================

/**
 * Touch target minimum sizes (44pt per Apple HIG)
 */
export const touchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 52,
} as const;

/**
 * Icon sizes
 */
export const iconSizes = {
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ColorScale = typeof primaryColors;
export type SpacingKey = keyof typeof spacing;
export type TypographyKey = keyof typeof typography;
export type ShadowKey = keyof typeof shadows;
export type RadiusKey = keyof typeof radii;
export type FontWeightKey = keyof typeof fontWeights;
export type AnimationKey = keyof typeof animation;
export type IconSizeKey = keyof typeof iconSizes;

// Default export for convenience
export default {
  colors,
  spacing,
  spacingPx,
  typography,
  fontWeights,
  shadows,
  shadowsNative,
  radii,
  animation,
  easing,
  touchTargets,
  iconSizes,
};
