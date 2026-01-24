# Midminder UI — Design Execution Guide

This project is intentionally **light-mode only** and uses a **clean, minimal, card-based** visual language inspired by modern medication reminder apps.

Use this document to keep future UI changes consistent.

---

## North Star

- **Minimal, calm, ultra-sleek**
- **Readable for older users**: larger touch targets, clear hierarchy, simple layouts
- **No flashy animations**: only subtle, helpful motion
- **Consistent spacing + consistent surfaces** (cards, sections, lists)

Primary color: `#06B6D4`

---

## Layout System (Mandatory)

### 1) `Screen` (safe area + keyboard + scrolling)
File: `src/components/layout/Screen.tsx`

Use this for nearly every screen instead of ad-hoc `View` + `ScrollView`.

**Patterns**
- Scroll screen:
  - `scroll`
  - `padX={16}` `padY={16}`
  - `padBottomExtra={100}` when a bottom tab bar or fixed CTA exists
- Forms:
  - add `keyboardAvoiding`

### 2) `AppHeader` (consistent top padding)
File: `src/components/layout/AppHeader.tsx`

Use this instead of hard-coded `pt-16` / manual safe-area spacing.

**Variants**
- `variant="plain"` for most screens
- `variant="gradient"` for the Today overview vibe (calm, not loud)

---

## Spacing & Sizing Rules

- Base spacing unit: **4px** (Tailwind scale)
- Common horizontal padding: **16** (`padX={16}`)
- Cards:
  - radius: `rounded-3xl`
  - padding: `p-4` / `p-5` / `p-6`
  - border: `border border-surface-100`
  - shadows: subtle only (avoid heavy shadows)
- Touch targets: aim for **44×44** minimum

---

## Surface Language

### Background
- Screen background: `bg-surface-50`

### Cards
- Default card: `bg-white rounded-3xl border border-surface-100`

### Chips
- Selected: `bg-primary-500` with `text-white`
- Unselected: `bg-surface-100` with `text-surface-700`

---

## Typography

Use the existing `Typography` component.

Guidelines:
- Titles: `h1/h2/h3` with clear hierarchy
- Secondary text: `text-surface-500` or `text-surface-600`
- Avoid overly small text for critical info

---

## Forms & Keyboard (Critical)

- Forms should use `Screen scroll keyboardAvoiding`.
- If there is a fixed footer CTA, add enough `padBottomExtra` so fields never hide behind it.
- Use `Input` and `Select` from `src/components/ui/*`.

---

## Modal Pattern

Use `src/components/ui/Modal.tsx` for bottom-sheet style modals.
- Overlay tap closes
- Content tap should NOT close (already fixed)

---

## Motion / Interactions

- Prefer **press states** and subtle transitions.
- Avoid attention-grabbing animation.
- Haptics are allowed (light impact) for major actions.

---

## Light Mode Only Policy

- Do not introduce `dark:` classes.
- Do not add a dark mode toggle.

---

## Quick Checklist for New Screens

1. Wrap with `View className="flex-1 bg-surface-50"`
2. Add `AppHeader` (plain/gradient)
3. Use `Screen` for safe-area and padding
4. Use card sections for grouping
5. Ensure keyboard + bottom CTA safe
6. Use consistent typography + surface colors

