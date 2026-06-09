import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, LogBox, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { NigeriaColors } from '../src/constants/theme';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { StatsProvider } from '../src/context/StatsContext';
import { ResponsiveProvider } from '../src/context/ResponsiveContext';
import OnboardingScreen from '../src/components/OnboardingScreen';

LogBox.ignoreLogs(['[Reanimated]', '[Worklets]', '"shadow*" style props']);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        await Font.loadAsync({
          'Poppins_400Regular': Poppins_400Regular,
          'Poppins_500Medium': Poppins_500Medium,
          'Poppins_600SemiBold': Poppins_600SemiBold,
          'Poppins_700Bold': Poppins_700Bold,
          'Poppins_800ExtraBold': Poppins_800ExtraBold,
          'Geist-Regular': require('../assets/fonts/Geist-Regular.ttf'),
          'Geist-Medium': require('../assets/fonts/Geist-Medium.ttf'),
          'Geist-SemiBold': require('../assets/fonts/Geist-SemiBold.ttf'),
          'Geist-Bold': require('../assets/fonts/Geist-Bold.ttf'),
        });
      } catch (e) {
        console.warn('Font loading failed, using system fonts');
      }
      setFontsLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        {!fontsLoaded ? (
          <LinearGradient
            colors={[NigeriaColors.green, '#0D9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.loading}
          >
            <StatusBar style="light" />
          </LinearGradient>
        ) : showOnboarding ? (
          <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
        ) : (
          <ResponsiveProvider>
          <AuthProvider>
            <StatsProvider>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(tools)" />
              </Stack>
            </StatsProvider>
          </AuthProvider>
          </ResponsiveProvider>
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
