import { Tabs } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Feather } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_BASE_HEIGHT, TAB_BAR_TOP_PADDING } from '../../src/constants/layout';
import { triggerHaptic } from '../../src/utils/haptics';

function AndroidTabIcon({
  name,
  focused,
  color,
}: {
  name: string;
  focused: boolean;
  color: string;
}) {
  return (
    <View
      style={
        focused
          ? { backgroundColor: 'rgba(6, 182, 212, 0.10)', padding: 7, borderRadius: 14 }
          : { padding: 7 }
      }
    >
      <Feather name={name as any} size={22} color={color} />
    </View>
  );
}

function IOSTabLayout() {
  return (
    <NativeTabs
      tintColor="#06B6D4"
      iconColor={{ default: '#A3A3A3', selected: '#06B6D4' }}
      labelStyle={{
        default: { fontSize: 11, fontWeight: '600', color: '#A3A3A3' },
        selected: { fontSize: 11, fontWeight: '600', color: '#06B6D4' },
      }}
      blurEffect="systemUltraThinMaterial"
      shadowColor="rgba(0,0,0,0.08)"
    >
      <NativeTabs.Trigger name="index">
        <Icon sf="calendar" />
        <Label>Today</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="medications">
        <Icon sf="pills.fill" />
        <Label>Meds</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <Icon sf="chart.bar.fill" />
        <Label>History</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf="gearshape.fill" />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function AndroidTabLayout() {
  const insets = useSafeAreaInsets();
  const height = TAB_BAR_BASE_HEIGHT + insets.bottom;

  const handleTabPress = () => {
    triggerHaptic('selection');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#06B6D4',
        tabBarInactiveTintColor: '#A3A3A3',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 0,
          height,
          paddingBottom: insets.bottom,
          paddingTop: TAB_BAR_TOP_PADDING,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 16,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -1,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <AndroidTabIcon name="calendar" focused={focused} color={color} />
          ),
          tabBarPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'Meds',
          tabBarIcon: ({ color, focused }) => (
            <AndroidTabIcon name="activity" focused={focused} color={color} />
          ),
          tabBarPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <AndroidTabIcon name="bar-chart-2" focused={focused} color={color} />
          ),
          tabBarPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <AndroidTabIcon name="settings" focused={focused} color={color} />
          ),
          tabBarPress: handleTabPress,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return Platform.OS === 'ios' ? <IOSTabLayout /> : <AndroidTabLayout />;
}
