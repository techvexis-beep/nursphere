import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow, NigeriaColors } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import GlowGlass from '../../src/components/GlowGlass';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError(null);
    const err = await login(email.trim(), password);
    if (err) setError(err);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.flagBar}>
          <View style={[styles.flagSeg, { backgroundColor: NigeriaColors.green }]} />
          <View style={[styles.flagSeg, { backgroundColor: colors.white }]} />
          <View style={[styles.flagSeg, { backgroundColor: NigeriaColors.green }]} />
        </View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.topSection}>
          <LinearGradient
            colors={[NigeriaColors.green, '#006B3F']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.logoWrap}
          >
            <Ionicons name="medkit" size={36} color={colors.white} />
          </LinearGradient>
          <Text style={[styles.appName, { color: colors.text }]}>Nursphere</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Your Nigerian Nursing Companion</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <GlowGlass variant="green" blurIntensity={60} glowIntensity="medium">
            <Text style={[styles.formTitle, { color: colors.text }]}>Welcome Back</Text>

            {error && (
              <View style={[styles.errorBox, { backgroundColor: colors.error + '10' }]}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
              <View style={[styles.inputWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="nurse@example.com"
                  placeholderTextColor={colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
              <View style={[styles.inputWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min 6 characters"
                  placeholderTextColor={colors.textLight}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: NigeriaColors.green }, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/signup')}>
                <Text style={[styles.footerLink, { color: NigeriaColors.green }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </GlowGlass>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  flagBar: { flexDirection: 'row', height: 3, borderRadius: 2, overflow: 'hidden', marginBottom: Spacing.md },
  flagSeg: { flex: 1 },
  topSection: { alignItems: 'center', marginBottom: Spacing.xl, marginTop: Spacing.xxl },
  logoWrap: {
    width: 72, height: 72, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
    boxShadow: '0 6px 16px rgba(0,135,81,0.35)',
    elevation: 10,
  },
  appName: { fontFamily: FontFamily.display, fontSize: FontSize.title },
  tagline: { fontFamily: FontFamily.body, fontSize: FontSize.sm, marginTop: 4 },
  formTitle: { fontFamily: FontFamily.heading, fontSize: FontSize.xl, marginBottom: Spacing.md },
  errorBox: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  errorText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, marginLeft: Spacing.sm, flex: 1 },
  inputGroup: { marginBottom: Spacing.md },
  inputLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs, marginBottom: Spacing.xs, marginLeft: 2 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, borderWidth: 1, paddingHorizontal: Spacing.md },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.md, paddingVertical: Spacing.sm + 2 },
  eyeBtn: { padding: Spacing.xs },
  button: {
    borderRadius: BorderRadius.md, paddingVertical: Spacing.md,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm,
    boxShadow: '0 4px 10px rgba(0,135,81,0.3)',
    elevation: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: FontFamily.heading, fontSize: FontSize.md, color: '#FFFFFF' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  footerText: { fontFamily: FontFamily.body, fontSize: FontSize.sm },
  footerLink: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm },
});
