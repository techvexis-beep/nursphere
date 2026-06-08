import { useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Dimensions, ScrollView, Pressable, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow, NigeriaColors } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useStats } from '../../src/context/StatsContext';
import AnimatedStat from '../../src/components/AnimatedStat';
import GlowGlass from '../../src/components/GlowGlass';
import { useAIInsights } from '../../src/hooks/useAIInsights';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NURSING_TOOLS = [
  { id: 'dosage-calculator', label: 'Dosage Calculator', icon: 'calculator-outline' as const, color: '#0D9488', desc: 'Weight-based, IV drip, BSA' },
  { id: 'clinical-diagnosis', label: 'Clinical Diagnosis', icon: 'medkit-outline' as const, color: '#6366F1', desc: 'NANDA-I powered by AI' },
  { id: 'drug-reference', label: 'Drug Reference', icon: 'medical-outline' as const, color: '#F59E0B', desc: 'Common meds & dosages' },
  { id: 'nursing-guides', label: 'Nursing Guides', icon: 'book-outline' as const, color: '#EC4899', desc: 'Step-by-step procedures' },
];

const REGION_COLORS: Record<string, string> = {
  Africa: '#F59E0B', Europe: '#6366F1', Americas: '#EC4899',
  Asia: '#0D9488', Australia: '#14B8A6', Global: NigeriaColors.green,
};

