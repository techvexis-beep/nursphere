import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow, NigeriaColors } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import GlowGlass from '../../src/components/GlowGlass';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [year, setYear] = useState('');
  const [institution, setInstitution] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const roles = [
    'BSN Student', 'Diploma Nursing Student', 'Registered Nurse (RN)',
    'Midwife', 'Nursing Educator', 'Nursing Assistant', 'Other',
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate'];

  const handleSignup = async () => {
    setError(null);
    const err = await signup(name.trim(), email.trim(), password, role, year, institution.trim());
    if (err) setError(err);
  };

  function PickerModal({ visible, options, onSelect, onClose, title }: {
    visible: boolean; options: string[]; onSelect: (v: string) => void; onClose: () => void; title: string;
  }) {
    if (!visible) return null;
    return (
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.modalOption, { borderBottomColor: colors.border }]}
              onPress={() => { onSelect(opt); onClose(); }}
            >
              <Text style={[styles.modalOptionText, { color: colors.text }]}>{opt}</Text>
              {(role === opt || year === opt) && (
                <Ionicons name="checkmark" size={20} color={NigeriaColors.green} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    );
  }

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
            <Text style={[styles.formTitle, { color: colors.text }]}>Create Account</Text>

            {error && (
              <View style={[styles.errorBox, { backgroundColor: colors.error + '10' }]}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
              <View style={[styles.inputWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Sarah Adekunle"
                  placeholderTextColor={colors.textLight}
                  autoCapitalize="words"
                />
              </View>
            </View>

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

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Role</Text>
              <TouchableOpacity
                style={[styles.inputWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}
                onPress={() => setShowRolePicker(true)}
              >
                <Ionicons name="medkit-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                <Text style={[styles.input, role ? { color: colors.text } : { color: colors.textLight }]}>
                  {role || 'Select your role'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            {role === 'BSN Student' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Year</Text>
                <TouchableOpacity
                  style={[styles.inputWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}
                  onPress={() => setShowYearPicker(true)}
                >
                  <Ionicons name="school-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                  <Text style={[styles.input, year ? { color: colors.text } : { color: colors.textLight }]}>
                    {year || 'Select your year'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.textLight} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Institution</Text>
              <View style={[styles.inputWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                <Ionicons name="business-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={institution}
                  onChangeText={setInstitution}
                  placeholder="e.g. University of Lagos"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: NigeriaColors.green }, isLoading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={[styles.footerLink, { color: NigeriaColors.green }]}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </GlowGlass>
        </Animated.View>
      </ScrollView>

      <PickerModal
        visible={showRolePicker}
        options={roles}
        onSelect={setRole}
        onClose={() => setShowRolePicker(false)}
        title="Select your role"
      />
      <PickerModal
        visible={showYearPicker}
        options={years}
        onSelect={setYear}
        onClose={() => setShowYearPicker(false)}
        title="Select your year"
      />
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
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center' as const,
    zIndex: 100,
  },
  modalContent: {
    width: '85%',
    maxHeight: '60%',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    ...Shadow.lg,
  },
  modalTitle: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.lg,
    marginBottom: Spacing.md,
    textAlign: 'center' as const,
  },
  modalOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
  },
});
