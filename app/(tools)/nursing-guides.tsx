import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import {
  Spacing, FontSize, FontFamily, BorderRadius, NigeriaColors,
} from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { fetchProcedure, searchProcedures } from '../../src/services/geminiProcedures';
import { nursingGuides } from '../../src/data/mockData';
import GlowGlass from '../../src/components/GlowGlass';
import { useStats } from '../../src/context/StatsContext';

type ProcedureResult = {
  title: string;
  purpose: string;
  equipment: string[];
  steps: string[];
  considerations: string[];
  complications: string[];
};

export default function NursingGuidesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { incrementQuestions, startStudyTimer, stopStudyTimer } = useStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureResult | null>(null);
  const [expandedLocal, setExpandedLocal] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLocal = (id: string) => setExpandedLocal(expandedLocal === id ? null : id);

  useFocusEffect(
    useCallback(() => {
      startStudyTimer();
      return () => stopStudyTimer();
    }, [])
  );

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) return;
    setLoadingSearch(true);
    setSearched(true);
    setError(null);
    setSelectedProcedure(null);
    try {
      const results = await searchProcedures(q);
      setSearchResults(results);
    } catch {
      setError('Search failed. Try again.');
    }
    setLoadingSearch(false);
  }, [searchQuery]);

  const handleFetchProcedure = useCallback(async (title: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProcedure(title);
      setSelectedProcedure(result);
      incrementQuestions();
    } catch {
      setError('Failed to load procedure. Check your connection.');
    }
    setLoading(false);
  }, []);

  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    'IV Cannulation': 'water-outline',
    'Nasogastric Tube Insertion': 'nutrition-outline',
    'Urinary Catheterization (Female)': 'contrast-outline',
    'IM Injection': 'medkit-outline',
    'Blood Pressure Measurement': 'heart-outline',
  };

  function clearSearch() {
    setSearchQuery('');
    setSearchResults([]);
    setSearched(false);
    setSelectedProcedure(null);
    setError(null);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <LinearGradient
        colors={[NigeriaColors.green, '#0D9488']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Nursing Guides</Text>
            <Text style={styles.headerSub}>AI-powered • Unlimited procedures</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <GlowGlass variant="default" blurIntensity={50} glowIntensity="low" style={{ marginBottom: Spacing.md }}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search any nursing procedure..."
              placeholderTextColor={colors.textLight}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textLight} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.searchBtn, { backgroundColor: NigeriaColors.green }]}
              onPress={handleSearch}
            >
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </GlowGlass>

        {loadingSearch && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={NigeriaColors.green} size="large" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Searching procedures...</Text>
          </View>
        )}

        {error && !loading && !loadingSearch && (
          <View style={[styles.errorBox, { backgroundColor: colors.error + '12' }]}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        {searched && !loadingSearch && searchResults.length > 0 && !selectedProcedure && (
          <View style={{ gap: Spacing.sm, marginBottom: Spacing.md }}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Procedures found ({searchResults.length})
            </Text>
            {searchResults.map((title, i) => (
              <Animated.View
                key={title}
                entering={FadeInDown.delay(i * 60).springify()}
                layout={Layout.springify()}
              >
                <GlowGlass variant="default" blurIntensity={40} glowIntensity="low" noPadding>
                  <TouchableOpacity
                    style={styles.searchResultInner}
                    onPress={() => handleFetchProcedure(title)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.searchResultIcon}>
                      <Ionicons name="medical-outline" size={20} color={NigeriaColors.green} />
                    </View>
                    <Text style={[styles.searchResultTitle, { color: colors.text }]}>{title}</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
                  </TouchableOpacity>
                </GlowGlass>
              </Animated.View>
            ))}
          </View>
        )}

        {searched && !loadingSearch && searchResults.length === 0 && !selectedProcedure && !error && (
          <GlowGlass variant="default" blurIntensity={40} glowIntensity="low" style={styles.emptyBox}>
            <Ionicons name="search-outline" size={40} color={colors.textLight} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No procedures found</Text>
            <Text style={[styles.emptySub, { color: colors.textLight }]}>
              Try "IV cannulation", "wound care", "catheterization", or "CPR"
            </Text>
          </GlowGlass>
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={NigeriaColors.green} size="large" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Fetching procedure steps...</Text>
          </View>
        )}

        {selectedProcedure && !loading && (
          <Animated.View entering={FadeInDown.duration(400).springify()}>
            <GlowGlass variant="green" blurIntensity={60} glowIntensity="high" style={{ marginBottom: Spacing.md }}>
              <View style={styles.procHeader}>
                <View style={styles.procHeaderLeft}>
                  <View style={styles.procIconWrap}>
                    <Ionicons name="medical" size={22} color={NigeriaColors.green} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.procTitle, { color: colors.text }]}>{selectedProcedure.title}</Text>
                    {selectedProcedure.purpose ? (
                      <Text style={[styles.procPurpose, { color: colors.textSecondary }]}>{selectedProcedure.purpose}</Text>
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
                  onPress={() => setSelectedProcedure(null)}
                >
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedProcedure.equipment.length > 0 && (
                <View style={styles.procSection}>
                  <View style={styles.procSectionHeader}>
                    <Ionicons name="cube-outline" size={16} color={NigeriaColors.green} />
                    <Text style={[styles.procSectionTitle, { color: colors.text }]}>Equipment Needed</Text>
                  </View>
                  <View style={styles.equipGrid}>
                    {selectedProcedure.equipment.map((item, i) => (
                      <View key={i} style={[styles.equipChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                        <Text style={[styles.equipText, { color: colors.text }]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.procSection}>
                <View style={styles.procSectionHeader}>
                  <Ionicons name="list-outline" size={16} color={NigeriaColors.green} />
                  <Text style={[styles.procSectionTitle, { color: colors.text }]}>Procedure Steps</Text>
                </View>
                {selectedProcedure.steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={[styles.stepNum, { backgroundColor: NigeriaColors.green + '20' }]}>
                      <Text style={[styles.stepNumText, { color: NigeriaColors.green }]}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
                  </View>
                ))}
              </View>

              {selectedProcedure.considerations.length > 0 && (
                <View style={styles.procSection}>
                  <View style={styles.procSectionHeader}>
                    <Ionicons name="warning-outline" size={16} color={colors.accent} />
                    <Text style={[styles.procSectionTitle, { color: colors.text }]}>Nursing Considerations</Text>
                  </View>
                  {selectedProcedure.considerations.map((item, i) => (
                    <View key={i} style={styles.consRow}>
                      <View style={[styles.consDot, { backgroundColor: colors.accent }]} />
                      <Text style={[styles.consText, { color: colors.text }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedProcedure.complications.length > 0 && (
                <View style={styles.procSection}>
                  <View style={styles.procSectionHeader}>
                    <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                    <Text style={[styles.procSectionTitle, { color: colors.text }]}>Complications to Watch For</Text>
                  </View>
                  {selectedProcedure.complications.map((item, i) => (
                    <View key={i} style={styles.consRow}>
                      <View style={[styles.consDot, { backgroundColor: colors.error }]} />
                      <Text style={[styles.consText, { color: colors.text }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlowGlass>
          </Animated.View>
        )}

        {!searched && !selectedProcedure && (
          <View style={{ gap: Spacing.sm }}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Common Procedures
            </Text>
            {nursingGuides.map((guide, i) => {
              const isOpen = expandedLocal === guide.id;
              const grads = [[NigeriaColors.green, '#0D9488'], ['#6366F1', '#818CF8']];
              return (
                <Animated.View
                  key={guide.id}
                  entering={FadeInDown.delay(100 + i * 80).springify()}
                  layout={Layout.springify()}
                >
                  <GlowGlass variant="default" blurIntensity={40} glowIntensity="low" noPadding>
                    <TouchableOpacity
                      style={styles.guideHeader}
                      onPress={() => toggleLocal(guide.id)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={grads[i % 2] as [string, string]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.guideIcon}
                      >
                        <Ionicons
                          name={iconMap[guide.title] || 'book-outline'}
                          size={20} color="#fff"
                        />
                      </LinearGradient>
                      <View style={styles.guideInfo}>
                        <Text style={[styles.guideTitle, { color: colors.text }]}>{guide.title}</Text>
                        <Text style={[styles.guideSteps, { color: colors.textSecondary }]}>
                          {guide.steps.length} steps
                        </Text>
                      </View>
                      <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={20} color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                    {isOpen && (
                      <Animated.View
                        entering={FadeInDown.springify()}
                        style={[styles.stepsContainer, { borderTopColor: colors.border }]}
                      >
                        {guide.steps.map((step, sIdx) => (
                          <View key={sIdx} style={styles.stepRow}>
                            <View style={[styles.stepNum, { backgroundColor: colors.primary + '15' }]}>
                              <Text style={[styles.stepNumText, { color: colors.primary }]}>{sIdx + 1}</Text>
                            </View>
                            <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
                          </View>
                        ))}
                      </Animated.View>
                    )}
                  </GlowGlass>
                </Animated.View>
              );
            })}
          </View>
        )}

        <View style={{ height: Spacing.xxl * 2 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, paddingBottom: Spacing.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerTitle: { fontFamily: FontFamily.display, fontSize: FontSize.lg, color: '#FFFFFF' },
  headerSub: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  scroll: { padding: Spacing.md, paddingTop: Spacing.sm },
  sectionLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, marginBottom: Spacing.xs, marginLeft: 2 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.sm, gap: Spacing.sm,
  },
  searchInput: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.md, paddingVertical: Spacing.sm },
  searchBtn: {
    width: 36, height: 36, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  loadingBox: { alignItems: 'center', paddingVertical: Spacing.xxl },
  loadingText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, marginTop: Spacing.md },
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, borderRadius: BorderRadius.md,
    marginBottom: Spacing.md, gap: Spacing.sm,
  },
  errorText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, flex: 1 },
  emptyBox: { alignItems: 'center', padding: Spacing.xl, marginBottom: Spacing.md },
  emptyTitle: { fontFamily: FontFamily.heading, fontSize: FontSize.md, marginTop: Spacing.md },
  emptySub: { fontFamily: FontFamily.body, fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.xs },
  searchResultInner: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, gap: Spacing.sm,
  },
  searchResultIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(0,135,81,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  searchResultTitle: { fontFamily: FontFamily.heading, fontSize: FontSize.md, flex: 1 },
  procHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.15)',
  },
  procHeaderLeft: { flexDirection: 'row', gap: Spacing.sm, flex: 1 },
  procIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(0,135,81,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  procTitle: { fontFamily: FontFamily.display, fontSize: FontSize.lg },
  procPurpose: { fontFamily: FontFamily.body, fontSize: FontSize.xs, marginTop: 1, lineHeight: 16 },
  closeBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  procSection: { padding: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(128,128,128,0.1)' },
  procSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  procSectionTitle: { fontFamily: FontFamily.heading, fontSize: FontSize.sm },
  equipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  equipChip: {
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs + 1,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  equipText: { fontFamily: FontFamily.body, fontSize: FontSize.xs },
  stepRow: { flexDirection: 'row', marginBottom: Spacing.sm, alignItems: 'flex-start', gap: Spacing.sm },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 1,
  },
  stepNumText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.xs },
  stepText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, flex: 1, lineHeight: 20 },
  consRow: { flexDirection: 'row', marginBottom: Spacing.xs, gap: Spacing.sm },
  consDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  consText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, flex: 1, lineHeight: 20 },
  guideHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md,
  },
  guideIcon: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.sm,
  },
  guideInfo: { flex: 1 },
  guideTitle: { fontFamily: FontFamily.heading, fontSize: FontSize.md },
  guideSteps: { fontFamily: FontFamily.body, fontSize: FontSize.xs, marginTop: 1 },
  stepsContainer: { borderTopWidth: 1, padding: Spacing.md, paddingTop: Spacing.sm },
});
