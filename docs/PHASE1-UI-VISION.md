# Phase 1: UI/UX Overhaul Vision

## The Goal
Transform Medminder from a functional prototype into an **Editor's Choice** caliber app. Think Calm, Things 3, Apollo, Carrot Weather — apps that make you smile when you open them.

## Design Pillars

### 1. Calm Confidence
- Light, airy, breathable layouts
- Generous whitespace — let the content breathe
- Soft shadows that lift elements gently
- No harsh borders or heavy visual weight

### 2. Delightful Details
- Subtle animations that respond to interaction
- Haptic feedback at key moments
- SF Symbols with smooth icon animations
- Progress visualizations that feel alive

### 3. Accessible Clarity
- Clear visual hierarchy
- Large, comfortable touch targets (44pt+)
- High contrast where it matters
- Readable at arm's length

### 4. Native Feel
- iOS-native controls where appropriate
- Native tab bar with proper SF Symbols
- System-aligned transitions
- Respects safe areas naturally

---

## Color Palette

### Primary (Teal/Cyan)
```
primary-50:  #ECFEFF  // Background tints
primary-100: #CFFAFE  // Subtle backgrounds
primary-200: #A5F3FC  // Hover states
primary-300: #67E8F9  // Active backgrounds
primary-400: #22D3EE  // Accent elements
primary-500: #06B6D4  // Primary actions
primary-600: #0891B2  // Pressed states
primary-700: #0E7490  // Text on light
```

### Semantic Colors
```
success:  #22C55E (green-500)  // Taken, complete
warning:  #F59E0B (amber-500)  // Pending, attention
error:    #EF4444 (red-500)    // Missed, critical
info:     #3B82F6 (blue-500)   // Information
```

### Surfaces
```
surface-50:  #FAFAFA  // Page background
surface-100: #F4F4F5  // Card backgrounds
surface-200: #E4E4E7  // Borders, dividers
surface-300: #D4D4D8  // Disabled elements
surface-500: #71717A  // Secondary text
surface-700: #3F3F46  // Primary text
surface-900: #18181B  // Headings
```

---

## Typography Scale

| Name | Size | Weight | Line Height | Use |
|------|------|--------|-------------|-----|
| display | 34 | Bold | 1.2 | Hero numbers |
| h1 | 28 | Semibold | 1.3 | Screen titles |
| h2 | 22 | Semibold | 1.35 | Section headers |
| h3 | 18 | Medium | 1.4 | Card titles |
| body | 16 | Regular | 1.5 | Main content |
| label | 14 | Medium | 1.4 | Labels, captions |
| small | 12 | Regular | 1.4 | Helper text |

**Font**: System default (SF Pro on iOS)

---

## Spacing System

Base unit: 4px

| Token | Value | Use |
|-------|-------|-----|
| xs | 4px | Icon padding |
| sm | 8px | Tight spacing |
| md | 16px | Standard gaps |
| lg | 24px | Section gaps |
| xl | 32px | Major sections |
| 2xl | 48px | Hero spacing |

---

## Component Standards

### Cards
```tsx
// Modern card with lifted feel
<View style={{
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  borderCurve: 'continuous',
  padding: 20,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
}} />
```

### Buttons
- Primary: Solid fill with subtle gradient
- Secondary: Outline or ghost
- Min height: 52px for main actions
- Border radius: 16px (continuous)
- Haptic feedback on press

### Inputs
- Height: 52px
- Border radius: 14px
- Focus: Teal ring with animation
- Clear button when filled

### Icons
- SF Symbols via expo-symbols
- Size: 24 (default), 20 (compact), 28 (emphasis)
- Weight matches text weight context
- Animated where meaningful

---

## Screen Layouts

### Today (Home)
- **Hero Area**: Date, greeting, progress ring
- **Quick Stats**: Taken / Remaining pills with icons
- **Timeline**: Morning → Afternoon → Evening → Night
- **Floating Add Button**: Gradient, shadow, haptic

### Medications List
- **Search Bar**: Native with headerSearchBarOptions
- **Segmented Control**: All / Active / Completed
- **Cards**: Name, dose, schedule badge, quick actions
- **Empty State**: Friendly illustration + CTA

### History
- **Calendar Strip**: Horizontal week view
- **Stats Cards**: Adherence %, streak, insights
- **Daily Log**: Grouped by medication
- **Chart**: Weekly adherence visualization

### Settings
- **Grouped Sections**: Notifications, Appearance, Data
- **Native Controls**: Switch, Picker, Slider
- **Profile Card**: At top if applicable
- **Version Info**: At bottom, subtle

---

## Animation Guidelines

### Entering/Exiting
- FadeIn (300ms) for screen content
- SlideInRight for push navigation
- SlideInUp for modals

### Layout Changes
- LinearTransition for list reordering
- FadeInUp for new items
- FadeOutRight for removed items

### Micro-interactions
- Scale on press (0.97)
- Haptic on toggle (light)
- Progress ring animation on dose taken
- Checkmark with spring animation

### Don'ts
- No rotation animations
- No bouncy springs (too playful for medical)
- No delays over 400ms

---

## Native Feature Usage

### Tab Bar
- NativeTabs with SF Symbols
- Badge for pending doses
- Haptic on tab switch

### Navigation
- Stack with headerLargeTitle where appropriate
- Native back button behavior
- Sheet presentation for quick actions

### Controls
- Native Switch for toggles
- Native DateTimePicker for scheduling
- Native SegmentedControl for filters

---

## Key Interactions

### Log Dose
1. Tap "Take" button
2. Scale press feedback + haptic
3. Checkmark animation
4. Card updates with fade
5. Progress ring increments
6. Confetti if day complete (subtle)

### Add Medication
1. Step indicator at top
2. Smooth transitions between steps
3. Preview card builds as you go
4. Celebration on completion

---

## Quality Checklist

Before marking Phase 1 complete:
- [ ] Every screen uses consistent spacing
- [ ] All shadows use CSS boxShadow
- [ ] All icons are SF Symbols
- [ ] Haptics on all primary actions
- [ ] Entering animations on all screens
- [ ] No hardcoded colors
- [ ] Passes accessibility contrast check
- [ ] Smooth 60fps on real device
- [ ] Works beautifully in portrait
