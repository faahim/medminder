# MedMinder Technical Decisions

This document explains the key technology choices made for MedMinder and the reasoning behind them.

## Framework: Expo SDK 54

### Decision
Use **Expo SDK 54** (managed workflow) instead of bare React Native.

### Rationale

#### Pros of Expo
1. **Faster Development**
   - Pre-configured build system
   - No need to manage native code (Xcode, Android Studio)
   - Hot reload and fast refresh work out of the box
   - Instant preview via Expo Go app

2. **Managed Workflow Benefits**
   - Over-the-air (OTA) updates for JS/assets without app store review
   - Automatic native dependency management
   - Consistent development environment across team
   - Built-in support for common native features (camera, notifications, SQLite)

3. **Cross-Platform Consistency**
   - Same codebase for iOS, Android, and Web
   - Expo modules handle platform differences
   - Less platform-specific debugging

4. **Easier Maintenance**
   - SDK upgrades handle native dependency updates
   - Less fragmentation across versions
   - Expo team maintains modules

#### Trade-offs
- **Limited native module access**: Can't use arbitrary native libraries
  - *Mitigation*: Expo's module ecosystem covers 95% of use cases; can eject if needed
- **Slightly larger app size**: Includes Expo runtime
  - *Mitigation*: ~2-3 MB overhead is acceptable for MedMinder's use case
- **Dependency on Expo ecosystem**: Tied to Expo's release schedule
  - *Mitigation*: Expo's track record is solid; SDKs are well-supported

#### Why This Works for MedMinder
- **Target users**: Elderly users need stability over bleeding-edge features
- **Feature set**: SQLite, notifications, date pickers—all supported by Expo
- **Team size**: Small team benefits from reduced native code complexity
- **Update frequency**: OTA updates allow quick bug fixes without app store delays

### Alternatives Considered

| Option | Pros | Cons | Why Not Chosen |
|--------|------|------|----------------|
| **Bare React Native** | Full control, any native module | Complex setup, more maintenance | Overkill for MedMinder's needs |
| **Flutter** | Fast, mature ecosystem | Dart language, different paradigm | Team expertise in React/JS |
| **Native iOS/Android** | Best performance, full access | Duplicate code, slower dev | Cross-platform savings outweigh perf needs |

---

## Language: TypeScript

### Decision
Use **TypeScript** instead of plain JavaScript.

### Rationale

#### Pros
1. **Type Safety**
   - Catch errors at compile time, not runtime
   - Prevents common bugs (null/undefined, wrong types)
   - Especially important for healthcare app reliability

2. **Better Developer Experience**
   - Autocomplete in IDE (knows medication object properties)
   - Refactoring is safer (rename propagates everywhere)
   - Self-documenting code (types describe expected data)

3. **Fewer Runtime Errors**
   - Type checking prevents typos in property names
   - Ensures service methods are called with correct arguments
   - Validates form data structure before submission

4. **Easier Collaboration**
   - New contributors understand types quickly
   - Less need for extensive inline comments
   - Contract enforcement between layers

#### Examples

**Without TypeScript** (error-prone):
```javascript
// Is it 'scheduleTimes' or 'schedule_times'?
// Does it return array or string?
const times = medication.scheduleTimes; // Could crash
```

**With TypeScript** (safe):
```typescript
interface Medication {
  scheduleTimes: string; // JSON string
}

const times: string[] = JSON.parse(medication.scheduleTimes); // Type-checked
```

#### Trade-offs
- **Learning curve**: Team needs to learn TypeScript syntax
  - *Mitigation*: TypeScript is mostly JavaScript with annotations; gradual adoption
- **Build step**: Requires transpilation
  - *Mitigation*: Expo handles this automatically
- **Verbose**: More code to write upfront
  - *Mitigation*: Pays off in reduced debugging time

### Alternatives Considered
- **JavaScript**: Faster to write initially, but error-prone at scale
- **Flow**: Facebook's type checker, but TypeScript has better ecosystem

---

## Styling: NativeWind 4.x (Tailwind CSS)

### Decision
Use **NativeWind** for styling (Tailwind CSS for React Native).

### Rationale

#### Pros
1. **Rapid Development**
   - Utility classes (`className="bg-blue-500 p-4 rounded-lg"`)
   - No need to create separate StyleSheet for every component
   - Faster iteration on UI

2. **Consistency**
   - Design system baked into utility classes
   - Spacing scale (p-1, p-2, p-4, p-8) ensures consistent padding
   - Color palette enforced (blue-500, gray-100, etc.)

3. **Utility-First Approach**
   - Compose styles inline without switching files
   - Easy to see what styles apply at a glance
   - Great for prototyping and quick changes

4. **Responsive & Dark Mode**
   - Built-in responsive prefixes (`md:`, `lg:`)
   - Dark mode support (`dark:bg-gray-800`)
   - Works seamlessly across platforms