function InsightsTabs({ tip, news, quote, loading, refresh }: {
  tip: string | null; news: { region: string; headline: string }[] | null;
  quote: string | null; loading: boolean; refresh: () => void;
}) {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const switchTab = (index: number) => {
    if (index === activeTab) return;
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setActiveTab(index);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  function regionColor(region: string) {
    return REGION_COLORS[region] || NigeriaColors.green;
  }

  return (
    <GlowGlass variant="green" glowIntensity="medium">
      <View style={iStyles.tabBar}>
        <TouchableOpacity
          style={[iStyles.tab, activeTab === 0 && iStyles.tabActive]}
          onPress={() => switchTab(0)}
        >
          <Ionicons name="bulb-outline" size={14} color={activeTab === 0 ? NigeriaColors.green : colors.textLight} />
          <Text style={[iStyles.tabLabel, { color: activeTab === 0 ? NigeriaColors.green : colors.textLight }]}>
            Tip of the Day
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[iStyles.tab, activeTab === 1 && iStyles.tabActive]}
          onPress={() => switchTab(1)}
        >
          <Ionicons name="globe-outline" size={14} color={activeTab === 1 ? NigeriaColors.green : colors.textLight} />
          <Text style={[iStyles.tabLabel, { color: activeTab === 1 ? NigeriaColors.green : colors.textLight }]}>
            Global News
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={refresh} style={iStyles.refreshBtn}>
          <Ionicons name="refresh" size={15} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ opacity: fadeAnim }}>
        {loading ? (
          <Text style={[iStyles.skeleton, { color: colors.textLight }]}>Loading insights...</Text>
        ) : activeTab === 0 ? (
          <View>
            <Text style={[iStyles.tipText, { color: colors.text }]}>{tip}</Text>
            {quote && <Text style={[iStyles.quoteText, { color: colors.textSecondary }]}>"{quote}"</Text>}
          </View>
        ) : (
          <View style={iStyles.newsList}>
            {news?.map((item, i) => (
              <View key={i} style={iStyles.newsRow}>
                <View style={[iStyles.regionBadge, { backgroundColor: regionColor(item.region) + '18' }]}>
                  <Text style={[iStyles.regionText, { color: regionColor(item.region) }]}>{item.region}</Text>
                </View>
                <Text style={[iStyles.newsText, { color: colors.text }]}>{item.headline}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    </GlowGlass>
  );
}

const iStyles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: Spacing.md, gap: Spacing.xs,
  },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
  },
  tabActive: { backgroundColor: 'rgba(0,135,81,0.1)' },
  tabLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm },
  refreshBtn: { marginLeft: 'auto', padding: 4 },
  skeleton: { fontFamily: FontFamily.body, fontSize: FontSize.sm, fontStyle: 'italic' },
  tipText: { fontFamily: FontFamily.body, fontSize: FontSize.md, lineHeight: 22 },
  quoteText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, fontStyle: 'italic', marginTop: Spacing.sm, lineHeight: 18 },
  newsList: { gap: Spacing.sm },
  newsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  regionBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full, marginTop: 2 },
  regionText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs },
  newsText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, flex: 1, lineHeight: 20 },
});

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { stats, startStudyTimer, stopStudyTimer } = useStats();
  const { tip, news, quote, loading, refresh } = useAIInsights();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Nurse';
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NN';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  useFocusEffect(
    useCallback(() => {
      startStudyTimer();
      return () => stopStudyTimer();
    }, [])
  );

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView edges={['top']} style={s.topArea}>
          <View style={s.flagBar}>
            <View style={[s.flagSeg, { backgroundColor: NigeriaColors.green }]} />
            <View style={[s.flagSeg, { backgroundColor: colors.white }]} />
            <View style={[s.flagSeg, { backgroundColor: NigeriaColors.green }]} />
          </View>
          <GlowGlass variant="green" glowIntensity="low" blurIntensity={0}>
            <View style={s.greetingWrap}>
              <View style={s.greetingLeft}>
                <View style={s.greetingIconRow}>
                  <View style={[s.greetingIconBg, { backgroundColor: NigeriaColors.green + '18' }]}>
                    <Ionicons name="sparkles" size={14} color={NigeriaColors.green} />
                  </View>
                  <Text style={[s.greetingLabel, { color: NigeriaColors.green }]}>{today}</Text>
                </View>
                <Text style={[s.greeting, { color: colors.text }]}>
                  {greeting}, {firstName}
                </Text>
                <Text style={[s.subGreeting, { color: colors.textSecondary }]}>
                  {user?.role ? `${user.role} · ` : ''}keep pushing forward
                </Text>
              </View>
              <LinearGradient
                colors={[NigeriaColors.green, '#006B3F']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.avatarGlow}
              >
                <Text style={s.avatarText}>{initials}</Text>
              </LinearGradient>
            </View>
          </GlowGlass>
        </SafeAreaView>

        <View style={s.statsRow}>
          <AnimatedStat value={stats.studyMinutes} label="Minutes" icon="time-outline" delay={100} />
          <AnimatedStat value={stats.practiceQuestions} label="Questions" icon="help-circle-outline" delay={200} />
          <AnimatedStat value={stats.connections} label="Connections" icon="people-outline" delay={300} />
        </View>

        <Reanimated.View entering={FadeInDown.delay(200).springify()} style={s.insightsWrap}>
          <View style={s.sectionTitleRow}>
            <Ionicons name="sparkles" size={16} color={NigeriaColors.green} />
            <Text style={[s.sectionTitle, { color: colors.text }]}>Daily Insights</Text>
          </View>
          <InsightsTabs tip={tip} news={news} quote={quote} loading={loading} refresh={refresh} />
        </Reanimated.View>

        <Reanimated.View entering={FadeInDown.delay(350).springify()} style={s.sectionWrap}>
          <View style={s.sectionTitleRow}>
            <Ionicons name="grid-outline" size={16} color={NigeriaColors.green} />
            <Text style={[s.sectionTitle, { color: colors.text }]}>Nursing Resources</Text>
          </View>
          <View style={s.resourcesGrid}>
            {NURSING_TOOLS.map((tool, i) => (
              <Reanimated.View
                key={tool.id}
                entering={FadeInDown.delay(400 + i * 80).springify()}
                style={s.resourceCardWrap}
              >
                <Pressable
                  onPress={() => router.navigate(`/(tools)/${tool.id}`)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                >
                  <GlowGlass variant="subtle" glowIntensity="low" noPadding>
                    <View style={s.resourceCardInner}>
                      <LinearGradient
                        colors={[tool.color, tool.color + 'CC']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={s.resourceIcon}
                      >
                        <Ionicons name={tool.icon} size={22} color={'#FFFFFF'} />
                      </LinearGradient>
                      <Text style={[s.resourceLabel, { color: colors.text }]}>{tool.label}</Text>
                      <Text style={[s.resourceDesc, { color: colors.textSecondary }]}>{tool.desc}</Text>
                    </View>
                  </GlowGlass>
                </Pressable>
              </Reanimated.View>
            ))}
          </View>
        </Reanimated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxxl + Spacing.xl },
  topArea: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  flagBar: { flexDirection: 'row', height: 3, borderRadius: 2, overflow: 'hidden', marginBottom: Spacing.md },
  flagSeg: { flex: 1 },
  greetingWrap: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  greetingLeft: { flex: 1, marginRight: Spacing.md },
  greetingIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  greetingIconBg: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  greetingLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs, letterSpacing: 0.3 },
  greeting: { fontFamily: FontFamily.display, fontSize: FontSize.xxl, marginTop: 2 },
  subGreeting: { fontFamily: FontFamily.body, fontSize: FontSize.sm, marginTop: 3 },
  avatarGlow: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: NigeriaColors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  avatarText: { fontFamily: FontFamily.bodyBold, color: '#FFFFFF', fontSize: FontSize.md },
  statsRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg,
    gap: Spacing.sm, marginTop: Spacing.lg,
  },
  insightsWrap: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  sectionWrap: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  sectionTitleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontFamily: FontFamily.heading, fontSize: FontSize.lg },
  resourcesGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  resourceCardWrap: { width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2 },
  resourceCardInner: { padding: Spacing.md },
  resourceIcon: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  resourceLabel: { fontFamily: FontFamily.heading, fontSize: FontSize.sm },
  resourceDesc: { fontFamily: FontFamily.body, fontSize: FontSize.xs, marginTop: 2 },
});
