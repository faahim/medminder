/**
 * Design System - Main Export
 * 
 * This is the primary entry point for the Medminder design system.
 * Import tokens, theme, and utilities from here.
 * 
 * @example
 * ```tsx
 * import { useTheme, colors, spacing } from '@/design';
 * ```
 */

// Re-export all tokens
export * from './tokens';

// Re-export theme context and utilities
export * from './theme';

// Named exports for convenience
export { default as tokens } from './tokens';
export { default as theme } from './theme';
