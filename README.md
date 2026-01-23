# MedMinder - Medication Reminder App

A comprehensive medication reminder app designed for elderly users managing complex medication schedules. Built with Expo SDK 54, TypeScript, and SQLite.

## Features

- ✅ **Today Timeline** - View all your medications scheduled for today, organized by time of day
- ✅ **Medication Management** - Add, edit, archive, and delete medications
- ✅ **Flexible Scheduling** - Daily, weekly, interval-based, or as-needed schedules
- ✅ **Dose Tracking** - Log when you take, skip, or miss a dose
- ✅ **History Calendar** - Visual calendar showing adherence over time
- ✅ **Notifications** - Smart reminders at the right time with meal timing context
- ✅ **Settings** - Customize snooze duration, notification sounds, and display options
- ✅ **Offline Support** - All data stored locally on device

## Tech Stack

- **Framework**: Expo SDK 54 (React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind 4.x (Tailwind CSS for React Native)
- **Database**: SQLite with Drizzle ORM
- **Notifications**: expo-notifications
- **Date Handling**: date-fns
- **Forms**: react-hook-form
- **Calendar**: react-native-calendars

## Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator, or Expo Go app on mobile device

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd medminder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Web browser
npm run web

# Or scan QR code with Expo Go app on your mobile device
```

## Project Structure

```
medminder/
├── app/                          # Expo Router screens (file-based routing)
│   ├── _layout.tsx              # Root layout with providers
│   ├── (tabs)/                   # Tab navigation
│   │   ├── _layout.tsx          # Tab bar configuration
│   │   ├── index.tsx            # Home (Today Timeline)
│   │   ├── medications.tsx     # Medication List
│   │   ├── history.tsx          # History Calendar
│   │   └── settings.tsx         # Settings Screen
│   └── medication/              # Medication-related screens
│       ├── _layout.tsx          # Medication form layout
│       ├── add.tsx              # Add medication entry point
│       ├── index.tsx            # Step 1: Name & Dosage
│       ├── schedule.tsx         # Step 2: Schedule
│       ├── meal.tsx             # Step 3: Meal Timing
│       ├── duration.tsx         # Step 4: Duration
│       ├── confirm.tsx          # Step 5: Review & Save
│       ├── [id].tsx             # Medication Detail
│       └── edit/[id].tsx        # Edit Medication entry point
│
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── ui/                 # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Typography.tsx
│   │   │   ├── IconButton.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── TimePicker.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── SegmentedControl.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── medication/         # Medication-specific components
│   │   │   ├── MedicationCard.tsx
│   │   │   ├── MedicationListItem.tsx
│   │   │   ├── DoseCard.tsx
│   │   │   ├── DoseHistoryItem.tsx
│   │   │   ├── StatusIndicator.tsx
│   │   │   ├── MealTimingBadge.tsx
│   │   │   ├── TimelineSection.tsx
│   │   │   └── QuickLogButton.tsx
│   │   └── layout/             # Layout components
│   │       └── ScreenWrapper.tsx
│   │
│   ├── contexts/               # React Context providers
│   │   ├── DatabaseContext.tsx    # DB initialization state
│   │   ├── SettingsContext.tsx     # Global settings state
│   │   └── MedicationFormContext.tsx # Form wizard state
│   │
│   ├── services/               # Business logic layer
│   │   ├── medication.service.ts   # Medication CRUD
│   │   ├── doseLog.service.ts      # Dose logging
│   │   ├── notification.service.ts # Notification scheduling
│   │   └── settings.service.ts     # Settings management
│   │
│   ├── db/                     # Database layer
│   │   ├── schema.ts           # Drizzle ORM schema
│   │   ├── client.ts           # SQLite client
│   │   └── migrations/         # SQL migrations
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useMedications.ts   # Fetch medications
│   │   └── useTodaysDoses.ts   # Fetch today's schedule
│   │
│   ├── types/                  # TypeScript types
│   │   └── index.ts            # All interfaces & enums
│   │
│   └── utils/                  # Utility functions
│       ├── uuid.ts             # UUID generation
│       ├── validation.ts       # Form validation
│       ├── errorHandling.ts    # Error handlers
│       ├── date.ts             # Date formatting
│       └── schedule.ts         # Schedule calculation
│
├── App.tsx                     # Root component
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── babel.config.js             # Babel config (NativeWind)
├── tailwind.config.js          # Tailwind config
└── drizzle.config.ts           # Drizzle ORM config
```

## Key Screens

### 1. Home (Today Timeline)
- View all medications scheduled for today
- Organized by time of day (Morning, Afternoon, Evening, Night)
- Quick actions to mark doses as taken or skipped
- Pull-to-refresh for updates
- Empty state when no medications scheduled

### 2. Medications List
- View all active medications
- Toggle between active and archived
- Add new medication via wizard
- Tap medication card for details
- Edit or delete from detail view

### 3. Medication Detail
- View complete medication information
- See recent dose history
- Edit medication
- Archive or delete medication
- Quick log dose actions

### 4. Add/Edit Medication Wizard
5-step guided wizard:

1. **Name & Dosage** - Enter medication name, dosage, and instructions
2. **Schedule** - Choose frequency (daily, weekly, interval) and set times
3. **Meal Timing** - Select when to take relative to meals
4. **Duration** - Set start/end dates
5. **Review** - Confirm all details before saving

### 5. History Calendar
- Visual calendar with adherence indicators
- Green: All doses taken
- Yellow: Partial adherence
- Red: Missed doses
- Tap day to see detailed dose logs
- Adherence percentage calculation

### 6. Settings
- **Notifications**
  - Snooze duration (5, 10, 15, 30 min)
  - Missed threshold (30 min, 1 hr, 2 hr, never)
  - Reminder sound
  - Vibration toggle
- **Display**
  - Dark mode (system, light, dark)
  - Text size (normal, large, extra large)
- **Data**
  - Export data
  - Clear all data

## Database Schema

### medications
Stores medication records with:
- Basic info (name, dosage, instructions)
- Meal timing (before/after/with/anytime)
- Schedule (daily/weekly/interval/as-needed)
- Date range (start/end dates)
- Dependencies (sequential medication starts)
- Soft delete (archive) support

### dose_logs
Tracks every scheduled dose with:
- Status (pending/taken/missed/skipped)
- Scheduled date/time
- Logged timestamp
- Optional notes
- **UNIQUE constraint** on (medication_id, scheduled_date, scheduled_time) to prevent duplicates

### settings
Singleton table (id=1) with app preferences:
- Notification settings
- UI preferences (dark mode, font size)
- Timing thresholds

## Architecture Highlights

### Race Condition Protection
The `DoseLogService.getOrCreate()` method uses an atomic INSERT OR IGNORE pattern to prevent duplicate dose logs when multiple actions happen simultaneously.

### Automatic Notification Management
- Create medication → Notifications scheduled automatically
- Update medication → Notifications rescheduled
- Archive medication → Notifications cancelled
- Restore medication → Notifications rescheduled

### Schedule Calculation
The `schedule.ts` utility handles complex scheduling:
- Daily, weekly, and interval-based schedules
- Time-of-day categorization (morning, afternoon, evening, night)
- Active date range checking (start/end dates)
- Building today's complete schedule with status

### Settings Management
Singleton settings table with defaults:
- Snooze duration: 15 minutes
- Missed threshold: 60 minutes
- Haptic feedback: enabled
- Dark mode: system default

## API Usage Examples

### Creating a Medication
```typescript
import { MedicationService } from './src/services';

const newMed = await MedicationService.create({
  name: 'Omeprazole',
  dosage: '20mg',
  dosageUnit: 'capsule',
  instructions: 'Take before breakfast',
  mealTiming: 'before',
  scheduleType: 'daily',
  scheduleTimes: ['08:00'],
  scheduleWeekdays: [],
  scheduleIntervalHours: 0,
  startDate: new Date(),
  endDate: null,
  hasEndDate: false,
  dependsOnMedicationId: null,
  dependsOnOffsetDays: 0,
  color: '#2196F3',
});
```

### Logging a Dose
```typescript
import { DoseLogService } from './src/services';

const log = await DoseLogService.logDose(
  medicationId,
  '2026-01-23',
  '08:00',
  'taken',
  'Took with breakfast'
);
```

### Getting Today's Schedule
```typescript
import { useTodaysDoses } from './src/hooks/useTodaysDoses';

function MyScreen() {
  const { doses, groupedDoses, logDose, isLoading } = useTodaysDoses();
  
  // doses: Array of today's scheduled doses
  // groupedDoses: { morning: [...], afternoon: [...], evening: [...], night: [...] }
  // logDose: Function to mark dose as taken/skipped
  
  return (
    // Render doses by time of day
  );
}
```

## Development

### Running Tests
```bash
# Currently no tests - add test setup as needed
npm test
```

### Building for Production
```bash
# iOS (macOS only)
eas build --platform ios

# Android
eas build --platform android
```

### Database Migrations
```bash
# Generate migration
drizzle-kit generate

# Run migrations (handled automatically by app)
```

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
