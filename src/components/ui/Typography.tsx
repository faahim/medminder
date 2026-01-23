import { Text, TextStyle } from 'react-native';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'label' | 'button';

interface TypographyProps {
  variant?: TypographyVariant;
  children: React.ReactNode;
  className?: string;
  numberOfLines?: number;
  style?: TextStyle;
}

const variantStyles: Record<TypographyVariant, string> = {
  h1: 'text-3xl font-bold',           // 30sp
  h2: 'text-2xl font-bold',           // 24sp
  h3: 'text-xl font-semibold',        // 20sp
  body: 'text-lg',                    // 18sp - minimum for elderly
  small: 'text-base',                 // 16sp
  label: 'text-base font-medium uppercase tracking-wider',
  button: 'text-lg font-semibold',    // 18sp
};

export function Typography({
  variant = 'body',
  children,
  className = '',
  numberOfLines,
  style,
}: TypographyProps) {
  return (
    <Text
      className={`${variantStyles[variant]} ${className}`}
      numberOfLines={numberOfLines}
      style={style}
      accessibilityRole={variant.startsWith('h') ? 'header' : 'text'}
    >
      {children}
    </Text>
  );
}
