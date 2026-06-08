import { Redirect, Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';

export default function AuthLayout() {
  const { user } = useAuth();
  const { colors } = useTheme();
  if (user) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        animationDuration: 400,
      }}
    >
      <Stack.Screen
        name="login"
        options={{ animation: 'fade', animationDuration: 500 }}
      />
      <Stack.Screen
        name="signup"
        options={{ animation: 'slide_from_right', animationDuration: 400 }}
      />
    </Stack>
  );
}