#### Example Comparison

**StyleSheet (traditional)**:
```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

<View style={styles.card}>...</View>
```

**NativeWind (utility-first)**:
```typescript
<View className="bg-white p-4 rounded-lg shadow-md">...</View>
```

#### Trade-offs
- **Bundle size**: Includes Tailwind runtime
  - *Mitigation*: Tree-shaking removes unused classes
- **Learning curve**: Team needs to learn Tailwind conventions
  - *Mitigation*: Tailwind docs are excellent; utilities are intuitive
- **Less granular control**: Some complex styles harder to express
  - *Mitigation*: Can use `style` prop when needed

### Alternatives Considered
- **StyleSheet**: Native React Native styling, verbose
- **Styled Components**: CSS-in-JS, heavier runtime
- **Emotion**: Similar to Styled Components, more complexity

---

## Database: SQLite + Drizzle ORM

### Decision
Use **SQLite** with **Drizzle ORM** instead of cloud database.

### Rationale

#### Why SQLite?
1. **Privacy**
   - Data stays on user's device
   - No account required
   - No cloud breach risk
   - Respects elderly users' privacy concerns

2. **Offline-First**
   - Works without internet
   - No sync conflicts
   - Instant queries (no network latency)
   - Reliable notifications even offline

3. **No Account Needed**
   - Open app and start using immediately
   - No signup flow, no password to forget
   - Lower barrier to entry for elderly users

4. **Simplicity**
   - No backend to maintain
   - No server costs
   - Fewer moving parts
   - Single source of truth

#### Why Drizzle ORM?
1. **Type Safety**
   - TypeScript integration
   - Auto-complete for queries
   - Compile-time error checking

2. **Performance**
   - Lightweight (no heavy ORM runtime)
   - Direct SQL queries under the hood
   - Minimal overhead

3. **Developer Experience**
   - Intuitive query builder
   - Schema-first design
   - Migrations built-in

4. **SQL-Like Syntax**
   - Feels like writing SQL
   - Easy to optimize queries
   - No "magic" behavior

#### Example

**Schema Definition**:
```typescript
export const medications = sqliteTable('medications', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  dosage: text('dosage').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});
```

**Type-Safe Query**:
```typescript
const activeMeds = await db
  .select()
  .from(medications)
  .where(eq(medications.isActive, true));
// TypeScript knows activeMeds is Medication[]
```

#### Trade-offs
- **No cloud sync**: Can't access data from multiple devices
  - *Mitigation*: Elderly users typically use one device; export feature for backups
- **No remote access**: Can't view from web dashboard
  - *Mitigation*: Export data for caregiver review
- **Limited data size**: SQLite has practical limits (~140 TB, but realistically GBs)
  - *Mitigation*: Medication data is tiny (KBs for years of logs)

### Alternatives Considered

| Option | Pros | Cons | Why Not Chosen |
|--------|------|------|----------------|
| **Firebase** | Real-time sync, cloud backup | Requires account, privacy concerns | Privacy is non-negotiable |
| **Supabase** | Open-source, PostgreSQL | Requires internet, account | Offline-first is core principle |
| **AsyncStorage** | Simple key-value store | No relational queries, unstructured | Need relationships (meds → dose logs) |
| **Realm** | Mobile-first, sync available | Heavier, more complex | SQLite is simpler and sufficient |

---

## Notifications: expo-notifications

### Decision
Use **expo-notifications** for medication reminders.

### Rationale

#### Pros
1. **Native Feel**
   - Uses platform notification APIs (iOS UserNotifications, Android NotificationManager)
   - Respects system settings
   - Integrates with Do Not Disturb, notification sounds, etc.

2. **Scheduling**
   - Daily recurring notifications
   - Specific time scheduling
   - Notification categories and actions ("Take Now", "Snooze")

3. **Expo Integration**
   - Works seamlessly with Expo workflow
   - No native code required
   - Cross-platform API

4. **Reliability**
   - Notifications fire even when app is closed
   - Background notification handling
   - Badge count management

#### Example

```typescript
await Notifications.scheduleNotificationAsync({
  content: {
    title: '💊 Time for your medication',
    body: 'Omeprazole 20mg (take before meal)',
  },
  trigger: {
    type: SchedulableTriggerInputTypes.DAILY,
    hour: 8,
    minute: 0,
  },
});
```

#### Trade-offs
- **Platform limitations**: iOS/Android have different notification behaviors
  - *Mitigation*: Expo abstracts differences; fallbacks for unsupported features
- **Permission required**: User must grant notification access
  - *Mitigation*: Request permission gracefully with explanation

### Alternatives Considered
- **react-native-push-notification**: More low-level, requires native code
- **Firebase Cloud Messaging**: Server-based, requires internet (defeats offline-first)

