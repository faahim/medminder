import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <View className={`bg-white dark:bg-surface-800 rounded-2xl border-2 border-surface-200 dark:border-surface-700 ${className}`}>
      {children}
    </View>
  );
}
