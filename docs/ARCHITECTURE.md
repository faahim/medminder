# MedMinder Architecture

## High-Level Overview

MedMinder follows a clean, layered architecture designed for maintainability, testability, and clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │   Home     │  │Medications │  │  History   │  │ Settings │ │
│  │ (Timeline) │  │    List    │  │  Calendar  │  │          │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
│         │                │                │              │      │
│         └────────────────┴────────────────┴──────────────┘      │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                        REACT HOOKS                              │
│  ┌────────────────────┐  ┌──────────────────────┐              │
│  │  useMedications()  │  │  useTodaysDoses()    │              │
│  │                    │  │                      │              │
│  │ - Fetch/refresh    │  │ - Today's schedule   │              │
│  │ - State management │  │ - Dose logging       │              │
│  └────────────────────┘  └──────────────────────┘              │
│              │                       │                          │
└──────────────┼───────────────────────┼──────────────────────────┘
               │                       │
┌──────────────┼───────────────────────┼──────────────────────────┐
│                      SERVICE LAYER                              │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Medication     │  │   DoseLog    │  │   Notification   │  │
│  │    Service       │  │   Service    │  │     Service      │  │
│  │                  │  │              │  │                  │  │
│  │ - CRUD ops       │  │ - Log doses  │  │ - Schedule       │  │
│  │ - Validation     │  │ - Get logs   │  │ - Cancel         │  │
│  │ - Orchestration  │  │ - Atomic ops │  │ - Snooze         │  │
│  └──────────────────┘  └──────────────┘  └──────────────────┘  │
│         │                      │                                │
│         └──────────────────────┴────────────┐                   │
└──────────────────────────────────────────────┼───────────────────┘
                                               │
┌──────────────────────────────────────────────┼───────────────────┐
│                      DATABASE LAYER                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Drizzle ORM                               │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │ medications  │  │  dose_logs   │  │   settings   │    │ │
│  │  │              │  │              │  │              │    │ │
│  │  │ - Schema     │  │ - Schema     │  │ - Schema     │    │ │
│  │  │ - Indexes    │  │ - Indexes    │  │ - Defaults   │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   SQLite Database                          │ │
│  │                (expo-sqlite / local file)                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Breakdown

### 1. UI Layer (Screens & Components)

**Location**: `/app` (screens), `/src/components` (reusable components)

**Responsibilities**:
- Render user interface
- Handle user interactions
- Display data from hooks
- Navigate between screens
- No business logic

**Key Technologies**:
- **Expo Router**: File-based routing
- **NativeWind**: Utility-first styling (Tailwind CSS)
- **React Native**: Cross-platform UI

**Structure**:
```
app/
├── _layout.tsx          # Root layout (providers, tabs)
├── (tabs)/              # Tab-based navigation
│   ├── index.tsx        # Home (Today Timeline)
│   ├── medications.tsx  # Medication List
│   ├── history.tsx      # History Calendar
│   └── settings.tsx     # Settings
└── medication/          # Medication wizard & detail
    ├── add.tsx          # Entry point for wizard
    ├── index.tsx        # Step 1: Name & Dosage
    ├── schedule.tsx     # Step 2: Schedule
    ├── meal.tsx         # Step 3: Meal Timing
    ├── duration.tsx     # Step 4: Duration
    ├── confirm.tsx      # Step 5: Review & Confirm
    ├── [id].tsx         # Medication Detail
    └── edit/[id].tsx    # Edit entry point
```

**Component Organization**:
```
src/components/
├── ui/                  # Generic UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── ...
├── medication/          # Domain-specific components
│   ├── MedicationCard.tsx
│   ├── DoseCard.tsx
│   ├── TimelineSection.tsx
│   └── ...
└── layout/              # Layout components
    └── ScreenWrapper.tsx
```

### 2. Hooks Layer

**Location**: `/src/hooks`

**Responsibilities**:
- Fetch data from services
- Manage local component state
- Provide data and actions to UI
- Handle loading/error states
- Trigger re-renders on data changes

**Key Hooks**:

#### `useMedications()`
```typescript
export function useMedications(includeArchived = false) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    // Fetch from MedicationService
  }, [includeArchived]);

  useEffect(() => { refresh(); }, [refresh]);

  return { medications, isLoading, error, refresh };
}
```

#### `useTodaysDoses()`
```typescript
export function useTodaysDoses() {
  const [doses, setDoses] = useState<ScheduledDose[]>([]);
  const [groupedDoses, setGroupedDoses] = useState<GroupedDoses>({});
  
  const logDose = useCallback(async (
    medicationId: string,
    time: string,
    status: DoseStatus
  ) => {
    await DoseLogService.logDose(medicationId, today, time, status);
    await refresh();
  }, []);

  return { doses, groupedDoses, logDose, isLoading, refresh };
}
```

**Benefits**:
- Reusable data fetching logic
- Consistent error handling
- Automatic re-fetching on mount
- Easy testing in isolation

### 3. Service Layer

