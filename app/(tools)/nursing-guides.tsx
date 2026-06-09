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
import { useResponsiveCtx } from '../../src/context/ResponsiveContext';
import { scale, verticalScale, moderateScale, responsiveFontSize } from '../../src/utils/responsive';

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
  const resp = useResponsiveCtx();
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
        style={[styles.header, { paddingHorizontal: resp.scale(Spacing.lg), paddingVertical: resp.scale(Spacing.md), paddingBottom: resp.scale(Spacing.lg) }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.headerBtn, { width: resp.scale(36), height: resp.scale(36), borderRadius: resp.scale(10) }]}>
            <Ionicons name="arrow-back" size={moderateScale(22)} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { fontSize: resp.responsiveFontSize(FontSize.lg) }]}>Nursing Guides</Text>
            <Text style={[styles.headerSub, { fontSize: resp.responsiveFontSize(FontSize.xs), marginTop: 1 }]}>AI-powered • Unlimited procedures</Text>
          </View>
          <View style={{ width: resp.scale(36) }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scroll, { padding: resp.scale(Spacing.md), paddingTop: resp.scale(Spacing.sm) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <GlowGlass variant="default" blurIntensity={50} glowIntensity="low" style={{ marginBottom: resp.scale(Spacing.md) }}>
          <View style={[styles.searchWrap, { padding: resp.scale(Spacing.sm), gap: resp.scale(Spacing.sm) }]}>
            <Ionicons name="search" size={moderateScale(18)} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md), paddingVertical: resp.scale(Spacing.sm) }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search any nursing procedure..."
              placeholderTextColor={colors.textLight}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={moderateScale(18)} color={colors.textLight} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.searchBtn, { backgroundColor: NigeriaColors.green }, { width: resp.scale(36), height: resp.scale(36), borderRadius: resp.scale(BorderRadius.md) }]}
              onPress={handleSearch}
            >
              <Ionicons name="arrow-forward" size={resp.scale(16)} color="#fff" />
            </TouchableOpacity>
          </View>
        </GlowGlass>

        {loadingSearch && (
          <View style={[styles.loadingBox, { paddingVertical: resp.scale(Spacing.xxl) }]}>
            <ActivityIndicator color={NigeriaColors.green} size="large" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm), marginTop: resp.scale(Spacing.md) }]}>Searching procedures...</Text>
          </View>
        )}

        {error && !loading && !loadingSearch && (
          <View style={[styles.errorBox, { backgroundColor: colors.error + '12' }, { padding: resp.scale(Spacing.md), borderRadius: resp.scale(BorderRadius.md), marginBottom: resp.scale(Spacing.md), gap: resp.scale(Spacing.sm) }]}>
            <Ionicons name="alert-circle" size={resp.scale(16)} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>{error}</Text>
          </View>
        )}

        {searched && !loadingSearch && searchResults.length > 0 && !selectedProcedure && (
          <View style={{ gap: resp.scale(Spacing.sm), marginBottom: resp.scale(Spacing.md) }}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm), marginBottom: resp.scale(Spacing.xs), marginLeft: resp.scale(2) }]}>
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
                    style={[styles.searchResultInner, { padding: resp.scale(Spacing.md), gap: resp.scale(Spacing.sm) }]}
                    onPress={() => handleFetchProcedure(title)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.searchResultIcon, { width: resp.scale(40), height: resp.scale(40), borderRadius: resp.scale(12) }]}>
                      <Ionicons name="medical-outline" size={resp.scale(20)} color={NigeriaColors.green} />
                    </View>
                    <Text style={[styles.searchResultTitle, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md) }]}>{title}</Text>
                    <Ionicons name="chevron-forward" size={moderateScale(18)} color={colors.textLight} />
                  </TouchableOpacity>
                </GlowGlass>
              </Animated.View>
            ))}
          </View>
        )}

        {searched && !loadingSearch && searchResults.length === 0 && !selectedProcedure && !error && (
          <GlowGlass variant="default" blurIntensity={40} glowIntensity="low" style={{ alignItems: 'center', padding: resp.scale(Spacing.xl), marginBottom: resp.scale(Spacing.md) }}>
            <Ionicons name="search-outline" size={resp.moderateScale(40)} color={colors.textLight} />
            <Text style={[styles.emptyTitle, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md), marginTop: resp.scale(Spacing.md) }]}>No procedures found</Text>
            <Text style={[styles.emptySub, { color: colors.textLight }, { fontSize: resp.responsiveFontSize(FontSize.sm), marginTop: resp.scale(Spacing.xs) }]}>
              Try "IV cannulation", "wound care", "catheterization", or "CPR"
            </Text>
          </GlowGlass>
        )}

        {loading && (
          <View style={[styles.loadingBox, { paddingVertical: resp.scale(Spacing.xxl) }]}>
            <ActivityIndicator color={NigeriaColors.green} size="large" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm), marginTop: resp.scale(Spacing.md) }]}>Fetching procedure steps...</Text>
          </View>
        )}

        {selectedProcedure && !loading && (
          <Animated.View entering={FadeInDown.duration(400).springify()}>
            <GlowGlass variant="green" blurIntensity={60} glowIntensity="high" style={{ marginBottom: resp.scale(Spacing.md) }}>
              <View style={[styles.procHeader, { padding: resp.scale(Spacing.md) }]}>
                <View style={[styles.procHeaderLeft, { gap: resp.scale(Spacing.sm) }]}>
                  <View style={[styles.procIconWrap, { width: resp.scale(44), height: resp.scale(44), borderRadius: resp.scale(14) }]}>
                    <Ionicons name="medical" size={moderateScale(22)} color={NigeriaColors.green} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.procTitle, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.lg) }]}>{selectedProcedure.title}</Text>
                    {selectedProcedure.purpose ? (
                      <Text style={[styles.procPurpose, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.xs), lineHeight: resp.verticalScale(16) }]}>{selectedProcedure.purpose}</Text>
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }, { width: resp.scale(32), height: resp.scale(32), borderRadius: resp.scale(8) }]}
                  onPress={() => setSelectedProcedure(null)}
                >
                  <Ionicons name="close" size={moderateScale(18)} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedProcedure.equipment.length > 0 && (
                <View style={[styles.procSection, { padding: resp.scale(Spacing.md) }]}>
                  <View style={[styles.procSectionHeader, { gap: resp.scale(Spacing.sm), marginBottom: resp.scale(Spacing.sm) }]}>
                    <Ionicons name="cube-outline" size={resp.scale(16)} color={NigeriaColors.green} />
                    <Text style={[styles.procSectionTitle, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>Equipment Needed</Text>
                  </View>
                  <View style={[styles.equipGrid, { gap: resp.scale(Spacing.xs) }]}>
                    {selectedProcedure.equipment.map((item, i) => (
                      <View key={i} style={[styles.equipChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }, { paddingHorizontal: resp.scale(Spacing.sm), paddingVertical: resp.scale(Spacing.xs + 1), borderRadius: resp.scale(BorderRadius.full) }]}>
                        <Text style={[styles.equipText, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={[styles.procSection, { padding: resp.scale(Spacing.md) }]}>
                <View style={[styles.procSectionHeader, { gap: resp.scale(Spacing.sm), marginBottom: resp.scale(Spacing.sm) }]}>
                  <Ionicons name="list-outline" size={resp.scale(16)} color={NigeriaColors.green} />
                  <Text style={[styles.procSectionTitle, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>Procedure Steps</Text>
                </View>
                {selectedProcedure.steps.map((step, i) => (
                  <View key={i} style={[styles.stepRow, { marginBottom: resp.scale(Spacing.sm), gap: resp.scale(Spacing.sm) }]}>
                    <View style={[styles.stepNum, { backgroundColor: NigeriaColors.green + '20' }, { width: resp.scale(24), height: resp.scale(24), borderRadius: resp.scale(12), marginTop: resp.scale(1) }]}>
                      <Text style={[styles.stepNumText, { color: NigeriaColors.green }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm), lineHeight: resp.verticalScale(20) }]}>{step}</Text>
                  </View>
                ))}
              </View>

              {selectedProcedure.considerations.length > 0 && (
                <View style={[styles.procSection, { padding: resp.scale(Spacing.md) }]}>
                  <View style={[styles.procSectionHeader, { gap: resp.scale(Spacing.sm), marginBottom: resp.scale(Spacing.sm) }]}>
                    <Ionicons name="warning-outline" size={resp.scale(16)} color={colors.accent} />
                    <Text style={[styles.procSectionTitle, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>Nursing Considerations</Text>
                  </View>
                  {selectedProcedure.considerations.map((item, i) => (
                    <View key={i} style={[styles.consRow, { marginBottom: resp.scale(Spacing.xs), gap: resp.scale(Spacing.sm) }]}>
                      <View style={[styles.consDot, { backgroundColor: colors.accent }, { width: resp.scale(6), height: resp.scale(6), borderRadius: resp.scale(3), marginTop: resp.scale(7) }]} />
                      <Text style={[styles.consText, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm), lineHeight: resp.verticalScale(20) }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedProcedure.complications.length > 0 && (
                <View style={[styles.procSection, { padding: resp.scale(Spacing.md) }]}>
                  <View style={[styles.procSectionHeader, { gap: resp.scale(Spacing.sm), marginBottom: resp.scale(Spacing.sm) }]}>
                    <Ionicons name="alert-circle-outline" size={resp.scale(16)} color={colors.error} />
                    <Text style={[styles.procSectionTitle, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>Complications to Watch For</Text>
                  </View>
                  {selectedProcedure.complications.map((item, i) => (
                    <View key={i} style={[styles.consRow, { marginBottom: resp.scale(Spacing.xs), gap: resp.scale(Spacing.sm) }]}>
                      <View style={[styles.consDot, { backgroundColor: colors.error }, { width: resp.scale(6), height: resp.scale(6), borderRadius: resp.scale(3), marginTop: resp.scale(7) }]} />
                      <Text style={[styles.consText, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm), lineHeight: resp.verticalScale(20) }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlowGlass>
          </Animated.View>
        )}

        {!searched && !selectedProcedure && (
          <View style={{ gap: resp.scale(Spacing.sm) }}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm), marginBottom: resp.scale(Spacing.xs), marginLeft: resp.scale(2) }]}>
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
                      style={[styles.guideHeader, { padding: resp.scale(Spacing.md) }]}
                      onPress={() => toggleLocal(guide.id)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={grads[i % 2] as [string, string]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={[styles.guideIcon, { width: resp.scale(44), height: resp.scale(44), borderRadius: resp.scale(14), marginRight: resp.scale(Spacing.sm) }]}
                      >
                        <Ionicons
                          name={iconMap[guide.title] || 'book-outline'}
                          size={resp.scale(20)} color="#fff"
                        />
                      </LinearGradient>
                      <View style={styles.guideInfo}>
                        <Text style={[styles.guideTitle, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md) }]}>{guide.title}</Text>
                        <Text style={[styles.guideSteps, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.xs), marginTop: 1 }]}>
                          {guide.steps.length} steps
                        </Text>
                      </View>
                      <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={moderateScale(20)} color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                    {isOpen && (
                      <Animated.View
                        entering={FadeInDown.springify()}
                        style={[styles.stepsContainer, { borderTopColor: colors.border }, { borderTopWidth: 1, padding: resp.scale(Spacing.md), paddingTop: resp.scale(Spacing.sm) }]}
                      >
                        {guide.steps.map((step, sIdx) => (
                          <View key={sIdx} style={[styles.stepRow, { marginBottom: resp.scale(Spacing.sm), gap: resp.scale(Spacing.sm) }]}>
                            <View style={[styles.stepNum, { backgroundColor: colors.primary + '15' }, { width: resp.scale(24), height: resp.scale(24), borderRadius: resp.scale(12), marginTop: resp.scale(1) }]}>
                              <Text style={[styles.stepNumText, { color: colors.primary }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{sIdx + 1}</Text>
                            </View>
                            <Text style={[styles.stepText, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm), lineHeight: resp.verticalScale(20) }]}>{step}</Text>
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

        <View style={{ height: resp.verticalScale(Spacing.xxl * 2) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {},
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerTitle: { fontFamily: FontFamily.display, color: '#FFFFFF' },
  headerSub: { fontFamily: FontFamily.body, color: 'rgba(255,255,255,0.7)' },
  scroll: {},
  sectionLabel: { fontFamily: FontFamily.bodyMedium },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
  },
  searchInput: { flex: 1, fontFamily: FontFamily.body },
  searchBtn: {
    justifyContent: 'center', alignItems: 'center',
  },
  loadingBox: { alignItems: 'center' },
  loadingText: { fontFamily: FontFamily.body },
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
  },
  errorText: { fontFamily: FontFamily.body, flex: 1 },
  emptyBox: { alignItems: 'center' },
  emptyTitle: { fontFamily: FontFamily.heading },
  emptySub: { fontFamily: FontFamily.body, textAlign: 'center' },
  searchResultInner: {
    flexDirection: 'row', alignItems: 'center',
  },
  searchResultIcon: {
    backgroundColor: 'rgba(0,135,81,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  searchResultTitle: { fontFamily: FontFamily.heading, flex: 1 },
  procHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.15)',
  },
  procHeaderLeft: { flexDirection: 'row', flex: 1 },
  procIconWrap: {
    backgroundColor: 'rgba(0,135,81,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  procTitle: { fontFamily: FontFamily.display },
  procPurpose: { fontFamily: FontFamily.body, marginTop: 1 },
  closeBtn: { justifyContent: 'center', alignItems: 'center' },
  procSection: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(128,128,128,0.1)' },
  procSectionHeader: { flexDirection: 'row', alignItems: 'center' },
  procSectionTitle: { fontFamily: FontFamily.heading },
  equipGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  equipChip: {
    borderWidth: 1,
  },
  equipText: { fontFamily: FontFamily.body },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepNum: {
    justifyContent: 'center', alignItems: 'center',
  },
  stepNumText: { fontFamily: FontFamily.bodyBold },
  stepText: { fontFamily: FontFamily.body, flex: 1 },
  consRow: { flexDirection: 'row' },
  consDot: {},
  consText: { fontFamily: FontFamily.body, flex: 1 },
  guideHeader: {
    flexDirection: 'row', alignItems: 'center',
  },
  guideIcon: {
    justifyContent: 'center', alignItems: 'center',
  },
  guideInfo: { flex: 1 },
  guideTitle: { fontFamily: FontFamily.heading },
  guideSteps: { fontFamily: FontFamily.body },
  stepsContainer: {},
});
