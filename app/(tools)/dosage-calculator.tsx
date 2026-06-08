import { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import {
  Spacing, FontSize, FontFamily, BorderRadius, Shadow, NigeriaColors,
} from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import GlowGlass from '../../src/components/GlowGlass';
import { useStats } from '../../src/context/StatsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type CalcMode = 'weight-based' | 'drip-rate' | 'bsa';

const MODES: { value: CalcMode; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
  { value: 'weight-based', label: 'Weight Based', icon: 'scale-outline', desc: 'mg/kg dosing' },
  { value: 'drip-rate', label: 'IV Drip Rate', icon: 'water-outline', desc: 'drops per min' },
  { value: 'bsa', label: 'Body Surface Area', icon: 'body-outline', desc: 'm² calculation' },
];

type CalcHistory = {
  id: number; mode: CalcMode; label: string; result: string; timestamp: Date;
};

export default function DosageCalculatorScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { incrementQuestions, startStudyTimer, stopStudyTimer } = useStats();

  const [mode, setMode] = useState<CalcMode>('weight-based');
  const [history, setHistory] = useState<CalcHistory[]>([]);
  const [showHistory, setShowHistory] = useState(true);

  const [weight, setWeight] = useState('');
  const [dosagePerKg, setDosagePerKg] = useState('');
  const [frequency, setFrequency] = useState('');
  const [concentration, setConcentration] = useState('');
  const [volume, setVolume] = useState('');
  const [time, setTime] = useState('');
  const [dropFactor, setDropFactor] = useState('20');
  const [heightVal, setHeightVal] = useState('');
  const [weightBSA, setWeightBSA] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [resultDetails, setResultDetails] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const calculate = () => {
    setError(null); setResult(null); setResultDetails([]); setShowResult(false);
    let res = ''; let details: string[] = []; let label = '';

    if (mode === 'weight-based') {
      const w = parseFloat(weight);
      const d = parseFloat(dosagePerKg);
      const f = parseFloat(frequency) || 1;
      const c = parseFloat(concentration);
      if (!w || !d || !c) { setError('Please fill in all required fields'); return; }
      const totalDailyMg = w * d;
      const perDoseMg = totalDailyMg / f;
      const perDoseMl = perDoseMg / c;
      res = `${perDoseMl.toFixed(2)} mL`;
      details = [
        `Total daily dose: ${totalDailyMg.toFixed(1)} mg`,
        `Per dose: ${perDoseMg.toFixed(1)} mg`,
        `Volume per dose: ${perDoseMl.toFixed(2)} mL (${c} mg/mL)`,
        `Frequency: ${f}x per day`,
      ];
      label = 'Weight-Based';
    } else if (mode === 'drip-rate') {
      const v = parseFloat(volume);
      const t = parseFloat(time);
      const df = parseFloat(dropFactor);
      if (!v || !t || !df) { setError('Please fill in all required fields'); return; }
      const rate = v / t;
      const drops = (v / (t * 60)) * df;
      res = `${Math.round(drops)} drops/min`;
      details = [
        `Volume: ${v} mL | Time: ${t} hrs`,
        `Rate: ${rate.toFixed(1)} mL/hr`,
        `Drop factor: ${df} drops/mL`,
      ];
      label = 'IV Drip Rate';
    } else if (mode === 'bsa') {
      const h = parseFloat(heightVal);
      const w = parseFloat(weightBSA);
      if (!h || !w) { setError('Please fill in both height and weight'); return; }
      const bsa = Math.sqrt((h * w) / 3600);
      res = `${bsa.toFixed(2)} m²`;
      details = [
        `Height: ${h} cm | Weight: ${w} kg`,
        `BSA = √(H × W / 3600)`,
        `Mosteller formula`,
      ];
      label = 'Body Surface Area';
    }

    setResult(res);
    setResultDetails(details);
    setShowResult(true);
    setAnimKey(k => k + 1);
    addHistory(label, res);
    incrementQuestions();
  };

  const addHistory = (label: string, res: string) => {
    setHistory(prev => [{ id: Date.now(), mode, label, result: res, timestamp: new Date() }, ...prev].slice(0, 10));
  };

  const clearAll = () => {
    setWeight(''); setDosagePerKg(''); setFrequency(''); setConcentration('');
    setVolume(''); setTime(''); setDropFactor('20');
    setHeightVal(''); setWeightBSA('');
    setResult(null); setResultDetails([]); setError(null); setShowResult(false);
  };

  useFocusEffect(
    useCallback(() => {
      startStudyTimer();
      return () => stopStudyTimer();
    }, [])
  );

  const fields = useMemo(() => {
    if (mode === 'weight-based') return [
      { key: 'weight', label: 'Patient Weight', unit: 'kg', val: weight, set: setWeight, placeholder: 'e.g. 70' },
      { key: 'dosage', label: 'Dosage', unit: 'mg/kg', val: dosagePerKg, set: setDosagePerKg, placeholder: 'e.g. 15' },
      { key: 'freq', label: 'Frequency', unit: '×/day', val: frequency, set: setFrequency, placeholder: 'e.g. 4' },
      { key: 'conc', label: 'Concentration', unit: 'mg/mL', val: concentration, set: setConcentration, placeholder: 'e.g. 50' },
    ];
    if (mode === 'drip-rate') return [
      { key: 'vol', label: 'Volume', unit: 'mL', val: volume, set: setVolume, placeholder: 'e.g. 500' },
      { key: 'time', label: 'Time', unit: 'hrs', val: time, set: setTime, placeholder: 'e.g. 8' },
      { key: 'df', label: 'Drop Factor', unit: 'drops/mL', val: dropFactor, set: setDropFactor, placeholder: 'e.g. 20' },
    ];
    return [
      { key: 'h', label: 'Height', unit: 'cm', val: heightVal, set: setHeightVal, placeholder: 'e.g. 170' },
      { key: 'w', label: 'Weight', unit: 'kg', val: weightBSA, set: setWeightBSA, placeholder: 'e.g. 70' },
    ];
  }, [mode, weight, dosagePerKg, frequency, concentration, volume, time, dropFactor, heightVal, weightBSA]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#0A1628', '#080C1A'] : ['#F0F4F8', '#E8F0F0']}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <View style={styles.headerGlass}>
          <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['rgba(0,135,81,0.15)', 'rgba(0,135,81,0.05)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={22} color={isDark ? '#fff' : '#1a1a2e'} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.headerIconRow}>
                <LinearGradient
                  colors={[NigeriaColors.green, '#00A859']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.headerIconGlow}
                >
                  <Ionicons name="calculator" size={20} color="#fff" />
                </LinearGradient>
                <View>
                  <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#1a1a2e' }]}>
                    Dosage Calculator
                  </Text>
                  <Text style={[styles.headerSub, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]}>
                    Safe & accurate drug calculations
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={clearAll} style={styles.headerBtn}>
              <Ionicons name="refresh" size={20} color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Mode Selector */}
          <GlowGlass variant="green" blurIntensity={60} glowIntensity="low">
            <View style={styles.modeSelector}>
              <Text style={[styles.selectorLabel, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]}>
                Calculation Mode
              </Text>
              <View style={styles.modeRow}>
                {MODES.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[
                      styles.modeItem,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                      mode === m.value && styles.modeItemActive,
                    ]}
                    onPress={() => { setMode(m.value); setResult(null); setShowResult(false); setError(null); }}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.modeIconWrap,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' },
                      mode === m.value && { backgroundColor: 'rgba(0,135,81,0.2)' },
                    ]}>
                      <Ionicons
                        name={m.icon}
                        size={18}
                        color={mode === m.value ? NigeriaColors.green : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)')}
                      />
                    </View>
                    <View style={styles.modeTextWrap}>
                      <Text style={[
                        styles.modeLabel,
                        { color: isDark ? '#fff' : '#1a1a2e' },
                        mode === m.value && { color: NigeriaColors.green },
                      ]}>
                        {m.label}
                      </Text>
                      <Text style={[styles.modeDesc, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>
                        {m.desc}
                      </Text>
                    </View>
                    {mode === m.value && (
                      <View style={styles.modeCheck}>
                        <Ionicons name="checkmark-circle" size={16} color={NigeriaColors.green} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </GlowGlass>

          {/* Input Form */}
          <GlowGlass variant="default" blurIntensity={70} glowIntensity="low">
            <View style={styles.formSection}>
              <View style={styles.formHeaderRow}>
                <View style={styles.formHeaderLeft}>
                  <LinearGradient
                    colors={[NigeriaColors.green, '#00A859']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.formHeaderIcon}
                  >
                    <Ionicons name="pencil" size={14} color="#fff" />
                  </LinearGradient>
                  <Text style={[styles.formTitle, { color: isDark ? '#fff' : '#1a1a2e' }]}>
                    Enter Values
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.presetBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
                  onPress={() => {
                    if (mode === 'weight-based') { setWeight('70'); setDosagePerKg('15'); setFrequency('4'); setConcentration('50'); }
                    else if (mode === 'drip-rate') { setVolume('500'); setTime('8'); setDropFactor('20'); }
                    else { setHeightVal('170'); setWeightBSA('70'); }
                  }}
                >
                  <Ionicons name="flash-outline" size={14} color={NigeriaColors.green} />
                  <Text style={[styles.presetText, { color: NigeriaColors.green }]}>Fill</Text>
                </TouchableOpacity>
              </View>
              {fields.map((f, i) => (
                <Animated.View
                  key={f.key}
                  entering={FadeInDown.delay(50 * i).duration(300).springify()}
                  layout={Layout.springify()}
                >
                  <View style={[styles.fieldRow, { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                    <Text style={[styles.fieldLabel, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]}>
                      {f.label}
                    </Text>
                    <View style={styles.fieldInputWrap}>
                      <TextInput
                        style={[styles.fieldInput, { color: isDark ? '#fff' : '#1a1a2e' }]}
                        value={f.val}
                        onChangeText={f.set}
                        placeholder={f.placeholder}
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}
                        keyboardType="decimal-pad"
                      />
                      <Text style={[styles.fieldUnit, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>
                        {f.unit}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>
          </GlowGlass>

          {/* Calculate Button */}
          <TouchableOpacity onPress={calculate} activeOpacity={0.85}>
            <LinearGradient
              colors={[NigeriaColors.green, '#006B3F']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.calcButton}
            >
              <View style={styles.calcBtnContent}>
                <View style={styles.calcBtnIcon}>
                  <Ionicons name="flash" size={20} color="#fff" />
                </View>
                <Text style={styles.calcBtnText}>Calculate Now</Text>
                <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Error */}
          {error && (
            <Animated.View entering={FadeInDown.duration(300)}>
              <GlowGlass variant="default" blurIntensity={50} glowIntensity="low" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={18} color="#EF4444" />
                  <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
                </View>
              </GlowGlass>
            </Animated.View>
          )}

          {/* Result */}
          {showResult && result && (
            <Animated.View key={animKey} entering={FadeInDown.duration(500).springify()}>
              <GlowGlass variant="green" blurIntensity={80} glowIntensity="high" style={styles.resultGlassCard}>
                <View style={styles.resultSection}>
                  <View style={styles.resultBadgeRow}>
                    <LinearGradient
                      colors={[NigeriaColors.green, '#00A859']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={styles.resultBadge}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    </LinearGradient>
                    <Text style={[styles.resultBadgeLabel, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]}>
                      Calculated Result
                    </Text>
                  </View>
                  <Text style={[styles.resultValue, { color: NigeriaColors.green }]}>
                    {result}
                  </Text>
                  <View style={[styles.resultDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />
                  {resultDetails.map((d, i) => (
                    <View key={i} style={styles.resultDetailRow}>
                      <View style={[styles.resultDot, { backgroundColor: NigeriaColors.green + '50' }]} />
                      <Text style={[styles.resultDetailText, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }]}>
                        {d}
                      </Text>
                    </View>
                  ))}
                </View>
              </GlowGlass>
            </Animated.View>
          )}

          {/* History */}
          {history.length > 0 && (
            <GlowGlass variant="subtle" blurIntensity={40} glowIntensity="low">
              <TouchableOpacity style={[styles.historyHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} onPress={() => setShowHistory(!showHistory)}>
                <View style={styles.historyHeaderLeft}>
                  <Ionicons name="time-outline" size={16} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />
                  <Text style={[styles.historyHeaderTitle, { color: isDark ? '#fff' : '#1a1a2e' }]}>History</Text>
                  <View style={[styles.historyCountBadge, { backgroundColor: NigeriaColors.green + '20' }]}>
                    <Text style={[styles.historyCountText, { color: NigeriaColors.green }]}>{history.length}</Text>
                  </View>
                </View>
                <Ionicons name={showHistory ? 'chevron-up' : 'chevron-down'} size={16} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'} />
              </TouchableOpacity>
              {showHistory && (
                <View style={styles.historyList}>
                  {history.map((h) => (
                    <View key={h.id} style={[styles.historyItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]}>
                      <View style={styles.historyItemInfo}>
                        <Text style={[styles.historyItemLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>
                          {h.label}
                        </Text>
                        <Text style={[styles.historyItemTime, { color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }]}>
                          {h.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <Text style={[styles.historyItemResult, { color: NigeriaColors.green }]}>{h.result}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlowGlass>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  safeTop: { zIndex: 10 },
  headerGlass: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    overflow: 'hidden',
    borderBottomWidth: 0,
    boxShadow: '0 4px 16px rgba(0,135,81,0.1)',
    elevation: 6,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 },
  headerBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerIconRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerIconGlow: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,135,81,0.4)',
    elevation: 8,
  },
  headerTitle: { fontFamily: FontFamily.display, fontSize: FontSize.lg },
  headerSub: { fontFamily: FontFamily.body, fontSize: FontSize.xs, marginTop: 1 },
  scroll: { padding: Spacing.md, paddingTop: Spacing.sm },

  /* Mode Selector */
  modeSelector: { padding: Spacing.sm },
  selectorLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: Spacing.sm, marginLeft: 2 },
  modeRow: { gap: Spacing.sm },
  modeItem: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.md, padding: Spacing.sm + 2,
    gap: Spacing.sm,
  },
  modeItemActive: {
    backgroundColor: 'rgba(0,135,81,0.08)',
  },
  modeIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  modeTextWrap: { flex: 1 },
  modeLabel: { fontFamily: FontFamily.heading, fontSize: FontSize.sm },
  modeDesc: { fontFamily: FontFamily.body, fontSize: FontSize.xs, marginTop: 1 },
  modeCheck: { width: 24, alignItems: 'center' },

  /* Form */
  formSection: { padding: Spacing.sm },
  formHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  formHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  formHeaderIcon: { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  formTitle: { fontFamily: FontFamily.heading, fontSize: FontSize.md },
  presetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  presetText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs },
  fieldRow: { marginBottom: Spacing.sm, borderBottomWidth: 1, paddingBottom: Spacing.sm },
  fieldLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs, marginBottom: Spacing.xs },
  fieldInputWrap: { flexDirection: 'row', alignItems: 'center' },
  fieldInput: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.md, paddingVertical: Spacing.xs + 2 },
  fieldUnit: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.xs, marginLeft: Spacing.sm },

  /* Calculate */
  calcButton: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    boxShadow: '0 6px 16px rgba(0,135,81,0.4)',
    elevation: 10,
  },
  calcBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md + 2, gap: Spacing.sm },
  calcBtnIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  calcBtnText: { fontFamily: FontFamily.display, fontSize: FontSize.md, color: '#FFFFFF' },

  /* Error */
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  errorText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, flex: 1 },

  /* Result */
  resultGlassCard: { marginBottom: Spacing.md },
  resultSection: { padding: Spacing.sm },
  resultBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  resultBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  resultBadgeLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs, textTransform: 'uppercase', letterSpacing: 1 },
  resultValue: { fontFamily: FontFamily.displayExtra, fontSize: 36, letterSpacing: -0.5, marginBottom: Spacing.sm },
  resultDivider: { height: 1, marginBottom: Spacing.sm },
  resultDetailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  resultDot: { width: 5, height: 5, borderRadius: 2.5 },
  resultDetailText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, lineHeight: 20 },

  /* History */
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, paddingHorizontal: Spacing.sm },
  historyHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  historyHeaderTitle: { fontFamily: FontFamily.heading, fontSize: FontSize.sm },
  historyCountBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.full },
  historyCountText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.xs },
  historyList: { paddingHorizontal: Spacing.sm },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  historyItemInfo: { gap: 1 },
  historyItemLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs },
  historyItemTime: { fontFamily: FontFamily.body, fontSize: 10 },
  historyItemResult: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm },
});
