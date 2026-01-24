import { ReactNode } from 'react';
import { View, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../ui/Typography';

type AppHeaderVariant = 'plain' | 'gradient';

export function AppHeader({
  title,
  subtitle,
  right,
  variant = 'plain',
  gradientColors = ['#06B6D4', '#0891B2'],
  bottomSlot,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  variant?: AppHeaderVariant;
  gradientColors?: [string, string];
  bottomSlot?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const pt = insets.top + 16;

  const Container: any = variant === 'gradient' ? LinearGradient : View;
  const containerProps =
    variant === 'gradient'
      ? { colors: gradientColors, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }
      : {};

  return (
    <Container
      {...containerProps}
      className={
        variant === 'gradient'
          ? 'px-6 pb-5'
          : 'bg-white px-6 pb-4 border-b border-surface-100'
      }
      style={{ paddingTop: pt }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          {subtitle ? (
            <Typography
              variant="small"
              className={variant === 'gradient' ? 'text-primary-100/90' : 'text-surface-500 uppercase tracking-wider'}
            >
              {subtitle}
            </Typography>
          ) : null}
          <Typography
            variant="h1"
            className={variant === 'gradient' ? 'text-white font-bold' : 'text-surface-900 font-bold'}
          >
            {title}
          </Typography>
        </View>

        {right ? <View className="flex-row items-center gap-2">{right}</View> : null}
      </View>

      {bottomSlot ? <View className="mt-4">{bottomSlot}</View> : null}
    </Container>
  );
}
