import { Tabs } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_BASE_HEIGHT, TAB_BAR_TOP_PADDING } from '../../src/constants/layout';
import { Icon as UIIcon } from '../../src/components/ui/Icon';

function AndroidTabIcon({
  sfSymbol,
  fallbackIcon,
  focused,
  color,
}: {
  sfSymbol: string;
  fallbackIcon: string;
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
      <UIIcon
        name={sfSymbol}
        fallback={fallbackIcon}
        size={22}
        color={color}
      />
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
      style={{
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      }}
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

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#06B6D4',
        tabBarInactiveTintColor: '#A3A3A3',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height,
          paddingBottom: insets.bottom,
          paddingTop: TAB_BAR_TOP_PADDING,
          shadowColor: 'rgba(0, 0, 0, 0.08)',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 1,
          shadowRadius: 8,
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
            <AndroidTabIcon sfSymbol="calendar" fallbackIcon="calendar" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'Meds',
          tabBarIcon: ({ color, focused }) => (
            <AndroidTabIcon sfSymbol="pills.fill" fallbackIcon="medkit" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <AndroidTabIcon sfSymbol="chart.bar.fill" fallbackIcon="bar-chart" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <AndroidTabIcon sfSymbol="gearshape.fill" fallbackIcon="settings" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return Platform.OS === 'ios' ? <IOSTabLayout /> : <AndroidTabLayout />;
}
