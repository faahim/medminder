import { ReactNode } from 'react';
import { Screen } from './Screen';

interface ScreenWrapperProps {
  children: ReactNode;
  scrollable?: boolean;
  className?: string;
}

// Legacy wrapper used across the app.
// Prefer using <Screen /> directly for new screens.
export function ScreenWrapper({ children, scrollable = false, className = '' }: ScreenWrapperProps) {
  return (
    <Screen
      scroll={scrollable}
      keyboardAvoiding={scrollable}
      padX={0}
      padY={0}
      backgroundClassName="bg-surface-50"
      className={className}
      includeTopInset
      includeBottomInset
    >
      {children}
    </Screen>
  );
}
