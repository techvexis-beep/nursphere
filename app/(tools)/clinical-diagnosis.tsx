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
  return (
    <View style={detStyles.section}>
      <View style={detStyles.sectionHeader}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={[detStyles.sectionTitle, { color }]}>{title}</Text>
      </View>
      {items.map((item, i) => (
        <View key={i} style={detStyles.itemRow}>
          <View style={[detStyles.bullet, { backgroundColor: color }]} />
          <Text style={[detStyles.itemText, { color: colors.text }]}>{item}</Text>
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
  section: { marginBottom: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontFamily: FontFamily.heading, fontSize: FontSize.md, marginLeft: Spacing.sm },
  itemRow: { flexDirection: 'row', marginBottom: Spacing.xs, paddingLeft: Spacing.sm + 4 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7, marginRight: Spacing.sm },
  itemText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, flex: 1, lineHeight: 20, color: '#0F172A' },
});

export default function ClinicalDiagnosisScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { incrementQuestions, startStudyTimer, stopStudyTimer } = useStats();
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
      <LinearGradient colors={['#6366F1', '#4F46E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={22} color={colors.white} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Clinical Diagnosis</Text>
          <View style={{ width: 36 }} />
        </View>
        <Text style={styles.headerSub}>NANDA-I 2024-2026 · {nandaDomains.reduce((s, d) => s + d.classes.reduce((c, cl) => c + cl.diagnoses.length, 0), 0)} Diagnoses</Text>
      </LinearGradient>

      <View style={[styles.tabRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.tab, { backgroundColor: colors.surfaceAlt }, tab === 'ai-diagnosis' && { backgroundColor: colors.primary + '12' }]} onPress={() => setTab('ai-diagnosis')}>
          <Ionicons name="sparkles" size={16} color={tab === 'ai-diagnosis' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, { color: colors.textSecondary }, tab === 'ai-diagnosis' && { color: colors.primary }]}>AI Diagnosis</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, { backgroundColor: colors.surfaceAlt }, tab === 'browse' && { backgroundColor: colors.primary + '12' }]} onPress={() => setTab('browse')}>
          <Ionicons name="book" size={16} color={tab === 'browse' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, { color: colors.textSecondary }, tab === 'browse' && { color: colors.primary }]}>Browse NANDA</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {tab === 'ai-diagnosis' ? (
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Describe Patient Assessment</Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>Enter the patient's signs, symptoms, vital signs, and relevant clinical findings. The AI will suggest an official NANDA-I 2024-2026 nursing diagnosis.</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]} value={input} onChangeText={setInput} placeholder="e.g. 65-year-old male, post-hip replacement, reports pain 8/10..." placeholderTextColor={colors.textLight} multiline numberOfLines={5} textAlignVertical="top" />
              <TouchableOpacity style={[styles.diagnoseBtn, { backgroundColor: colors.secondary }, (!input.trim() || loading) && { opacity: 0.6 }]} onPress={() => handleDiagnose()} disabled={!input.trim() || loading}>
                {loading ? <ActivityIndicator color={colors.white} size="small" /> : <><Ionicons name="medkit-outline" size={18} color={colors.white} /><Text style={styles.diagnoseBtnText}>Analyze & Diagnose</Text></>}
              </TouchableOpacity>
            </View>

            <View style={styles.suggestionsRow}>
              <Text style={[styles.suggestionsLabel, { color: colors.textSecondary }]}>Quick scenarios:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
                {PRESET_SYMPTOMS.map((s, i) => (
                  <TouchableOpacity key={i} style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => { setInput(s); handleDiagnose(s); }}>
                    <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={2}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {error && <View style={[styles.errorBox, { backgroundColor: colors.error + '10' }]}><Ionicons name="alert-circle" size={16} color={colors.error} /><Text style={[styles.errorText, { color: colors.error }]}>{error}</Text></View>}
            {loading && <View style={styles.loadingBox}><ActivityIndicator color={colors.primary} size="large" /><Text style={[styles.loadingText, { color: colors.textSecondary }]}>Analyzing against NANDA-I 2024-2026 taxonomy...</Text></View>}
            {result && !loading && (
              <Animated.View entering={FadeInDown.springify()} style={[styles.resultSection, { backgroundColor: colors.surface, borderColor: colors.success + '30' }]}>
                <View style={styles.resultHeader}><Ionicons name="checkmark-circle" size={22} color={colors.success} /><Text style={[styles.resultTitle, { color: colors.success }]}>Nursing Diagnosis</Text></View>
                <View style={[styles.diagnosisBanner, { backgroundColor: colors.primary + '08', borderLeftColor: colors.primary }]}><Text style={[styles.diagnosisText, { color: colors.text }]}>{result.diagnosis}</Text></View>
                <View style={styles.metaRow}>
                  <View style={[styles.metaChip, { backgroundColor: colors.primary + '15' }]}><Text style={[styles.metaChipText, { color: colors.primary }]}>{result.domain}</Text></View>
                  <View style={[styles.metaChip, { backgroundColor: colors.secondary + '15' }]}><Text style={[styles.metaChipText, { color: colors.secondary }]}>{result.class}</Text></View>
                  <View style={[styles.metaChip, { backgroundColor: colors.accent + '15' }]}><Text style={[styles.metaChipText, { color: colors.accent }]}>{result.type}</Text></View>
                </View>
                <DetailSection icon="analytics-outline" title="Defining Characteristics" items={result.definingCharacteristics} color={colors.primary} />
                <DetailSection icon="link-outline" title="Related Factors" items={result.relatedFactors} color={colors.accent} />
                <DetailSection icon="bulb-outline" title="Suggested Interventions" items={result.suggestedInterventions} color={colors.secondary} />
                {result.expectedOutcomes.length > 0 && <DetailSection icon="flag-outline" title="Expected Outcomes" items={result.expectedOutcomes} color={colors.success} />}
              </Animated.View>
            )}
            <View style={{ height: Spacing.xxl }} />
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput style={[styles.searchInput, { color: colors.text }]} value={searchQuery} onChangeText={setSearchQuery} placeholder="Search diagnoses by name or code..." placeholderTextColor={colors.textLight} />
              {searchQuery ? <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color={colors.textLight} /></TouchableOpacity> : null}
            </View>

            {searchQuery.trim() ? (
              searchResults.length > 0 ? (
                <View style={{ gap: Spacing.sm }}>
                  <Text style={[styles.searchCount, { color: colors.textSecondary }]}>{searchResults.length} result(s) found</Text>
                  {searchResults.map((r, i) => (
                    <Animated.View key={i} entering={FadeInDown.delay(i * 50).springify()} style={[styles.searchResultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={styles.searchResultHeader}>
                        <LinearGradient colors={[['#0D9488', '#14B8A6'], ['#6366F1', '#818CF8']][i % 2] as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.resultCodeBadge}><Text style={styles.resultCodeText}>{r.diagnosis.code}</Text></LinearGradient>
                        <View style={styles.resultMeta}>
                          <Text style={[styles.resultDomainLabel, { color: colors.textSecondary }]}>{r.domain.name} &gt; {r.class.name}</Text>
                          <View style={[styles.typeBadge, { backgroundColor: r.diagnosis.type === 'risk' ? colors.warning + '20' : r.diagnosis.type === 'health-promotion' ? colors.success + '20' : colors.primary + '20' }]}>
                            <Text style={[styles.typeBadgeText, { color: r.diagnosis.type === 'risk' ? colors.warning : r.diagnosis.type === 'health-promotion' ? colors.success : colors.primary }]}>{r.diagnosis.type}</Text>
                          </View>
                        </View>
                      </View>
                      <Text style={[styles.searchResultLabel, { color: colors.text }]}>{r.diagnosis.label}</Text>
                    </Animated.View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}><Ionicons name="search-outline" size={40} color={colors.textLight} /><Text style={[styles.emptyText, { color: colors.textLight }]}>No diagnoses match "{searchQuery}"</Text></View>
              )
            ) : (
              nandaDomains.map((domain) => {
                const isDomainOpen = expandedDomain === domain.id;
                const diagCount = domain.classes.reduce((s, c) => s + c.diagnoses.length, 0);
                return (
                  <Animated.View key={domain.id} entering={FadeInDown.delay(50).springify()} style={[styles.domainCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TouchableOpacity style={styles.domainHeader} onPress={() => setExpandedDomain(isDomainOpen ? null : domain.id)} activeOpacity={0.7}>
                      <LinearGradient colors={['#0D9488', '#14B8A6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.domainIcon}><Text style={styles.domainIconText}>{domain.id}</Text></LinearGradient>
                      <View style={styles.domainInfo}>
                        <Text style={[styles.domainName, { color: colors.primary }]}>Domain {domain.id}</Text>
                        <Text style={[styles.domainTitle, { color: colors.text }]}>{domain.name}</Text>
                        <Text style={[styles.domainCount, { color: colors.textSecondary }]}>{diagCount} diagnoses across {domain.classes.filter(c => c.diagnoses.length > 0).length} classes</Text>
                      </View>
                      <Ionicons name={isDomainOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {isDomainOpen && domain.classes.filter(c => c.diagnoses.length > 0).map((cls) => {
                      const isClassOpen = expandedClass === `${domain.id}-${cls.name}`;
                      return (
                        <View key={cls.name}>
                          <TouchableOpacity style={[styles.classHeader, { backgroundColor: colors.surfaceAlt }]} onPress={() => setExpandedClass(isClassOpen ? null : `${domain.id}-${cls.name}`)}>
                            <Text style={[styles.className, { color: colors.text }]}>{cls.name}</Text>
                            <Text style={[styles.classCount, { color: colors.textLight }]}>{cls.diagnoses.length}</Text>
                            <Ionicons name={isClassOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textLight} />
                          </TouchableOpacity>
                          {isClassOpen && cls.diagnoses.map((diag, di) => (
                            <View key={di} style={styles.diagRow}>
                              <Text style={[styles.diagCode, { color: colors.primary }]}>{diag.code}</Text>
                              <Text style={[styles.diagLabel, { color: colors.text }]}>{diag.label}</Text>
                              <View style={[styles.diagType, { backgroundColor: diag.type === 'risk' ? colors.warning + '15' : diag.type === 'health-promotion' ? colors.success + '15' : colors.primary + '15' }]}>
                                <Text style={[styles.diagTypeText, { color: diag.type === 'risk' ? colors.warning : diag.type === 'health-promotion' ? colors.success : colors.primary }]}>{diag.type === 'problem-focused' ? 'PF' : diag.type === 'risk' ? 'RK' : diag.type === 'health-promotion' ? 'HP' : 'SY'}</Text>
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
            <View style={{ height: Spacing.xxl }} />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, flex: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: FontFamily.display, fontSize: FontSize.lg, color: '#FFFFFF' },
  headerSub: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: Spacing.xs },
  tabRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm, borderBottomWidth: 1 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, gap: Spacing.xs },
  tabText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm },
  scroll: { padding: Spacing.md },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, ...Shadow.sm, marginBottom: Spacing.md },
  cardTitle: { fontFamily: FontFamily.heading, fontSize: FontSize.lg, marginBottom: Spacing.xs },
  cardDesc: { fontFamily: FontFamily.body, fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.md },
  input: { borderRadius: BorderRadius.md, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontFamily: FontFamily.body, fontSize: FontSize.md, minHeight: 120, marginBottom: Spacing.md },
  diagnoseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.md, paddingVertical: Spacing.md, gap: Spacing.sm },
  diagnoseBtnText: { fontFamily: FontFamily.heading, fontSize: FontSize.md, color: '#FFFFFF' },
  suggestionsRow: { marginBottom: Spacing.md },
  suggestionsLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, marginBottom: Spacing.sm },
  suggestionChip: { borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, width: 160, ...Shadow.sm },
  suggestionText: { fontFamily: FontFamily.body, fontSize: FontSize.xs, lineHeight: 16 },
  errorBox: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  errorText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, marginLeft: Spacing.sm, flex: 1 },
  loadingBox: { alignItems: 'center', padding: Spacing.xl },
  loadingText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, marginTop: Spacing.md, textAlign: 'center' },
  resultSection: { borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, ...Shadow.sm, marginBottom: Spacing.md },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  resultTitle: { fontFamily: FontFamily.heading, fontSize: FontSize.lg, marginLeft: Spacing.sm },
  diagnosisBanner: { borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 3 },
  diagnosisText: { fontFamily: FontFamily.heading, fontSize: FontSize.md, lineHeight: 22 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  metaChip: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
  metaChipText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs },
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, gap: Spacing.sm, ...Shadow.sm },
  searchInput: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.md, paddingVertical: Spacing.sm + 2 },
  searchCount: { fontFamily: FontFamily.body, fontSize: FontSize.sm, marginBottom: Spacing.sm },
  searchResultCard: { borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, ...Shadow.sm },
  searchResultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  resultCodeBadge: { width: 56, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm },
  resultCodeText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.xs, color: '#FFFFFF' },
  resultMeta: { flex: 1 },
  resultDomainLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 1, borderRadius: BorderRadius.full, marginTop: 2 },
  typeBadgeText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs },
  searchResultLabel: { fontFamily: FontFamily.heading, fontSize: FontSize.md },
  domainCard: { borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, borderWidth: 1, ...Shadow.sm, overflow: 'hidden' },
  domainHeader: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  domainIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm },
  domainIconText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: '#FFFFFF' },
  domainInfo: { flex: 1 },
  domainName: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.xs, textTransform: 'uppercase', letterSpacing: 1 },
  domainTitle: { fontFamily: FontFamily.heading, fontSize: FontSize.md },
  domainCount: { fontFamily: FontFamily.body, fontSize: FontSize.xs, marginTop: 1 },
  classHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginLeft: Spacing.md + 32 },
  className: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, flex: 1 },
  classCount: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.xs, marginRight: Spacing.sm },
  diagRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, marginLeft: Spacing.md + 32 },
  diagCode: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.xs, width: 48 },
  diagLabel: { fontFamily: FontFamily.body, fontSize: FontSize.sm, flex: 1 },
  diagType: { paddingHorizontal: Spacing.xs + 2, paddingVertical: 1, borderRadius: 4 },
  diagTypeText: { fontFamily: FontFamily.bodyBold, fontSize: 9 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl * 2 },
  emptyText: { fontFamily: FontFamily.body, fontSize: FontSize.md, marginTop: Spacing.md },
});
