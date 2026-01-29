# Medminder Design System

> A calm, accessible, and delightful design system for medication tracking.

## Overview

The Medminder design system provides a consistent visual language across the app. It's built on four pillars:

1. **Calm Confidence** - Light, airy layouts with generous whitespace
2. **Delightful Details** - Subtle animations and haptic feedback
3. **Accessible Clarity** - Clear hierarchy with high contrast
4. **Native Feel** - iOS-aligned controls and transitions

## Quick Start

```tsx
import { useTheme, colors, spacing, typography } from '@/design';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.radii.lg,
    }}>
      <Text style={{
        ...theme.typography.h2,
        color: theme.colors.textPrimary,
      }}>
        Hello World
      </Text>
    </View>
  );
}
```

---

## Color Palette

### Primary (Teal/Cyan)

Our primary color conveys trust, calm, and health—perfect for a medical app.

| Token | Value | Use |
|-------|-------|-----|
| `primary.50` | `#ECFEFF` | Background tints |
| `primary.100` | `#CFFAFE` | Subtle backgrounds |
| `primary.200` | `#A5F3FC` | Hover states |
| `primary.300` | `#67E8F9` | Active backgrounds |
| `primary.400` | `#22D3EE` | Accent elements |
| `primary.500` | `#06B6D4` | **Primary actions** |
| `primary.600` | `#0891B2` | Pressed states |
| `primary.700` | `#0E7490` | Text on light |

### Surface (Neutral Grays)

| Token | Value | Use |
|-------|-------|-----|
| `surface.50` | `#FAFAFA` | Page background |
| `surface.100` | `#F4F4F5` | Card backgrounds |
| `surface.200` | `#E4E4E7` | Borders, dividers |
| `surface.300` | `#D4D4D8` | Disabled elements |
| `surface.500` | `#71717A` | Secondary text |
| `surface.700` | `#3F3F46` | Primary text |
| `surface.900` | `#18181B` | Headings |

### Semantic Colors

| Purpose | Light | Use |
|---------|-------|-----|
| **Success** | `#22C55E` | Taken doses, completed |
| **Warning** | `#F59E0B` | Pending, attention |
| **Error** | `#EF4444` | Missed, critical |

Each semantic color has a light variant (`success.50`, etc.) for backgrounds.

### Usage in Code

```tsx
import { colors } from '@/design';

// Direct token access
const primaryButton = colors.primary[500]; // #06B6D4

// Theme context (recommended)
const { colors: themeColors } = useTheme();
const primaryButton = themeColors.primary; // Adapts to light/dark mode
```

### Tailwind Classes

```tsx
// Primary colors
<View className="bg-primary-500 text-primary-50" />

// Surface colors
<View className="bg-surface-50 border-surface-200" />

// Semantic colors
<View className="bg-success-50 text-success-700" />
```

---

## Typography

| Variant | Size | Weight | Line Height | Use |
|---------|------|--------|-------------|-----|
| `display` | 34px | Bold (700) | 1.2 | Hero numbers, stats |
| `h1` | 28px | Semibold (600) | 1.3 | Screen titles |
| `h2` | 22px | Semibold (600) | 1.35 | Section headers |
| `h3` | 18px | Medium (500) | 1.4 | Card titles |
| `body` | 16px | Regular (400) | 1.5 | Main content |
| `label` | 14px | Medium (500) | 1.4 | Labels, captions |
| `small` | 12px | Regular (400) | 1.4 | Helper text |

### Usage

```tsx
import { typography, createTypographyStyle } from '@/design';

// Direct style object
<Text style={typography.h1}>Screen Title</Text>

// With color
<Text style={createTypographyStyle('body', '#71717A')}>
  Secondary text
</Text>

// Tailwind classes
<Text className="text-h1">Screen Title</Text>
```

---

## Spacing

Based on a 4px grid for consistent rhythm.

| Token | Value | Use |
|-------|-------|-----|
| `xs` | 4px | Icon padding, tight gaps |
| `sm` | 8px | Between related elements |
| `md` | 16px | Standard component padding |
| `lg` | 24px | Section gaps |
| `xl` | 32px | Major sections |
| `2xl` | 48px | Hero areas, page padding |

### Usage

```tsx
import { spacing } from '@/design';

<View style={{
  padding: spacing.md,      // 16px
  marginBottom: spacing.lg, // 24px
  gap: spacing.sm,          // 8px
}} />

// Tailwind
<View className="p-md mb-lg gap-sm" />
```

