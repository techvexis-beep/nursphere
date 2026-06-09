import { Redirect, Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useResponsiveCtx } from '../../src/context/ResponsiveContext';
import { contentMaxWidth } from '../../src/utils/responsive';

export default function ToolsLayout() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const resp = useResponsiveCtx();
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
          maxWidth: resp.contentWidth(),
          alignSelf: 'center' as const,
          width: '100%',
        },
        animation: 'slide_from_right',
        animationDuration: 350,
      }}
    >
      <Stack.Screen
        name="dosage-calculator"
        options={{ animation: 'slide_from_bottom', animationDuration: 350 }}
      />
      <Stack.Screen
        name="clinical-diagnosis"
        options={{ animation: 'slide_from_right', animationDuration: 350 }}
      />
      <Stack.Screen
        name="drug-reference"
        options={{ animation: 'slide_from_right', animationDuration: 350 }}
      />
      <Stack.Screen
        name="nursing-guides"
        options={{ animation: 'fade_from_bottom', animationDuration: 350 }}
      />
    </Stack>
  );
}