---

## Routing: Expo Router (File-Based)

### Decision
Use **Expo Router** for navigation instead of React Navigation directly.

### Rationale

#### Pros
1. **File-Based Routing**
   - File structure defines routes automatically
   - Easier to understand app structure
   - Similar to Next.js (familiar pattern)

2. **Type Safety**
   - Auto-generated route types
   - Compile-time route validation
   - Autocomplete for navigation

3. **Deep Linking**
   - URLs map to screens automatically
   - Better for sharing specific screens (future feature)

4. **Code Splitting**
   - Automatic lazy loading
   - Faster initial app load

5. **Layouts**
   - Shared layouts via `_layout.tsx`
   - Nested layouts for tab/stack navigation

#### Example Structure
```
app/
├── (tabs)/
│   ├── _layout.tsx    → Tab navigator
│   ├── index.tsx      → /
│   └── medications.tsx → /medications
└── medication/
    ├── _layout.tsx    → Stack navigator
    ├── [id].tsx       → /medication/123
    └── edit/[id].tsx  → /medication/edit/123
```

**Type-Safe Navigation**:
```typescript
router.push('/medication/123'); // TypeScript validates route
```

#### Trade-offs
- **Newer technology**: Less mature than React Navigation
  - *Mitigation*: Expo Router is built on React Navigation; stable since Expo SDK 49
- **Learning curve**: File-based routing is different
  - *Mitigation*: Documentation is excellent; pattern is intuitive

### Alternatives Considered
- **React Navigation (direct)**: More manual setup, less type safety
- **React Router Native**: Web-focused, less native feel

---

## Date Handling: date-fns

### Decision
Use **date-fns** instead of moment.js or Luxon.

### Rationale

#### Pros
1. **Tree-Shaking**
   - Import only functions you use
   - Smaller bundle size (critical for mobile)
   - Moment.js is monolithic (~70 KB min+gzip)

2. **Immutable**
   - Pure functions (don't mutate dates)
   - Easier to reason about
   - Fewer bugs from unexpected mutations

3. **Modern**
   - Uses native Date objects
   - TypeScript support built-in
   - Active development

4. **Functional API**
   - Composable functions
   - Easy to test
   - Readable code

#### Example Comparison

**Moment.js** (mutable, large):
```javascript
import moment from 'moment'; // Entire library imported
const tomorrow = moment().add(1, 'day'); // Mutates
```

**date-fns** (immutable, small):
```javascript
import { addDays, format } from 'date-fns'; // Only what you need
const tomorrow = addDays(new Date(), 1); // Pure function
const formatted = format(tomorrow, 'yyyy-MM-dd');
```

#### Bundle Size Comparison
- **Moment.js**: 72 KB (min+gzip)
- **Luxon**: 25 KB (min+gzip)
- **date-fns**: 5-10 KB (min+gzip, tree-shaken)

#### Trade-offs
- **No i18n built-in**: Need `date-fns/locale` for internationalization
  - *Mitigation*: MedMinder v1 is English-only; i18n is future feature
- **Verbose**: Sometimes requires more imports
  - *Mitigation*: Bundle size savings outweigh convenience

### Alternatives Considered
- **Moment.js**: Too large, deprecated maintenance mode
- **Luxon**: Smaller than Moment, but heavier than date-fns
- **Day.js**: Similar to Moment API, but less tree-shakeable than date-fns

---

## Summary Table

| Technology | Decision | Key Reason |
|------------|----------|------------|
| **Framework** | Expo SDK 54 | Faster development, OTA updates, managed workflow |
| **Language** | TypeScript | Type safety, fewer runtime errors, better DX |
| **Styling** | NativeWind (Tailwind) | Rapid development, consistency, utility-first |
| **Database** | SQLite + Drizzle | Privacy, offline-first, no account needed |
| **Notifications** | expo-notifications | Native feel, reliable scheduling |
| **Routing** | Expo Router | File-based, type-safe, deep linking |
| **Date Handling** | date-fns | Tree-shaking, immutable, modern |

---

## Future Considerations

As MedMinder grows, we may revisit these decisions:

1. **Add Redux/Zustand** if global state becomes complex (e.g., real-time caregiver dashboard)
2. **Eject from Expo** if we need custom native modules (unlikely)
3. **Add cloud sync** as optional feature (with user consent)
4. **Internationalization** with date-fns/locale and i18next

**Decision Criteria**:
- Does it improve **user experience** for elderly users?
- Does it maintain **privacy** and **offline-first** principles?
- Does it reduce **complexity** or add necessary value?
- Is the **trade-off** worth the benefit?

---

*"Choose boring technology." — Dan McKinley*

We intentionally chose mature, well-supported technologies over cutting-edge options. Stability and reliability matter more than novelty for a healthcare app.