---

## Border Radius

Continuous corner curves for iOS-native feel.

| Token | Value | Use |
|-------|-------|-----|
| `sm` | 8px | Buttons, inputs |
| `md` | 14px | Inputs, compact cards |
| `lg` | 20px | Cards, containers |
| `xl` | 24px | Hero cards, modals |
| `full` | 9999px | Pills, circular elements |

### Usage

```tsx
import { radii } from '@/design';

// Card with continuous corners
<View style={{
  borderRadius: radii.lg,
  borderCurve: 'continuous', // iOS only
}} />
```

---

## Shadows

Soft, lifted shadows without harsh edges.

| Token | Style | Use |
|-------|-------|-----|
| `sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `md` | `0 2px 8px ...` | Interactive cards |
| `lg` | `0 4px 16px ...` | Modals, floating |

### Native Shadows

For React Native, use `shadowsNative`:

```tsx
import { shadowsNative } from '@/design';

<View style={{
  ...shadowsNative.md,
  backgroundColor: '#FFFFFF',
}} />
```

---

## Animation

### Timing

| Token | Duration | Use |
|-------|----------|-----|
| `fast` | 150ms | Micro-interactions |
| `normal` | 300ms | Standard transitions |
| `slow` | 450ms | Deliberate animations |

### Easing

| Token | Curve | Use |
|-------|-------|-----|
| `easeOut` | `cubic-bezier(0.33, 1, 0.68, 1)` | Most animations |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Interactive feedback |
| `linear` | `linear` | Progress indicators |

### Guidelines

✅ **Do:**
- FadeIn (300ms) for screen content
- SlideInUp for modals
- Scale on press (0.97) with haptic
- Checkmark spring animation on dose taken

❌ **Don't:**
- No rotation animations
- No bouncy springs (too playful for medical)
- No delays over 400ms

---

## Touch Targets

Minimum sizes per Apple HIG.

| Token | Size | Use |
|-------|------|-----|
| `minimum` | 44px | Smallest tappable area |
| `comfortable` | 48px | Standard buttons |
| `large` | 52px | Primary actions |

---

## Icon Sizes

| Token | Size | Use |
|-------|------|-----|
| `sm` | 20px | Compact contexts |
| `md` | 24px | Default |
| `lg` | 28px | Emphasis |
| `xl` | 32px | Hero icons |

---

## Theme Context

The `ThemeProvider` wraps the app to provide theme values.

```tsx
// app/_layout.tsx
import { ThemeProvider } from '@/design';

export default function Layout() {
  return (
    <ThemeProvider mode="light">
      <App />
    </ThemeProvider>
  );
}
```

### useTheme Hook

Access all theme values in any component:

```tsx
import { useTheme } from '@/design';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <View style={{
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
      borderRadius: theme.radii.lg,
      ...theme.shadowsNative.md,
    }}>
      <Text style={{
        ...theme.typography.h2,
        color: theme.colors.textPrimary,
      }}>
        Hello World
      </Text>
    </View>
  );
}
```

---

## Component Examples

### Card

```tsx
<View style={{
  backgroundColor: colors.white,
  borderRadius: radii.lg,
  borderCurve: 'continuous',
  padding: spacing.lg,
  ...shadowsNative.md,
}} />
```

### Primary Button

```tsx
<Pressable style={{
  backgroundColor: colors.primary[500],
  height: touchTargets.large,
  borderRadius: radii.md,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: spacing.lg,
}}>
  <Text style={{
    ...typography.label,
    color: colors.white,
  }}>
    Take Medication
  </Text>
</Pressable>
```

### Input Field

```tsx
<TextInput style={{
  height: touchTargets.large,
  borderRadius: radii.md,
  borderWidth: 1,
  borderColor: colors.surface[200],
  paddingHorizontal: spacing.md,
  ...typography.body,
  color: colors.surface[900],
}} />
```

---

## File Structure

```
src/design/
├── index.ts      # Main exports
├── tokens.ts     # Raw design tokens
└── theme.ts      # Theme context & utilities
```

---

## Accessibility

- All text meets WCAG AA contrast ratios
- Touch targets are minimum 44px
- Typography scale ensures readability
- Color is never the only indicator

---

## Future Enhancements

- [ ] Dark mode support (tokens prepared)
- [ ] Dynamic type support
- [ ] High contrast mode
- [ ] Reduced motion preferences