**Location**: `/src/services`

**Responsibilities**:
- Business logic
- Data validation
- Orchestrate database operations
- Side effects (notifications)
- Error handling

**Key Services**:

#### `MedicationService`
- Create, read, update, delete medications
- Archive/restore medications
- Trigger notification scheduling on changes

#### `DoseLogService`
- Log doses (taken, skipped, missed)
- Fetch dose history
- Atomic operations to prevent race conditions
- Calculate adherence statistics

#### `NotificationService`
- Schedule medication reminders
- Cancel notifications
- Handle snooze
- Update badge counts

#### `SettingsService`
- Get/update app settings
- Manage singleton settings record

**Example Service Method**:
```typescript
// MedicationService.create()
async create(data: MedicationFormData): Promise<Medication> {
  // 1. Validate input
  // 2. Generate UUID
  // 3. Transform form data to DB format
  // 4. Insert into database
  // 5. Schedule notifications (side effect)
  // 6. Return created medication
}
```

**Why Services?**
- **Separation of concerns**: UI doesn't know about DB
- **Testability**: Mock services in tests
- **Reusability**: Multiple components use same service
- **Consistency**: One place for business rules

### 4. Database Layer

**Location**: `/src/db`

**Responsibilities**:
- Schema definition
- Database initialization
- Migrations
- Raw SQL queries (via Drizzle ORM)

**Schema Definition** (`schema.ts`):
```typescript
export const medications = sqliteTable('medications', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  dosage: text('dosage').notNull(),
  // ... other columns
});

export const doseLogs = sqliteTable('dose_logs', {
  id: text('id').primaryKey(),
  medicationId: text('medication_id')
    .notNull()
    .references(() => medications.id, { onDelete: 'cascade' }),
  // ... other columns
});
```

**Database Client** (`client.ts`):
```typescript
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

const expo = openDatabaseSync('medminder.db');
export const db = drizzle(expo);

export async function initializeDatabase() {
  // Run migrations
  // Create tables if not exist
}
```

**Why SQLite + Drizzle?**
- **Local-first**: No cloud dependency
- **Privacy**: Data stays on device
- **Type-safe queries**: TypeScript integration
- **Performance**: Fast local queries
- **Reliability**: ACID transactions

## State Management Approach

### React Context vs Redux: Why Context?

**We chose React Context** for state management because:

1. **Simplicity**: MedMinder's state is straightforward
   - Database state (fetched via hooks)
   - Form wizard state (scoped to wizard)
   - Settings state (singleton, rarely changes)

2. **No global complex state**: Unlike apps with real-time collaboration or complex client-side caching, MedMinder's state is:
   - **Derived from database**: Medications, doses, settings all come from SQLite
   - **Ephemeral**: UI state (loading, errors) doesn't need global store
   - **Scoped**: Form state only matters during wizard flow

3. **Performance is acceptable**: Context re-renders are minimal because:
   - Database context only provides `isReady` flag
   - Settings context rarely updates
   - Medication form context is unmounted after wizard completes

**Context Usage**:

```typescript
// DatabaseContext: App initialization
<DatabaseProvider>
  {isReady ? <App /> : <LoadingScreen />}
</DatabaseProvider>

// SettingsContext: Global settings
<SettingsProvider>
  {/* Access settings anywhere */}
</SettingsProvider>

// MedicationFormContext: Wizard state (scoped)
<MedicationFormProvider>
  {/* Multi-step form */}
</MedicationFormProvider>
```

**When would we use Redux?**
- Real-time sync across devices
- Complex undo/redo history
- Time-travel debugging
- Optimistic updates with rollback

## Navigation Structure

### Why Expo Router?

Expo Router provides file-based routing similar to Next.js, offering several benefits:

1. **Automatic routing**: File structure defines routes
2. **Type-safe navigation**: Auto-generated types for routes
3. **Deep linking**: URLs map directly to screens
4. **Code splitting**: Automatic lazy loading
5. **Shared layouts**: `_layout.tsx` for common UI

**Navigation Structure**:

```
/                          → (tabs)/index.tsx (Home)
/medications              → (tabs)/medications.tsx
/history                  → (tabs)/history.tsx
/settings                 → (tabs)/settings.tsx
/medication/add           → medication/add.tsx
/medication/123           → medication/[id].tsx
/medication/edit/123      → medication/edit/[id].tsx
```

**Tab Navigation**:
```typescript
// app/(tabs)/_layout.tsx
<Tabs>
  <Tabs.Screen name="index" options={{ title: "Today" }} />
  <Tabs.Screen name="medications" options={{ title: "Medications" }} />
  <Tabs.Screen name="history" options={{ title: "History" }} />
  <Tabs.Screen name="settings" options={{ title: "Settings" }} />
</Tabs>
```

