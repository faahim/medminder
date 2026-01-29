# Medminder - Architecture

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 53+ |
| Navigation | Expo Router (file-based) |
| Styling | NativeWind (Tailwind CSS) |
| Database | SQLite via expo-sqlite + Drizzle ORM |
| State | React Context |
| Language | TypeScript |

## Project Structure

```
medminder/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab navigation
│   │   ├── index.tsx       # Today view
│   │   ├── medications.tsx # Medication list
│   │   ├── history.tsx     # Dose history
│   │   └── settings.tsx    # Settings
│   ├── medication/         # Medication flows
│   │   ├── add.tsx         # Add new medication
│   │   ├── schedule.tsx    # Schedule setup
│   │   ├── meal.tsx        # Meal timing
│   │   ├── duration.tsx    # Duration/refill
│   │   ├── confirm.tsx     # Confirm & save
│   │   └── [id].tsx        # Medication detail
│   └── prescription/       # OCR import flow
│       ├── import.tsx      # Camera/upload
│       └── review.tsx      # Review extracted data
│
├── src/
│   ├── components/
│   │   ├── ui/             # Reusable UI components
│   │   ├── medication/     # Medication-specific components
│   │   └── layout/         # Layout components (Screen, AppHeader)
│   ├── contexts/           # React Context providers
│   │   ├── DatabaseContext.tsx
│   │   ├── SettingsContext.tsx
│   │   └── MedicationFormContext.tsx
│   ├── db/                 # Database schema and queries
│   └── utils/              # Helper functions
│
├── assets/                 # Images, fonts
└── constants/              # Theme tokens
```

## Key Patterns

### Screen Component
All screens use the `Screen` component for consistent safe-area handling:
```tsx
<Screen scroll padX={16} padY={16}>
  {/* content */}
</Screen>
```

### Database Access
SQLite database accessed via `useDatabaseContext()`:
```tsx
const { db, isLoading } = useDatabaseContext();
```

### Form State
Multi-step forms use `MedicationFormContext` to persist state across screens.

## Data Model

### Medication
- id, name, dosage, unit
- scheduleType (fixed, interval, asNeeded)
- times (JSON array of scheduled times)
- mealTiming (before, after, with, none)
- startDate, endDate
- refillReminder, currentSupply

### DoseLog
- id, medicationId, scheduledTime, takenTime
- status (taken, skipped, missed)
- notes
