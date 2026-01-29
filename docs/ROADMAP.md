# Medminder - Roadmap

## Phase 0: Foundation ✅ Complete

Initial app structure and core features. All implemented:

- [x] Project setup (Expo, NativeWind, TypeScript)
- [x] Tab navigation (Today, Medications, History, Settings)
- [x] UI component library
- [x] SQLite database with Drizzle
- [x] Medication CRUD
- [x] Multi-step add medication wizard
- [x] Prescription OCR import
- [x] PRN/as-needed scheduling
- [x] Today timeline view
- [x] Dose logging
- [x] History view

## Phase 1: Notifications & Reminders 🔲 Next

The core functionality that makes a reminder app actually remind.

### Planned Tasks
- M1-001: Push notification setup (expo-notifications)
- M1-002: Notification scheduling service
- M1-003: Reminder UI (notification content, actions)
- M1-004: Snooze functionality
- M1-005: Missed dose handling
- M1-006: Notification settings (quiet hours, sounds)
- M1-007: Background task for rescheduling

### Dependencies
- expo-notifications
- expo-task-manager (for background tasks)

## Phase 2: Polish & Testing 🔲

- Refill tracking and reminders
- Medication interaction warnings (stretch)
- Export medication list
- Accessibility audit
- Performance optimization
- Comprehensive testing

## Phase 3: Release 🔲

- App Store assets (screenshots, description)
- Privacy policy
- TestFlight beta
- App Store submission

---

## Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| MVP (local-only) | Jan 2026 | ✅ Done |
| Notifications | Feb 2026 | 🔲 Planning |
| TestFlight | Feb 2026 | 🔲 Pending |
| App Store | Mar 2026 | 🔲 Pending |
