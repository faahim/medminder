# Phase 2: Notifications & Reminders - Design Vision

## Goal
Transform Medminder from a tracking app into an actual reminder app that proactively helps users never miss a dose.

## Core Principles

### Reliability First
- Notifications must fire on time, every time
- App must handle being closed/killed gracefully
- Background rescheduling on app launch, timezone changes, boot

### Respectful UX
- Quiet hours for nighttime
- Snooze options (15min, 30min, 1hr, custom)
- Graceful skip with optional reason
- Persistent reminders for missed doses (escalate attention)

### User Control
- Per-medication notification settings
- Global quiet hours
- Sound/vibration customization
- Easy onboarding flow for permissions

## Key Features to Build

### 1. Notification Lifecycle Integration
- App startup: reschedule all notifications
- Medication changes: update/cancel relevant notifications
- Timezone change: reschedule all
- App foreground: sync notification state with today's doses

### 2. Notification Settings Screen
- Global toggle for notifications
- Quiet hours (start/end time)
- Sound selection
- Vibration toggle
- Badge count toggle

### 3. Interactive Notifications
- Take Now (logs dose, closes notification)
- Snooze (15/30/60/custom minutes)
- Skip (logs as skipped, optional reason)

### 4. Missed Dose Handling
- Detect missed doses (scheduled time passed, no log)
- Send follow-up reminder after configurable delay
- Show missed section in Today view
- Allow retroactive logging

### 5. Background Rescheduling
- Background task to reschedule daily
- Wake on timezone change
- Handle app updates

## UI Considerations

### Notification Content
- Clear title: "Time for [medication name]"
- Body: "[dosage] [meal timing hint]"
- Large icon: medication color-coded
- Category identifier for actions

### Permission Onboarding
- In-context request on first use
- Clear explanation of value
- Settings deep link for denied permissions

### Settings Screen Design
```
┌─────────────────────────────────────┐
│ Notifications          [ON]  │
│                                 │
│ Quiet Hours                    > │
│   Start:  10:00 PM           │
│   End:    7:00 AM            │
│                                 │
│ Sound                         > │
│   Default Chime               • │
│   Soft Ding                  ○   │
│   None                       ○   │
│                                 │
│ Vibration                    [ON]  │
│ Badge Count                  [ON]  │
│                                 │
│ Advanced Settings              > │
└─────────────────────────────────────┘
```

## Technical Notes

### expo-notifications Already Installed
- Package: `expo-notifications` ^0.32.16
- Service exists: `src/services/notification.service.ts`
- Android channel configured
- Action categories defined

### What's Missing
- App lifecycle integration
- Permission onboarding flow
- Settings UI
- Notification event listeners
- Background task setup
- Missed dose detection logic
- Timezone change handling

## Success Criteria

After Phase 2:
- ✅ User receives timely reminders for all scheduled medications
- ✅ Notifications work reliably even when app is closed
- ✅ User can configure quiet hours and sounds
- ✅ Snooze and skip work seamlessly
- ✅ Missed doses are tracked and followed up on
- ✅ Notifications are beautiful and actionable
- ✅ Permission onboarding is clear and not annoying
