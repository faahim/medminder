# Contributing to MedMinder

Thank you for your interest in contributing to MedMinder! This guide will help you get started.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Code Style Guidelines](#code-style-guidelines)
3. [Project Structure](#project-structure)
4. [Pull Request Process](#pull-request-process)
5. [Testing Guidelines](#testing-guidelines)
6. [Commit Message Conventions](#commit-message-conventions)
7. [Getting Help](#getting-help)

---

## Development Environment Setup

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn**: Comes with Node.js
- **Git**: For version control ([Download](https://git-scm.com/))
- **Expo CLI**: Install globally via `npm install -g expo-cli`

**Optional** (for device testing):
- **iOS Simulator** (macOS only): Comes with Xcode
- **Android Emulator**: Part of Android Studio
- **Expo Go app**: Install on physical device from App Store/Play Store

### Clone the Repository

```bash
git clone https://github.com/yourusername/medminder.git
cd medminder
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm start
```

This will start the Expo development server. You can then:

- Press `i` to open iOS Simulator (macOS only)
- Press `a` to open Android Emulator
- Press `w` to open in web browser
- Scan QR code with Expo Go app on your phone

### Project Commands

```bash
# Start development server
npm start

# Start on specific platform
npm run ios        # iOS Simulator
npm run android    # Android Emulator
npm run web        # Web browser

# Clear cache and start
npx expo start --clear

# Check for TypeScript errors
npx tsc --noEmit

# Format code (if Prettier is added)
npm run format
```

### IDE Setup

We recommend **Visual Studio Code** with the following extensions:

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **React Native Tools**: Debugging and IntelliSense
- **Tailwind CSS IntelliSense**: NativeWind class autocomplete

**VS Code Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## Code Style Guidelines

### TypeScript

- **Always use TypeScript**: No plain `.js` files
- **Explicit types**: Define interfaces for all data structures
- **Avoid `any`**: Use `unknown` if type is truly unknown
- **Use type inference**: Let TypeScript infer when obvious

**Good**:
```typescript
interface Medication {
  id: string;
  name: string;
  dosage: string;
}

const getMedication = (id: string): Medication | null => {
  // ...
};
```

**Bad**:
```typescript
const getMedication = (id: any): any => {
  // ...
};
```

### React / React Native

- **Functional components**: Always use function components with hooks
- **Use `useCallback` and `useMemo`**: For performance-critical operations
- **Custom hooks**: Extract reusable logic into custom hooks
- **Props destructuring**: Destructure props in function signature

**Good**:
```typescript
interface Props {
  medication: Medication;
  onPress: () => void;
}

export function MedicationCard({ medication, onPress }: Props) {
  const formattedDosage = useMemo(() => 
    `${medication.dosage} ${medication.dosageUnit}`, 
    [medication]
  );
  
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);
  
  return <TouchableOpacity onPress={handlePress}>...</TouchableOpacity>;
}
```

### NativeWind / Styling

- **Utility-first**: Use Tailwind classes via `className`
- **Consistent spacing**: Use spacing scale (p-2, p-4, p-6, not p-3, p-5)
- **Semantic naming**: Create custom classes for reusable patterns
- **Accessibility**: Minimum touch targets 44x44 points

**Good**:
```typescript
<View className="bg-white p-4 rounded-lg shadow-md">
  <Text className="text-lg font-semibold text-gray-900">
    {medication.name}
  </Text>
</View>
```

**When to use `style` prop**:
- Dynamic styles based on props (e.g., `backgroundColor: medication.color`)
- Platform-specific styles that NativeWind doesn't support

### File Naming

- **Components**: PascalCase (`MedicationCard.tsx`)
- **Utilities**: camelCase (`uuid.ts`, `schedule.ts`)
- **Services**: camelCase with `.service.ts` suffix (`medication.service.ts`)
- **Screens (Expo Router)**: lowercase or kebab-case (`index.tsx`, `[id].tsx`)
- **Types**: `index.ts` in `/src/types`

### Import Organization

Organize imports in this order:

1. External libraries (React, React Native)
2. Expo modules
3. Internal absolute imports (services, hooks, types)
4. Relative imports (components, utils)
5. Styles (if using StyleSheet)

**Example**:
```typescript
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { MedicationService } from '@/services/medication.service';
import { useMedications } from '@/hooks/useMedications';
import { Medication } from '@/types';

import { Button } from '../ui/Button';
import { formatDate } from './utils/date';
```

### Comments

- **Use JSDoc for public APIs**: Document exported functions, services, hooks
- **Explain why, not what**: Code should be self-documenting
- **TODOs**: Use `// TODO:` with issue number if applicable

**Good**:
```typescript
/**
 * Calculates today's medication schedule grouped by time of day.
 * Handles active date ranges, dependencies, and dose status.
 * 
 * @param medications - List of active medications
 * @returns Doses grouped by morning, afternoon, evening, night
 */
export function buildTodaysSchedule(medications: Medication[]): GroupedDoses {
  // Implementation
}
```

---

## Project Structure

Understanding the project structure will help you navigate and contribute effectively.

```
medminder/
├── app/                    # Expo Router screens (UI layer)
│   ├── (tabs)/            # Tab navigation screens
│   └── medication/        # Medication wizard & detail
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Generic components (Button, Card, etc.)
│   │   ├── medication/   # Domain-specific components
│   │   └── layout/       # Layout components
│   ├── contexts/          # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Business logic layer
│   ├── db/                # Database schema & client
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── docs/                  # Documentation
├── assets/                # Images, fonts, etc.
└── package.json
```

### Where to Add New Code

- **New screen**: Add to `/app` (Expo Router handles routing)
- **Reusable component**: Add to `/src/components/ui` or `/src/components/medication`
- **Business logic**: Add to `/src/services` (e.g., `reminder.service.ts`)
- **Database table**: Update `/src/db/schema.ts` and create migration
- **Custom hook**: Add to `/src/hooks` (e.g., `useReminders.ts`)
- **Utility function**: Add to `/src/utils` (e.g., `time.ts`)

---

## Pull Request Process

### Before You Start

1. **Check existing issues**: Look for related issues or feature requests
2. **Open an issue**: Discuss major changes before implementing
3. **Fork the repository**: Create your own fork for development
4. **Create a branch**: Use descriptive branch names

### Branch Naming

Use this format: `type/short-description`

**Types**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

**Examples**:
```bash
git checkout -b feature/caregiver-dashboard
git checkout -b fix/notification-timezone
git checkout -b docs/update-architecture
```

### Making Changes

1. **Write clean code**: Follow style guidelines above
2. **Test your changes**: Manually test on iOS, Android, or web
3. **Update documentation**: If behavior changes, update README or docs
4. **Add types**: Ensure all new code is typed
5. **No console.logs**: Remove debug logs before committing

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Examples**:
```bash
feat(notifications): add snooze functionality

Add ability to snooze medication reminders for 5, 10, or 15 minutes.
Updates NotificationService with scheduleSnooze method.

Closes #42

---

fix(dose-log): prevent duplicate dose logs

Use INSERT OR IGNORE to prevent race condition when multiple
components log the same dose simultaneously.

Fixes #38

---

docs(architecture): add data flow diagrams

Add ASCII diagrams showing read and write patterns for clarity.
```

### Submitting a Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature
   ```

2. **Open PR on GitHub**: Compare your branch to `main`

3. **Fill out PR template**: Describe what changed and why

4. **Request review**: Tag maintainers for review

5. **Address feedback**: Make requested changes and push updates

6. **Merge**: Maintainer will merge once approved

### PR Checklist

- [ ] Code follows style guidelines
- [ ] TypeScript types are defined
- [ ] Manually tested on at least one platform
- [ ] No console.logs or debug code
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with `main`

---

## Testing Guidelines

### Current Testing Status

MedMinder currently has **no automated tests** (manual testing only). This is a great area to contribute!

### Testing Priorities

If you'd like to add tests, prioritize in this order:

1. **Services**: Business logic (medication creation, dose logging)
2. **Utilities**: Pure functions (date formatting, schedule calculation)
3. **Hooks**: Data fetching and state management
4. **Components**: UI rendering and interactions

### Recommended Testing Stack

- **Jest**: Test runner (comes with Expo)
- **React Native Testing Library**: Component testing
- **Mock expo-sqlite**: For database tests

### Example Test Structure

```typescript
// src/services/__tests__/medication.service.test.ts
import { MedicationService } from '../medication.service';

describe('MedicationService', () => {
  describe('create', () => {
    it('should create a medication with valid data', async () => {
      const data = {
        name: 'Aspirin',
        dosage: '100mg',
        // ...
      };
      
      const medication = await MedicationService.create(data);
      
      expect(medication.name).toBe('Aspirin');
      expect(medication.dosage).toBe('100mg');
    });
    
    it('should throw error if name is empty', async () => {
      const data = { name: '', dosage: '100mg' };
      
      await expect(
        MedicationService.create(data)
      ).rejects.toThrow('Name is required');
    });
  });
});
```

### Manual Testing Checklist

Until automated tests are added, manually test these scenarios:

**Medication Creation**:
- [ ] Can create daily medication
- [ ] Can create weekly medication
- [ ] Can create interval-based medication
- [ ] Can create as-needed medication
- [ ] Validation works (empty name, invalid time)

**Dose Logging**:
- [ ] Can mark dose as taken
- [ ] Can skip dose
- [ ] Can add note to dose log
- [ ] History updates after logging

**Notifications**:
- [ ] Notifications scheduled after creating medication
- [ ] Notifications cancelled when archiving medication
- [ ] Snooze works correctly

**Edge Cases**:
- [ ] Works offline
- [ ] Handles app restart (database persists)
- [ ] Timezone changes handled correctly

---

## Getting Help

### Resources

- **Documentation**: See `/docs` folder
- **Issues**: Check [GitHub Issues](https://github.com/yourusername/medminder/issues)
- **Discussions**: Use GitHub Discussions for questions

### Questions?

- **Bug reports**: Open an issue with steps to reproduce
- **Feature requests**: Open an issue describing the use case
- **General questions**: Start a discussion

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others when you can
- Focus on what's best for users (especially elderly users)

---

## First-Time Contributor Tips

Not sure where to start? Look for issues labeled:

- `good first issue`: Great for newcomers
- `help wanted`: We'd love contributions here
- `documentation`: Improve docs without touching code
- `testing`: Add automated tests

**Easy wins**:
1. Fix typos in documentation
2. Add JSDoc comments to undocumented functions
3. Write tests for utility functions
4. Improve error messages for better UX

---

Thank you for contributing to MedMinder! Every contribution helps make medication management easier for elderly users. 💊