**Stack Navigation (Wizard)**:
```typescript
// app/medication/_layout.tsx
<Stack>
  <Stack.Screen name="add" options={{ title: "Add Medication" }} />
  <Stack.Screen name="index" options={{ title: "Step 1: Basic Info" }} />
  <Stack.Screen name="schedule" options={{ title: "Step 2: Schedule" }} />
  <Stack.Screen name="meal" options={{ title: "Step 3: Meal Timing" }} />
  <Stack.Screen name="duration" options={{ title: "Step 4: Duration" }} />
  <Stack.Screen name="confirm" options={{ title: "Step 5: Confirm" }} />
</Stack>
```

## Error Handling Philosophy

### Graceful Degradation

Errors should never crash the app or leave users stranded.

**Error Handling Layers**:

1. **UI Layer**: Catch and display user-friendly errors
```typescript
try {
  await MedicationService.create(formData);
  router.push('/medications');
} catch (error) {
  Alert.alert('Error', 'Could not save medication. Please try again.');
}
```

2. **Service Layer**: Validate and throw descriptive errors
```typescript
if (!data.name.trim()) {
  throw new Error('Medication name is required');
}
```

3. **Database Layer**: Handle SQLite errors
```typescript
try {
  await db.insert(medications).values(newMed);
} catch (error) {
  if (error.code === 'SQLITE_CONSTRAINT') {
    throw new Error('Medication already exists');
  }
  throw error;
}
```

4. **Global Error Boundary**: Catch unhandled errors
```typescript
<ErrorBoundary fallback={<ErrorScreen />}>
  <App />
</ErrorBoundary>
```

### User-Facing Error Messages

- **Be specific**: "Could not save medication" not "Error occurred"
- **Suggest action**: "Please check your input and try again"
- **Avoid jargon**: No technical details or stack traces
- **Provide recovery**: Always offer a way forward

## Data Flow Patterns

### Read Pattern (Fetching Data)

```
User opens screen
       ↓
Component mounts
       ↓
Hook calls service
       ↓
Service queries database
       ↓
Database returns rows
       ↓
Service transforms to types
       ↓
Hook updates state
       ↓
Component re-renders with data
```

**Example**:
```typescript
// UI Component
function MedicationList() {
  const { medications, isLoading } = useMedications();
  
  if (isLoading) return <LoadingSkeleton />;
  return <FlatList data={medications} ... />;
}

// Hook
function useMedications() {
  const [medications, setMedications] = useState([]);
  
  useEffect(() => {
    MedicationService.getAll().then(setMedications);
  }, []);
  
  return { medications };
}

// Service
async getAll() {
  const rows = await db.select().from(medications);
  return rows.map(mapToMedication);
}
```

### Write Pattern (Saving Data)

```
User submits form
       ↓
Component calls hook action
       ↓
Hook calls service
       ↓
Service validates data
       ↓
Service writes to database
       ↓
Service triggers side effects (notifications)
       ↓
Hook refreshes data
       ↓
Component re-renders with new data
       ↓
UI shows success feedback
```

**Example**:
```typescript
// UI Component
const handleSubmit = async (data) => {
  try {
    await MedicationService.create(data);
    router.push('/medications');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

// Service
async create(data) {
  // 1. Validate
  if (!data.name) throw new Error('Name required');
  
  // 2. Save to DB
  const med = await db.insert(medications).values(...);
  
  // 3. Side effect
  await NotificationService.scheduleMedicationNotifications(med);
  
  // 4. Return
  return med;
}
```

### Optimistic Update Pattern (Future)

For better UX, consider optimistic updates:

```typescript
const logDose = async (id, status) => {
  // 1. Update UI immediately
  setDoses(prev => prev.map(d => 
    d.id === id ? { ...d, status } : d
  ));
  
  // 2. Save to database
  try {
    await DoseLogService.logDose(id, status);
  } catch (error) {
    // 3. Rollback on error
    setDoses(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'pending' } : d
    ));
    Alert.alert('Error', 'Could not log dose');
  }
};
```

## Performance Considerations

### Database Indexing

```sql
-- Indexes for common queries
CREATE INDEX idx_medications_active ON medications(isActive);
CREATE INDEX idx_dose_logs_scheduled ON dose_logs(scheduledDate, scheduledTime);
CREATE INDEX idx_dose_logs_medication ON dose_logs(medicationId);
```

### Memoization

Use `useMemo` and `useCallback` to prevent unnecessary re-renders:

```typescript
const groupedDoses = useMemo(() => {
  return groupDosesByTimeOfDay(doses);
}, [doses]);

const handleLogDose = useCallback((id, status) => {
  DoseLogService.logDose(id, status);
}, []);
```

### List Virtualization

Use `FlatList` for long lists (automatically virtualizes):

```typescript
<FlatList
  data={medications}
  renderItem={({ item }) => <MedicationCard med={item} />}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
/>
```

---

**Architecture Principles**:
1. **Separation of concerns**: Each layer has one job
2. **Dependency flow**: Always UI → Hooks → Services → Database
3. **Type safety**: TypeScript everywhere
4. **Testability**: Each layer can be tested in isolation
5. **Simplicity**: Avoid over-engineering
