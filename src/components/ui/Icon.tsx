import * as React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { colors, iconSizes } from '../../design/tokens';

export type IconSize = keyof typeof iconSizes | number;

export interface IconProps {
  /** SF Symbol name (preferred). */
  name: SFSymbol;
  /** Ionicons fallback name for Android/Web (recommended). */
  fallback?: keyof typeof Ionicons.glyphMap;
  size?: IconSize;
  color?: string;
  weight?: 'unspecified' | 'ultraLight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';
  type?: 'monochrome' | 'hierarchical' | 'palette' | 'multicolor';
  testID?: string;
}

export function Icon({
  name,
  fallback = 'ellipse',
  size = 'md',
  color = colors.surface[900],
  weight = 'regular',
  type = 'monochrome',
  testID,
}: IconProps) {
  const px = typeof size === 'number' ? size : iconSizes[size];

  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        testID={testID}
        name={name}
        size={px}
        tintColor={color}
        weight={weight}
        type={type}
        fallback={<Ionicons name={fallback} size={px} color={color} />}
      />
    );
  }

  return <Ionicons testID={testID} name={fallback} size={px} color={color} />;
}
