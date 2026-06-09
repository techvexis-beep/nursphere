import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useStats } from '../../src/context/StatsContext';
import { diagnoseWithNanda } from '../../src/services/gemini';
import { nandaDomains, searchDiagnoses } from '../../src/data/nandaDiagnoses';
import { useResponsiveCtx } from '../../src/context/ResponsiveContext';
import { scale, verticalScale, moderateScale, responsiveFontSize } from '../../src/utils/responsive';

type TabMode = 'ai-diagnosis' | 'browse';

type DiagnosisResult = {
  diagnosis: string; domain: string; class: string; type: string;
  definingCharacteristics: string[]; relatedFactors: string[];
  suggestedInterventions: string[]; expectedOutcomes: string[];
};

const PRESET_SYMPTOMS = [
  'Post-op patient with decreased urine output and hypotension',
  'Elderly patient with confusion, fever, and urinary frequency',
  'Child with difficulty breathing, wheezing, and cyanosis',
  'Diabetic patient with foot ulcer, redness, and purulent drainage',
];

function DetailSection({ icon, title, items, color }: { icon: keyof typeof Ionicons.glyphMap; title: string; items: string[]; color: string }) {
  const { colors } = useTheme();
  const resp = useResponsiveCtx();
  return (
    <View style={[detStyles.section, { marginBottom: resp.scale(Spacing.md) }]}>
      <View style={[detStyles.sectionHeader, { marginBottom: resp.scale(Spacing.sm) }]}>
        <Ionicons name={icon} size={moderateScale(18)} color={color} />
        <Text style={[detStyles.sectionTitle, { color }, { fontSize: resp.responsiveFontSize(FontSize.md), marginLeft: resp.scale(Spacing.sm) }]}>{title}</Text>
      </View>
      {items.map((item, i) => (
        <View key={i} style={[detStyles.itemRow, { marginBottom: resp.scale(Spacing.xs), paddingLeft: resp.scale(Spacing.sm + 4) }]}>
          <View style={[detStyles.bullet, { backgroundColor: color }, { width: resp.scale(6), height: resp.scale(6), borderRadius: resp.scale(3), marginTop: resp.scale(7), marginRight: resp.scale(Spacing.sm) }]} />
          <Text style={[detStyles.itemText, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm), lineHeight: resp.verticalScale(20) }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function parseDiagnosis(raw: string): DiagnosisResult {
  const lines = raw.split('\n').filter((l) => l.trim());
  const findSection = (keywords: string[]): string[] => {
    const startIdx = lines.findIndex((l) => keywords.some((k) => l.toLowerCase().includes(k.toLowerCase())));
    if (startIdx === -1) return [];
    const nextSectionHeaders = lines.slice(startIdx + 1).filter(l => /^\*\*/.test(l.trim()));
    const nextHeaderIdx = nextSectionHeaders.length > 0 ? lines.indexOf(nextSectionHeaders[0], startIdx + 1) : -1;
    const end = nextHeaderIdx === -1 ? lines.length : nextHeaderIdx;
    return lines.slice(startIdx + 1, end).map((l) => l.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim()).filter((l) => l.length > 3 && !keywords.some((k) => l.toLowerCase().includes(k.toLowerCase())));
  };
  const getField = (keyword: string): string => {
    const line = lines.find((l) => l.toLowerCase().startsWith('**' + keyword.toLowerCase()) || l.toLowerCase().includes('**' + keyword.toLowerCase()));
    if (line) { const val = line.split(':').slice(1).join(':').trim().replace(/\*\*/g, '').trim(); return val; }
    return '';
  };
  return {
    diagnosis: getField('nursing diagnosis') || getField('diagnosis') || 'NANDA-I diagnosis identified',
    domain: getField('domain') || 'N/A', class: getField('class') || 'N/A', type: getField('type') || 'N/A',
    definingCharacteristics: findSection(['defining characteristics', 'characteristics']),
    relatedFactors: findSection(['related factors', 'etiology', 'related to']),
    suggestedInterventions: findSection(['interventions', 'nursing interventions', 'suggested interventions']),
    expectedOutcomes: findSection(['expected outcomes', 'outcomes']),
  };
}

const detStyles = StyleSheet.create({
  section: {},
  sectionHeader: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontFamily: FontFamily.heading },
  itemRow: { flexDirection: 'row' },
  bullet: {},
  itemText: { fontFamily: FontFamily.body, flex: 1 },
});

export default function ClinicalDiagnosisScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { incrementQuestions, startStudyTimer, stopStudyTimer } = useStats();
  const resp = useResponsiveCtx();
  const [tab, setTab] = useState<TabMode>('ai-diagnosis');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDomain, setExpandedDomain] = useState<number | null>(null);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  const handleDiagnose = async (text?: string) => {
    const symptoms = (text || input).trim();
    if (!symptoms) return;
    setLoading(true); setError(null); setResult(null);
    try { const response = await diagnoseWithNanda(symptoms); setResult(parseDiagnosis(response)); incrementQuestions(); }
    catch { setError('Failed to get diagnosis. Please try again.'); }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      startStudyTimer();
      return () => stopStudyTimer();
    }, [])
  );

  const searchResults = searchQuery.trim() ? searchDiagnoses(searchQuery) : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <LinearGradient colors={['#6366F1', '#4F46E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.header, { paddingHorizontal: resp.scale(Spacing.lg), paddingVertical: resp.scale(Spacing.md) }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { width: resp.scale(36), height: resp.scale(36), borderRadius: resp.scale(10) }]}><Ionicons name="arrow-back" size={moderateScale(22)} color={colors.white} /></TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: resp.responsiveFontSize(FontSize.lg) }]}>Clinical Diagnosis</Text>
          <View style={{ width: resp.scale(36) }} />
        </View>
        <Text style={[styles.headerSub, { fontSize: resp.responsiveFontSize(FontSize.xs), marginTop: resp.scale(Spacing.xs) }]}>NANDA-I 2024-2026 · {nandaDomains.reduce((s, d) => s + d.classes.reduce((c, cl) => c + cl.diagnoses.length, 0), 0)} Diagnoses</Text>
      </LinearGradient>

      <View style={[styles.tabRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }, { paddingHorizontal: resp.scale(Spacing.md), paddingVertical: resp.scale(Spacing.sm), gap: resp.scale(Spacing.sm) }]}>
        <TouchableOpacity style={[styles.tab, { backgroundColor: colors.surfaceAlt }, tab === 'ai-diagnosis' && { backgroundColor: colors.primary + '12' }, { paddingVertical: resp.scale(Spacing.sm), borderRadius: resp.scale(BorderRadius.md), gap: resp.scale(Spacing.xs) }]} onPress={() => setTab('ai-diagnosis')}>
          <Ionicons name="sparkles" size={resp.scale(16)} color={tab === 'ai-diagnosis' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, { color: colors.textSecondary }, tab === 'ai-diagnosis' && { color: colors.primary }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>AI Diagnosis</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, { backgroundColor: colors.surfaceAlt }, tab === 'browse' && { backgroundColor: colors.primary + '12' }, { paddingVertical: resp.scale(Spacing.sm), borderRadius: resp.scale(BorderRadius.md), gap: resp.scale(Spacing.xs) }]} onPress={() => setTab('browse')}>
          <Ionicons name="book" size={resp.scale(16)} color={tab === 'browse' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, { color: colors.textSecondary }, tab === 'browse' && { color: colors.primary }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>Browse NANDA</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {tab === 'ai-diagnosis' ? (
          <ScrollView contentContainerStyle={[styles.scroll, { padding: resp.scale(Spacing.md) }]} keyboardShouldPersistTaps="handled">
            <View style={[styles.card, { backgroundColor: colors.surface }, { borderRadius: resp.scale(BorderRadius.lg), padding: resp.scale(Spacing.md), marginBottom: resp.scale(Spacing.md) }]}>
              <Text style={[styles.cardTitle, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.lg), marginBottom: resp.scale(Spacing.xs) }]}>Describe Patient Assessment</Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm), lineHeight: resp.verticalScale(20), marginBottom: resp.scale(Spacing.md) }]}>Enter the patient's signs, symptoms, vital signs, and relevant clinical findings. The AI will suggest an official NANDA-I 2024-2026 nursing diagnosis.</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }, { borderRadius: resp.scale(BorderRadius.md), paddingHorizontal: resp.scale(Spacing.md), paddingVertical: resp.scale(Spacing.sm), fontSize: resp.responsiveFontSize(FontSize.md), minHeight: resp.verticalScale(120), marginBottom: resp.scale(Spacing.md) }]} value={input} onChangeText={setInput} placeholder="e.g. 65-year-old male, post-hip replacement, reports pain 8/10..." placeholderTextColor={colors.textLight} multiline numberOfLines={5} textAlignVertical="top" />
              <TouchableOpacity style={[styles.diagnoseBtn, { backgroundColor: colors.secondary }, (!input.trim() || loading) && { opacity: 0.6 }, { borderRadius: resp.scale(BorderRadius.md), paddingVertical: resp.scale(Spacing.md), gap: resp.scale(Spacing.sm) }]} onPress={() => handleDiagnose()} disabled={!input.trim() || loading}>
                {loading ? <ActivityIndicator color={colors.white} size="small" /> : <><Ionicons name="medkit-outline" size={moderateScale(18)} color={colors.white} /><Text style={[styles.diagnoseBtnText, { fontSize: resp.responsiveFontSize(FontSize.md) }]}>Analyze & Diagnose</Text></>}
              </TouchableOpacity>
            </View>

            <View style={[styles.suggestionsRow, { marginBottom: resp.scale(Spacing.md) }]}>
              <Text style={[styles.suggestionsLabel, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm), marginBottom: resp.scale(Spacing.sm) }]}>Quick scenarios:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: resp.scale(Spacing.sm) }}>
                {PRESET_SYMPTOMS.map((s, i) => (
                  <TouchableOpacity key={i} style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }, { borderRadius: resp.scale(BorderRadius.lg), padding: resp.scale(Spacing.md), width: resp.moderateScale(160) }]} onPress={() => { setInput(s); handleDiagnose(s); }}>
                    <Text style={[styles.suggestionText, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.xs), lineHeight: resp.verticalScale(16) }]} numberOfLines={2}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {error && <View style={[styles.errorBox, { backgroundColor: colors.error + '10' }, { padding: resp.scale(Spacing.md), borderRadius: resp.scale(BorderRadius.md), marginBottom: resp.scale(Spacing.md) }]}><Ionicons name="alert-circle" size={resp.scale(16)} color={colors.error} /><Text style={[styles.errorText, { color: colors.error }, { fontSize: resp.responsiveFontSize(FontSize.sm), marginLeft: resp.scale(Spacing.sm) }]}>{error}</Text></View>}
            {loading && <View style={[styles.loadingBox, { padding: resp.scale(Spacing.xl) }]}><ActivityIndicator color={colors.primary} size="large" /><Text style={[styles.loadingText, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm), marginTop: resp.scale(Spacing.md) }]}>Analyzing against NANDA-I 2024-2026 taxonomy...</Text></View>}
            {result && !loading && (
              <Animated.View entering={FadeInDown.springify()} style={[styles.resultSection, { backgroundColor: colors.surface, borderColor: colors.success + '30' }, { borderRadius: resp.scale(BorderRadius.lg), padding: resp.scale(Spacing.md), marginBottom: resp.scale(Spacing.md) }]}>
                <View style={[styles.resultHeader, { marginBottom: resp.scale(Spacing.md) }]}><Ionicons name="checkmark-circle" size={moderateScale(22)} color={colors.success} /><Text style={[styles.resultTitle, { color: colors.success }, { fontSize: resp.responsiveFontSize(FontSize.lg), marginLeft: resp.scale(Spacing.sm) }]}>Nursing Diagnosis</Text></View>
                <View style={[styles.diagnosisBanner, { backgroundColor: colors.primary + '08', borderLeftColor: colors.primary }, { borderRadius: resp.scale(BorderRadius.md), padding: resp.scale(Spacing.md), marginBottom: resp.scale(Spacing.md) }]}><Text style={[styles.diagnosisText, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md), lineHeight: resp.verticalScale(22) }]}>{result.diagnosis}</Text></View>
                <View style={[styles.metaRow, { gap: resp.scale(Spacing.xs), marginBottom: resp.scale(Spacing.md) }]}>
                  <View style={[styles.metaChip, { backgroundColor: colors.primary + '15' }, { paddingHorizontal: resp.scale(Spacing.sm), paddingVertical: resp.scale(3), borderRadius: resp.scale(BorderRadius.full) }]}><Text style={[styles.metaChipText, { color: colors.primary }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{result.domain}</Text></View>
                  <View style={[styles.metaChip, { backgroundColor: colors.secondary + '15' }, { paddingHorizontal: resp.scale(Spacing.sm), paddingVertical: resp.scale(3), borderRadius: resp.scale(BorderRadius.full) }]}><Text style={[styles.metaChipText, { color: colors.secondary }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{result.class}</Text></View>
                  <View style={[styles.metaChip, { backgroundColor: colors.accent + '15' }, { paddingHorizontal: resp.scale(Spacing.sm), paddingVertical: resp.scale(3), borderRadius: resp.scale(BorderRadius.full) }]}><Text style={[styles.metaChipText, { color: colors.accent }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{result.type}</Text></View>
                </View>
                <DetailSection icon="analytics-outline" title="Defining Characteristics" items={result.definingCharacteristics} color={colors.primary} />
                <DetailSection icon="link-outline" title="Related Factors" items={result.relatedFactors} color={colors.accent} />
                <DetailSection icon="bulb-outline" title="Suggested Interventions" items={result.suggestedInterventions} color={colors.secondary} />
                {result.expectedOutcomes.length > 0 && <DetailSection icon="flag-outline" title="Expected Outcomes" items={result.expectedOutcomes} color={colors.success} />}
              </Animated.View>
            )}
            <View style={{ height: resp.scale(Spacing.xxl) }} />
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={[styles.scroll, { padding: resp.scale(Spacing.md) }]} keyboardShouldPersistTaps="handled">
            <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }, { borderRadius: resp.scale(BorderRadius.lg), paddingHorizontal: resp.scale(Spacing.md), marginBottom: resp.scale(Spacing.md), gap: resp.scale(Spacing.sm) }]}>
              <Ionicons name="search" size={moderateScale(18)} color={colors.textSecondary} />
              <TextInput style={[styles.searchInput, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md), paddingVertical: resp.scale(Spacing.sm + 2) }]} value={searchQuery} onChangeText={setSearchQuery} placeholder="Search diagnoses by name or code..." placeholderTextColor={colors.textLight} />
              {searchQuery ? <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={moderateScale(18)} color={colors.textLight} /></TouchableOpacity> : null}
            </View>

            {searchQuery.trim() ? (
              searchResults.length > 0 ? (
                <View style={{ gap: resp.scale(Spacing.sm) }}>
                  <Text style={[styles.searchCount, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm), marginBottom: resp.scale(Spacing.sm) }]}>{searchResults.length} result(s) found</Text>
                  {searchResults.map((r, i) => (
                    <Animated.View key={i} entering={FadeInDown.delay(i * 50).springify()} style={[styles.searchResultCard, { backgroundColor: colors.surface, borderColor: colors.border }, { borderRadius: resp.scale(BorderRadius.lg), padding: resp.scale(Spacing.md) }]}>
                      <View style={[styles.searchResultHeader, { marginBottom: resp.scale(Spacing.sm) }]}>
                        <LinearGradient colors={[['#0D9488', '#14B8A6'], ['#6366F1', '#818CF8']][i % 2] as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.resultCodeBadge, { width: resp.moderateScale(56), height: resp.moderateScale(28), borderRadius: resp.scale(8), marginRight: resp.scale(Spacing.sm) }]}><Text style={[styles.resultCodeText, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{r.diagnosis.code}</Text></LinearGradient>
                        <View style={styles.resultMeta}>
                          <Text style={[styles.resultDomainLabel, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{r.domain.name} &gt; {r.class.name}</Text>
                          <View style={[styles.typeBadge, { backgroundColor: r.diagnosis.type === 'risk' ? colors.warning + '20' : r.diagnosis.type === 'health-promotion' ? colors.success + '20' : colors.primary + '20' }, { paddingHorizontal: resp.scale(Spacing.sm), paddingVertical: resp.scale(1), borderRadius: resp.scale(BorderRadius.full), marginTop: resp.scale(2) }]}>
                            <Text style={[styles.typeBadgeText, { color: r.diagnosis.type === 'risk' ? colors.warning : r.diagnosis.type === 'health-promotion' ? colors.success : colors.primary }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{r.diagnosis.type}</Text>
                          </View>
                        </View>
                      </View>
                      <Text style={[styles.searchResultLabel, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md) }]}>{r.diagnosis.label}</Text>
                    </Animated.View>
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyState, { paddingVertical: resp.scale(Spacing.xxl * 2) }]}><Ionicons name="search-outline" size={resp.moderateScale(40)} color={colors.textLight} /><Text style={[styles.emptyText, { color: colors.textLight }, { fontSize: resp.responsiveFontSize(FontSize.md), marginTop: resp.scale(Spacing.md) }]}>No diagnoses match "{searchQuery}"</Text></View>
              )
            ) : (
              nandaDomains.map((domain) => {
                const isDomainOpen = expandedDomain === domain.id;
                const diagCount = domain.classes.reduce((s, c) => s + c.diagnoses.length, 0);
                return (
                  <Animated.View key={domain.id} entering={FadeInDown.delay(50).springify()} style={[styles.domainCard, { backgroundColor: colors.surface, borderColor: colors.border }, { borderRadius: resp.scale(BorderRadius.lg), marginBottom: resp.scale(Spacing.sm) }]}>
                    <TouchableOpacity style={[styles.domainHeader, { padding: resp.scale(Spacing.md) }]} onPress={() => setExpandedDomain(isDomainOpen ? null : domain.id)} activeOpacity={0.7}>
                      <LinearGradient colors={['#0D9488', '#14B8A6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.domainIcon, { width: resp.scale(32), height: resp.scale(32), borderRadius: resp.scale(10), marginRight: resp.scale(Spacing.sm) }]}><Text style={[styles.domainIconText, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>{domain.id}</Text></LinearGradient>
                      <View style={styles.domainInfo}>
                        <Text style={[styles.domainName, { color: colors.primary }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>Domain {domain.id}</Text>
                        <Text style={[styles.domainTitle, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md) }]}>{domain.name}</Text>
                        <Text style={[styles.domainCount, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.xs), marginTop: resp.scale(1) }]}>{diagCount} diagnoses across {domain.classes.filter(c => c.diagnoses.length > 0).length} classes</Text>
                      </View>
                      <Ionicons name={isDomainOpen ? 'chevron-up' : 'chevron-down'} size={moderateScale(20)} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {isDomainOpen && domain.classes.filter(c => c.diagnoses.length > 0).map((cls) => {
                      const isClassOpen = expandedClass === `${domain.id}-${cls.name}`;
                      return (
                        <View key={cls.name}>
                          <TouchableOpacity style={[styles.classHeader, { backgroundColor: colors.surfaceAlt }, { paddingHorizontal: resp.scale(Spacing.md), paddingVertical: resp.scale(Spacing.sm), marginLeft: resp.scale(Spacing.md + 32) }]} onPress={() => setExpandedClass(isClassOpen ? null : `${domain.id}-${cls.name}`)}>
                            <Text style={[styles.className, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>{cls.name}</Text>
                            <Text style={[styles.classCount, { color: colors.textLight }, { fontSize: resp.responsiveFontSize(FontSize.xs), marginRight: resp.scale(Spacing.sm) }]}>{cls.diagnoses.length}</Text>
                            <Ionicons name={isClassOpen ? 'chevron-up' : 'chevron-down'} size={resp.scale(16)} color={colors.textLight} />
                          </TouchableOpacity>
                          {isClassOpen && cls.diagnoses.map((diag, di) => (
                            <View key={di} style={[styles.diagRow, { paddingHorizontal: resp.scale(Spacing.md), paddingVertical: resp.scale(Spacing.xs), marginLeft: resp.scale(Spacing.md + 32) }]}>
                              <Text style={[styles.diagCode, { color: colors.primary }, { fontSize: resp.responsiveFontSize(FontSize.xs), width: resp.moderateScale(48) }]}>{diag.code}</Text>
                              <Text style={[styles.diagLabel, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>{diag.label}</Text>
                              <View style={[styles.diagType, { backgroundColor: diag.type === 'risk' ? colors.warning + '15' : diag.type === 'health-promotion' ? colors.success + '15' : colors.primary + '15' }, { paddingHorizontal: resp.scale(Spacing.xs + 2), paddingVertical: resp.scale(1), borderRadius: resp.scale(4) }]}>
                                <Text style={[styles.diagTypeText, { color: diag.type === 'risk' ? colors.warning : diag.type === 'health-promotion' ? colors.success : colors.primary }, { fontSize: resp.responsiveFontSize(9) }]}>{diag.type === 'problem-focused' ? 'PF' : diag.type === 'risk' ? 'RK' : diag.type === 'health-promotion' ? 'HP' : 'SY'}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      );
                    })}
                  </Animated.View>
                );
              })
            )}
            <View style={{ height: resp.scale(Spacing.xxl) }} />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, flex: { flex: 1 },
  header: {},
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: FontFamily.display, color: '#FFFFFF' },
  headerSub: { fontFamily: FontFamily.body, color: 'rgba(255,255,255,0.8)' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  tabText: { fontFamily: FontFamily.bodyMedium },
  scroll: {},
  card: { ...Shadow.sm },
  cardTitle: { fontFamily: FontFamily.heading },
  cardDesc: { fontFamily: FontFamily.body },
  input: { borderWidth: 1, fontFamily: FontFamily.body, textAlignVertical: 'top' },
  diagnoseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  diagnoseBtnText: { fontFamily: FontFamily.heading, color: '#FFFFFF' },
  suggestionsRow: {},
  suggestionsLabel: { fontFamily: FontFamily.bodyMedium },
  suggestionChip: { borderWidth: 1, ...Shadow.sm },
  suggestionText: { fontFamily: FontFamily.body },
  errorBox: { flexDirection: 'row', alignItems: 'center' },
  errorText: { fontFamily: FontFamily.body, flex: 1 },
  loadingBox: { alignItems: 'center' },
  loadingText: { fontFamily: FontFamily.body, textAlign: 'center' },
  resultSection: { borderWidth: 1, ...Shadow.sm },
  resultHeader: { flexDirection: 'row', alignItems: 'center' },
  resultTitle: { fontFamily: FontFamily.heading },
  diagnosisBanner: { borderLeftWidth: 3 },
  diagnosisText: { fontFamily: FontFamily.heading },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap' },
  metaChip: {},
  metaChipText: { fontFamily: FontFamily.bodySemiBold },
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, ...Shadow.sm },
  searchInput: { flex: 1, fontFamily: FontFamily.body },
  searchCount: { fontFamily: FontFamily.body },
  searchResultCard: { borderWidth: 1, ...Shadow.sm },
  searchResultHeader: { flexDirection: 'row', alignItems: 'center' },
  resultCodeBadge: { justifyContent: 'center', alignItems: 'center' },
  resultCodeText: { fontFamily: FontFamily.bodyBold, color: '#FFFFFF' },
  resultMeta: { flex: 1 },
  resultDomainLabel: { fontFamily: FontFamily.body },
  typeBadge: { alignSelf: 'flex-start' },
  typeBadgeText: { fontFamily: FontFamily.bodySemiBold },
  searchResultLabel: { fontFamily: FontFamily.heading },
  domainCard: { borderWidth: 1, ...Shadow.sm, overflow: 'hidden' },
  domainHeader: { flexDirection: 'row', alignItems: 'center' },
  domainIcon: { justifyContent: 'center', alignItems: 'center' },
  domainIconText: { fontFamily: FontFamily.bodyBold, color: '#FFFFFF' },
  domainInfo: { flex: 1 },
  domainName: { fontFamily: FontFamily.bodyMedium, textTransform: 'uppercase', letterSpacing: 1 },
  domainTitle: { fontFamily: FontFamily.heading },
  domainCount: { fontFamily: FontFamily.body },
  classHeader: { flexDirection: 'row', alignItems: 'center' },
  className: { fontFamily: FontFamily.bodyMedium, flex: 1 },
  classCount: { fontFamily: FontFamily.bodyBold },
  diagRow: { flexDirection: 'row', alignItems: 'center' },
  diagCode: { fontFamily: FontFamily.bodyBold },
  diagLabel: { fontFamily: FontFamily.body, flex: 1 },
  diagType: {},
  diagTypeText: { fontFamily: FontFamily.bodyBold },
  emptyState: { alignItems: 'center' },
  emptyText: { fontFamily: FontFamily.body },
});
