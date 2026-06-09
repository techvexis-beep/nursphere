import { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
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
import { useResponsiveCtx } from '../../src/context/ResponsiveContext';
import { scale, verticalScale, moderateScale, responsiveFontSize } from '../../src/utils/responsive';

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
  const resp = useResponsiveCtx();

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
          <View style={[styles.headerContent, { paddingHorizontal: resp.scale(Spacing.lg), paddingVertical: resp.scale(Spacing.md) }]}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.headerBtn, { width: resp.scale(36), height: resp.scale(36), borderRadius: resp.scale(10) }]}>
              <Ionicons name="arrow-back" size={moderateScale(22)} color={isDark ? '#fff' : '#1a1a2e'} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={[styles.headerIconRow, { gap: resp.scale(Spacing.sm) }]}>
                <LinearGradient
                  colors={[NigeriaColors.green, '#00A859']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[styles.headerIconGlow, { width: resp.scale(36), height: resp.scale(36), borderRadius: resp.scale(10) }]}
                >
                  <Ionicons name="calculator" size={resp.scale(20)} color="#fff" />
                </LinearGradient>
                <View>
                  <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#1a1a2e' }, { fontSize: resp.responsiveFontSize(FontSize.lg) }]}>
                    Dosage Calculator
                  </Text>
                  <Text style={[styles.headerSub, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>
                    Safe & accurate drug calculations
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={clearAll} style={[styles.headerBtn, { width: resp.scale(36), height: resp.scale(36), borderRadius: resp.scale(10) }]}>
              <Ionicons name="refresh" size={moderateScale(20)} color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { padding: resp.scale(Spacing.md), paddingTop: resp.scale(Spacing.sm) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Mode Selector */}
          <GlowGlass variant="green" blurIntensity={60} glowIntensity="low">
            <View style={[styles.modeSelector, { padding: resp.scale(Spacing.sm) }]}>
              <Text style={[styles.selectorLabel, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }, { fontSize: resp.responsiveFontSize(FontSize.xs), marginBottom: resp.scale(Spacing.sm) }]}>
                Calculation Mode
              </Text>
              <View style={[styles.modeRow, { gap: resp.scale(Spacing.sm) }]}>
                {MODES.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[
                      styles.modeItem,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                      mode === m.value && styles.modeItemActive,
                      { borderRadius: resp.scale(BorderRadius.md), padding: resp.scale(Spacing.sm + 2), gap: resp.scale(Spacing.sm) },
                    ]}
                    onPress={() => { setMode(m.value); setResult(null); setShowResult(false); setError(null); }}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.modeIconWrap,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' },
                      mode === m.value && { backgroundColor: 'rgba(0,135,81,0.2)' },
                      { width: resp.scale(40), height: resp.scale(40), borderRadius: resp.scale(12) },
                    ]}>
                      <Ionicons
                        name={m.icon}
                        size={resp.scale(18)}
                        color={mode === m.value ? NigeriaColors.green : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)')}
                      />
                    </View>
                    <View style={styles.modeTextWrap}>
                      <Text style={[
                        styles.modeLabel,
                        { color: isDark ? '#fff' : '#1a1a2e' },
                        mode === m.value && { color: NigeriaColors.green },
                        { fontSize: resp.responsiveFontSize(FontSize.sm) },
                      ]}>
                        {m.label}
                      </Text>
                      <Text style={[styles.modeDesc, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>
                        {m.desc}
                      </Text>
                    </View>
                    {mode === m.value && (
                      <View style={styles.modeCheck}>
                        <Ionicons name="checkmark-circle" size={resp.scale(16)} color={NigeriaColors.green} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </GlowGlass>

          {/* Input Form */}
          <GlowGlass variant="default" blurIntensity={70} glowIntensity="low">
            <View style={[styles.formSection, { padding: resp.scale(Spacing.sm) }]}>
              <View style={[styles.formHeaderRow, { marginBottom: resp.scale(Spacing.sm) }]}>
                <View style={[styles.formHeaderLeft, { gap: resp.scale(Spacing.sm) }]}>
                  <LinearGradient
                    colors={[NigeriaColors.green, '#00A859']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={[styles.formHeaderIcon, { width: resp.scale(24), height: resp.scale(24), borderRadius: resp.scale(8) }]}
                  >
                    <Ionicons name="pencil" size={resp.scale(14)} color="#fff" />
                  </LinearGradient>
                  <Text style={[styles.formTitle, { color: isDark ? '#fff' : '#1a1a2e' }, { fontSize: resp.responsiveFontSize(FontSize.md) }]}>
                    Enter Values
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.presetBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }, { paddingHorizontal: resp.scale(Spacing.sm), paddingVertical: resp.scale(Spacing.xs), borderRadius: resp.scale(BorderRadius.full) }]}
                  onPress={() => {
                    if (mode === 'weight-based') { setWeight('70'); setDosagePerKg('15'); setFrequency('4'); setConcentration('50'); }
                    else if (mode === 'drip-rate') { setVolume('500'); setTime('8'); setDropFactor('20'); }
                    else { setHeightVal('170'); setWeightBSA('70'); }
                  }}
                >
                  <Ionicons name="flash-outline" size={resp.scale(14)} color={NigeriaColors.green} />
                  <Text style={[styles.presetText, { color: NigeriaColors.green }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>Fill</Text>
                </TouchableOpacity>
              </View>
              {fields.map((f, i) => (
                <Animated.View
                  key={f.key}
                  entering={FadeInDown.delay(50 * i).duration(300).springify()}
                  layout={Layout.springify()}
                >
                  <View style={[styles.fieldRow, { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }, { marginBottom: resp.scale(Spacing.sm), paddingBottom: resp.scale(Spacing.sm) }]}>
                    <Text style={[styles.fieldLabel, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }, { fontSize: resp.responsiveFontSize(FontSize.xs), marginBottom: resp.scale(Spacing.xs) }]}>
                      {f.label}
                    </Text>
                    <View style={styles.fieldInputWrap}>
                      <TextInput
                        style={[styles.fieldInput, { color: isDark ? '#fff' : '#1a1a2e' }, { fontSize: resp.responsiveFontSize(FontSize.md), paddingVertical: resp.scale(Spacing.xs + 2) }]}
                        value={f.val}
                        onChangeText={f.set}
                        placeholder={f.placeholder}
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}
                        keyboardType="decimal-pad"
                      />
                      <Text style={[styles.fieldUnit, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }, { fontSize: resp.responsiveFontSize(FontSize.xs), marginLeft: resp.scale(Spacing.sm) }]}>
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
              style={[styles.calcButton, { borderRadius: resp.scale(BorderRadius.md), marginBottom: resp.scale(Spacing.md) }]}
            >
              <View style={[styles.calcBtnContent, { paddingVertical: resp.scale(Spacing.md + 2), gap: resp.scale(Spacing.sm) }]}>
                <View style={[styles.calcBtnIcon, { width: resp.scale(32), height: resp.scale(32), borderRadius: resp.scale(8) }]}>
                  <Ionicons name="flash" size={resp.scale(20)} color="#fff" />
                </View>
                <Text style={[styles.calcBtnText, { fontSize: resp.responsiveFontSize(FontSize.md) }]}>Calculate Now</Text>
                <Ionicons name="arrow-forward" size={resp.scale(18)} color="rgba(255,255,255,0.7)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Error */}
          {error && (
            <Animated.View entering={FadeInDown.duration(300)}>
              <GlowGlass variant="default" blurIntensity={50} glowIntensity="low" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
                <View style={[styles.errorRow, { gap: resp.scale(Spacing.sm) }]}>
                  <Ionicons name="alert-circle" size={resp.scale(18)} color="#EF4444" />
                  <Text style={[styles.errorText, { color: '#EF4444' }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>{error}</Text>
                </View>
              </GlowGlass>
            </Animated.View>
          )}

          {/* Result */}
          {showResult && result && (
            <Animated.View key={animKey} entering={FadeInDown.duration(500).springify()}>
              <GlowGlass variant="green" blurIntensity={80} glowIntensity="high" style={{ marginBottom: resp.scale(Spacing.md) }}>
                <View style={[styles.resultSection, { padding: resp.scale(Spacing.sm) }]}>
                  <View style={[styles.resultBadgeRow, { gap: resp.scale(Spacing.sm), marginBottom: resp.scale(Spacing.sm) }]}>
                    <LinearGradient
                      colors={[NigeriaColors.green, '#00A859']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={[styles.resultBadge, { width: resp.scale(28), height: resp.scale(28), borderRadius: resp.scale(14) }]}
                    >
                      <Ionicons name="checkmark-circle" size={resp.scale(16)} color="#fff" />
                    </LinearGradient>
                    <Text style={[styles.resultBadgeLabel, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>
                      Calculated Result
                    </Text>
                  </View>
                  <Text style={[styles.resultValue, { color: NigeriaColors.green }, { fontSize: resp.moderateScale(36), letterSpacing: resp.moderateScale(-0.5), marginBottom: resp.scale(Spacing.sm) }]}>
                    {result}
                  </Text>
                  <View style={[styles.resultDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }, { height: 1, marginBottom: resp.scale(Spacing.sm) }]} />
                  {resultDetails.map((d, i) => (
                    <View key={i} style={[styles.resultDetailRow, { gap: resp.scale(Spacing.sm), marginBottom: resp.scale(4) }]}>
                      <View style={[styles.resultDot, { backgroundColor: NigeriaColors.green + '50' }, { width: resp.scale(5), height: resp.scale(5), borderRadius: resp.scale(2.5) }]} />
                      <Text style={[styles.resultDetailText, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }, { fontSize: resp.responsiveFontSize(FontSize.sm), lineHeight: resp.verticalScale(20) }]}>
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
              <TouchableOpacity style={[styles.historyHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }, { paddingVertical: resp.scale(Spacing.sm), paddingHorizontal: resp.scale(Spacing.sm) }]} onPress={() => setShowHistory(!showHistory)}>
                <View style={[styles.historyHeaderLeft, { gap: resp.scale(Spacing.sm) }]}>
                  <Ionicons name="time-outline" size={resp.scale(16)} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />
                  <Text style={[styles.historyHeaderTitle, { color: isDark ? '#fff' : '#1a1a2e' }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>History</Text>
                  <View style={[styles.historyCountBadge, { backgroundColor: NigeriaColors.green + '20' }, { paddingHorizontal: resp.scale(6), paddingVertical: resp.scale(1), borderRadius: resp.scale(BorderRadius.full) }]}>
                    <Text style={[styles.historyCountText, { color: NigeriaColors.green }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{history.length}</Text>
                  </View>
                </View>
                <Ionicons name={showHistory ? 'chevron-up' : 'chevron-down'} size={resp.scale(16)} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'} />
              </TouchableOpacity>
              {showHistory && (
                <View style={[styles.historyList, { paddingHorizontal: resp.scale(Spacing.sm) }]}>
                  {history.map((h) => (
                    <View key={h.id} style={[styles.historyItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }, { paddingVertical: resp.scale(Spacing.sm) }]}>
                      <View style={styles.historyItemInfo}>
                        <Text style={[styles.historyItemLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>
                          {h.label}
                        </Text>
                        <Text style={[styles.historyItemTime, { color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }, { fontSize: resp.responsiveFontSize(10) }]}>
                          {h.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <Text style={[styles.historyItemResult, { color: NigeriaColors.green }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>{h.result}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlowGlass>
          )}

          <View style={{ height: verticalScale(100) }} />
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
    overflow: 'hidden',
    borderBottomWidth: 0,
    boxShadow: '0 4px 16px rgba(0,135,81,0.1)',
    elevation: 6,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 },
  headerBtn: { justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerIconRow: { flexDirection: 'row', alignItems: 'center' },
  headerIconGlow: {
    justifyContent: 'center', alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,135,81,0.4)',
    elevation: 8,
  },
  headerTitle: { fontFamily: FontFamily.display },
  headerSub: { fontFamily: FontFamily.body, marginTop: 1 },
  scroll: {},

  /* Mode Selector */
  modeSelector: {},
  selectorLabel: { fontFamily: FontFamily.body, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 2 },
  modeRow: {},
  modeItem: {
    flexDirection: 'row', alignItems: 'center',
  },
  modeItemActive: {
    backgroundColor: 'rgba(0,135,81,0.08)',
  },
  modeIconWrap: {
    justifyContent: 'center', alignItems: 'center',
  },
  modeTextWrap: { flex: 1 },
  modeLabel: { fontFamily: FontFamily.heading },
  modeDesc: { fontFamily: FontFamily.body, marginTop: 1 },
  modeCheck: { width: 24, alignItems: 'center' },

  /* Form */
  formSection: {},
  formHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  formHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  formHeaderIcon: { justifyContent: 'center', alignItems: 'center' },
  formTitle: { fontFamily: FontFamily.heading },
  presetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  presetText: { fontFamily: FontFamily.bodySemiBold },
  fieldRow: { borderBottomWidth: 1 },
  fieldLabel: { fontFamily: FontFamily.body },
  fieldInputWrap: { flexDirection: 'row', alignItems: 'center' },
  fieldInput: { flex: 1, fontFamily: FontFamily.body },
  fieldUnit: { fontFamily: FontFamily.bodyMedium },

  /* Calculate */
  calcButton: {
    boxShadow: '0 6px 16px rgba(0,135,81,0.4)',
    elevation: 10,
  },
  calcBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  calcBtnIcon: { backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  calcBtnText: { fontFamily: FontFamily.display, color: '#FFFFFF' },

  /* Error */
  errorRow: { flexDirection: 'row', alignItems: 'center' },
  errorText: { fontFamily: FontFamily.body, flex: 1 },

  /* Result */
  resultGlassCard: {},
  resultSection: {},
  resultBadgeRow: { flexDirection: 'row', alignItems: 'center' },
  resultBadge: { justifyContent: 'center', alignItems: 'center' },
  resultBadgeLabel: { fontFamily: FontFamily.body, textTransform: 'uppercase', letterSpacing: 1 },
  resultValue: { fontFamily: FontFamily.displayExtra },
  resultDivider: {},
  resultDetailRow: { flexDirection: 'row', alignItems: 'center' },
  resultDot: {},
  resultDetailText: { fontFamily: FontFamily.body },

  /* History */
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1 },
  historyHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  historyHeaderTitle: { fontFamily: FontFamily.heading },
  historyCountBadge: {},
  historyCountText: { fontFamily: FontFamily.bodyBold },
  historyList: {},
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  historyItemInfo: { gap: 1 },
  historyItemLabel: { fontFamily: FontFamily.body },
  historyItemTime: { fontFamily: FontFamily.body },
  historyItemResult: { fontFamily: FontFamily.bodyBold },
});
