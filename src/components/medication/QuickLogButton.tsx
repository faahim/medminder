import { Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';

interface QuickLogButtonProps {
  onPress: () => void;
  loading?: boolean;
  label?: string;
}

export function QuickLogButton({
  onPress,
  loading = false,
  label = 'Take Now',
}: QuickLogButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityLabel={label}
      accessibilityRole="button"
      className="
        flex-row items-center justify-center
        bg-green-500 active:bg-green-600
        py-4 rounded-xl
      "
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Typography variant="button" className="text-white ml-2">
            {label}
          </Typography>
        </>
      )}
    </Pressable>
  );
}
