import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, FontFamily, NigeriaColors } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useResponsiveCtx } from '../../src/context/ResponsiveContext';
import { scale, moderateScale } from '../../src/utils/responsive';

export default function TabLayout() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { isTablet, layoutMode, width } = useResponsiveCtx();
  if (!user) return <Redirect href="/(auth)/login" />;

  const tabBarW = isTablet ? Math.min(width * 0.85, 800) : width - scale(32);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          position: 'absolute',
          bottom: isTablet ? scale(24) : scale(16),
          left: isTablet ? (width - tabBarW) / 2 : scale(16),
          right: isTablet ? (width - tabBarW) / 2 : scale(16),
          width: isTablet ? tabBarW : undefined,
          borderTopWidth: 0,
          height: isTablet ? moderateScale(72) : moderateScale(64),
          paddingBottom: moderateScale(6),
          paddingTop: moderateScale(6),
          backgroundColor: isDark ? '#151b2e' : '#ffffff',
          borderRadius: isTablet ? BorderRadius.xxl : BorderRadius.xl,
          boxShadow: isDark ? '0 0 20px rgba(0,0,0,0.5)' : '0 0 20px rgba(0,135,81,0.15)',
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontFamily: FontFamily.bodyMedium,
          fontSize: moderateScale(10),
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
        tabBarItemStyle: isTablet ? {
          paddingHorizontal: scale(8),
        } : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={moderateScale(22)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: 'AI',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={moderateScale(22)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="career-roadmap"
        options={{
          title: 'Roadmap',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={moderateScale(22)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={moderateScale(22)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={moderateScale(22)} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
