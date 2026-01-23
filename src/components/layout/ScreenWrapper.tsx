import { View, ScrollView } from 'react-native';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
}

export function ScreenWrapper({ children, scrollable = false, className = '' }: ScreenWrapperProps) {
  if (scrollable) {
    return (
      <ScrollView 
        className={`flex-1 bg-gray-50 dark:bg-gray-900 ${className}`}
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View className={`flex-1 bg-gray-50 dark:bg-gray-900 ${className}`}>
      {children}
    </View>
  );
}
