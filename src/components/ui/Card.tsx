import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <View className={`bg-white rounded-2xl border-2 border-surface-200 ${className}`}>
      {children}
    </View>
  );
}
