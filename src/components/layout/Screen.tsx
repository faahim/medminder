import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, ViewStyle } from 'react-native';
import type { ReactElement } from 'react';
import type { RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function Screen({
  children,
  scroll = false,
  keyboardAvoiding = false,
  backgroundClassName = 'bg-surface-50',
  contentContainerStyle,
  refreshControl,
  className = '',
  padX = 0,
  padY = 0,
  padBottomExtra = 0,
  includeTopInset = true,
  includeBottomInset = true,
}: {
  children: ReactNode;
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  backgroundClassName?: string;
  className?: string;
  contentContainerStyle?: ViewStyle;
  refreshControl?: ReactElement<RefreshControlProps>;
  padX?: number;
  padY?: number;
  padBottomExtra?: number;
  includeTopInset?: boolean;
  includeBottomInset?: boolean;
}) {
  const insets = useSafeAreaInsets();

  const paddingTop = (includeTopInset ? insets.top : 0) + padY;
  const paddingBottom = (includeBottomInset ? insets.bottom : 0) + padY + padBottomExtra;

  const Container = keyboardAvoiding ? KeyboardAvoidingView : View;
  const containerProps = keyboardAvoiding
    ? {
        behavior: Platform.OS === 'ios' ? ('padding' as const) : undefined,
        keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 0,
      }
    : {};

  if (scroll) {
    return (
      <Container className={`flex-1 ${backgroundClassName} ${className}`} {...containerProps}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="never"
          refreshControl={refreshControl}
          contentContainerStyle={{
            paddingTop,
            paddingBottom,
            paddingHorizontal: padX,
            ...contentContainerStyle,
          }}
        >
          {children}
        </ScrollView>
      </Container>
    );
  }

  return (
    <Container
      className={`flex-1 ${backgroundClassName} ${className}`}
      style={{ paddingTop, paddingBottom, paddingHorizontal: padX }}
      {...containerProps}
    >
      {children}
    </Container>
  );
}
