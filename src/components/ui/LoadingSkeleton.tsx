import { View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  className = '',
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`bg-gray-300 dark:bg-gray-600 ${className}`}
      style={{
        width: width as any,
        height,
        borderRadius,
        opacity,
      }}
    />
  );
}

// Pre-built skeleton patterns
export function MedicationCardSkeleton() {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex-row items-center">
      <Skeleton width={48} height={48} borderRadius={24} className="mr-4" />
      <View className="flex-1">
        <Skeleton width="60%" height={20} className="mb-2" />
        <Skeleton width="40%" height={16} />
      </View>
    </View>
  );
}

export function DoseCardSkeleton() {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4">
      <View className="flex-row items-center mb-3">
        <Skeleton width={40} height={40} borderRadius={20} className="mr-3" />
        <View className="flex-1">
          <Skeleton width="50%" height={18} className="mb-2" />
          <Skeleton width="30%" height={14} />
        </View>
      </View>
      <Skeleton width="100%" height={48} borderRadius={12} />
    </View>
  );
}

export function TimelineSectionSkeleton() {
  return (
    <View className="mb-6">
      <Skeleton width={120} height={24} className="mb-4" />
      <View className="gap-3">
        <DoseCardSkeleton />
        <DoseCardSkeleton />
      </View>
    </View>
  );
}
