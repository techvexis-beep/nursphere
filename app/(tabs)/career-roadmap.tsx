import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { Spacing, FontSize, FontFamily, BorderRadius, NigeriaColors } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useStats } from '../../src/context/StatsContext';
import { fetchCareerRoadmap, CareerMilestone } from '../../src/services/geminiInsights';
import GlowGlass from '../../src/components/GlowGlass';

const PROGRESS_BAR_HEIGHT = 8;

function ProgressSection({ progress, completedCount, totalCount, role, institution }: { progress: number; completedCount: number; totalCount: number; role: string; institution: string }) {
  const { colors, isDark } = useTheme();
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, { toValue: progress, duration: 800, useNativeDriver: false }).start();
  }, [progress]);

  const widthInterp = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <Text style={[styles.heroTitle, { color: isDark ? '#FFFFFF' : '#1a1a2e' }]}>Career Roadmap</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
          <Text style={[styles.heroProgressPct, { color: NigeriaColors.green }]}>{Math.round(progress * 100)}%</Text>
          <Text style={[styles.heroProgressLabel, { color: colors.textLight }]}>complete</Text>
        </View>
      </View>
      <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
        {role} · {institution}
      </Text>
      <View style={[styles.progressBg, { backgroundColor: isDark ? '#2a2f45' : '#e8ecf4' }]}>
        <Animated.View style={[styles.progressFill, { width: widthInterp }]} />
      </View>
      <View style={styles.heroStatsRow}>
        <View style={styles.heroStat}>
          <Text style={[styles.heroStatVal, { color: colors.text }]}>{completedCount}</Text>
          <Text style={[styles.heroStatLabel, { color: colors.textLight }]}>completed</Text>
        </View>
        <View style={[styles.heroStatDivider, { backgroundColor: colors.border }]} />
        <View style={styles.heroStat}>
          <Text style={[styles.heroStatVal, { color: colors.text }]}>{totalCount - completedCount}</Text>
          <Text style={[styles.heroStatLabel, { color: colors.textLight }]}>remaining</Text>
        </View>
      </View>
    </View>
  );
}

function StageIcon({ status, index }: { status: string; index: number }) {
  const { colors } = useTheme();
  if (status === 'completed')
    return <View style={[styles.stageDot, { backgroundColor: colors.success }]}><Ionicons name="checkmark" size={14} color="#FFFFFF" /></View>;
  if (status === 'in-progress')
    return <View style={[styles.stageDot, { backgroundColor: NigeriaColors.green, boxShadow: '0 0 8px rgba(0,135,81,0.6)', elevation: 6 }]}><Text style={styles.stageDotNum}>{index + 1}</Text></View>;
  return <View style={[styles.stageDot, { backgroundColor: colors.border }]}><Text style={[styles.stageDotNum, { color: colors.textLight }]}>{index + 1}</Text></View>;
}

export default function CareerRoadmapScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { stats, startStudyTimer, stopStudyTimer } = useStats();
  const [roadmap, setRoadmap] = useState<CareerMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      startStudyTimer();
      return () => stopStudyTimer();
    }, [])
  );

  useEffect(() => { loadRoadmap(); }, []);

  const loadRoadmap = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCareerRoadmap(
        user?.role || 'Nursing Student', user?.year || '',
        user?.institution || '', stats.practiceQuestions
      );
      setRoadmap(data);
    } catch {
      setError('Failed to load roadmap. Check your connection.');
    }
    setLoading(false);
  };

  const completedCount = roadmap.filter(s => s.status === 'completed').length;
  const totalCount = roadmap.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  const nextMilestone = roadmap.find(s => s.status === 'in-progress' || s.status === 'upcoming');
  const nextLabel = nextMilestone?.status === 'in-progress' ? 'Current Focus' : 'Next Step';

  const renderMilestone = ({ item, index }: { item: CareerMilestone; index: number }) => {
    const isLast = index === roadmap.length - 1;
    const isActive = item.status === 'in-progress';
    const isDone = item.status === 'completed';

    return (
      <Reanimated.View entering={FadeInDown.delay(index * 100).springify().damping(16)}>
        <View style={styles.milestoneRow}>
          <View style={styles.milestoneTrack}>
            <StageIcon status={item.status} index={index} />
            {!isLast && (
              <View style={[styles.trackLine, { backgroundColor: isDone ? colors.success : colors.border }]} />
            )}
          </View>
          <GlowGlass
            variant={isActive ? 'green' : 'subtle'}
            blurIntensity={0}
            glowIntensity={isActive ? 'high' : 'low'}
          >
            <View style={styles.milestoneCard}>
              <View style={styles.milestoneTop}>
                <View style={styles.stagePill}>
                  <Text style={[styles.stagePillText, { color: NigeriaColors.green }]}>{item.stage}</Text>
                </View>
                {isActive && (
                  <View style={[styles.activePill, { backgroundColor: NigeriaColors.green + '15' }]}>
                    <View style={[styles.activeDot, { backgroundColor: NigeriaColors.green }]} />
                    <Text style={[styles.activePillText, { color: NigeriaColors.green }]}>In Progress</Text>
                  </View>
                )}
                {isDone && (
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                )}
              </View>
              <Text style={[styles.milestoneTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.milestoneDesc, { color: colors.textSecondary }]}>{item.description}</Text>
            </View>
          </GlowGlass>
        </View>
      </Reanimated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingWrap}>
          <View style={[styles.loadingRing, { borderColor: NigeriaColors.green + '30' }]}>
            <ActivityIndicator size="small" color={NigeriaColors.green} />
          </View>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Mapping your nursing journey...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingWrap}>
          <View style={[styles.errorIconWrap, { backgroundColor: NigeriaColors.green + '12' }]}>
            <Ionicons name="cloud-offline-outline" size={32} color={NigeriaColors.green} />
          </View>
          <Text style={[styles.loadingText, { color: colors.textLight }]}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadRoadmap}>
            <Ionicons name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Hero header */}
      <View style={styles.heroWrap}>
        <GlowGlass variant="green" glowIntensity="medium" blurIntensity={0}>
          <View style={styles.heroInner}>
            <ProgressSection progress={progress} completedCount={completedCount} totalCount={totalCount} role={user?.role || 'Nursing'} institution={user?.institution || 'Nigeria'} />
          </View>
        </GlowGlass>

        {nextMilestone && (
          <View style={[styles.nextCard, { backgroundColor: isDark ? '#151b2e' : '#ffffff', borderColor: isDark ? '#2a2f45' : '#e8ecf4' }]}>
            <View style={styles.nextDot}>
              <Ionicons name="flag-outline" size={14} color={NigeriaColors.green} />
            </View>
            <View style={styles.nextContent}>
              <Text style={[styles.nextLabel, { color: NigeriaColors.green }]}>{nextLabel}</Text>
              <Text style={[styles.nextTitle, { color: colors.text }]} numberOfLines={1}>{nextMilestone.title}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.textLight} />
          </View>
        )}
      </View>

      {/* Milestones list */}
      <FlatList
        data={roadmap}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderMilestone}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Loading / Error */
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  loadingRing: { width: 48, height: 48, borderRadius: 24, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, marginTop: Spacing.lg, textAlign: 'center' },
  errorIconWrap: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  retryBtn: {
    marginTop: Spacing.lg, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2,
    backgroundColor: NigeriaColors.green, borderRadius: BorderRadius.full,
  },
  retryText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: '#FFFFFF' },

  /* Hero */
  heroWrap: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.xs },
  heroInner: { padding: Spacing.md },
  heroTitle: { fontFamily: FontFamily.display, fontSize: FontSize.xxl },
  heroSub: { fontFamily: FontFamily.body, fontSize: FontSize.sm, marginTop: 2 },
  heroProgressPct: { fontFamily: FontFamily.displayExtra, fontSize: FontSize.lg },
  heroProgressLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs, marginLeft: 2 },
  progressBg: { height: PROGRESS_BAR_HEIGHT, borderRadius: PROGRESS_BAR_HEIGHT / 2, overflow: 'hidden', marginTop: Spacing.md },
  progressFill: { height: '100%', borderRadius: PROGRESS_BAR_HEIGHT / 2, backgroundColor: NigeriaColors.green },
  heroStatsRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  heroStat: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  heroStatVal: { fontFamily: FontFamily.displayExtra, fontSize: FontSize.md },
  heroStatLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs },
  heroStatDivider: { width: 1, height: 16, marginHorizontal: Spacing.md },

  /* Next step card */
  nextCard: {
    flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm,
    paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg, borderWidth: 1,
  },
  nextDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: NigeriaColors.green + '15', justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm },
  nextContent: { flex: 1 },
  nextLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  nextTitle: { fontFamily: FontFamily.heading, fontSize: FontSize.sm, marginTop: 1 },

  /* Milestone timeline */
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl + Spacing.xl },
  milestoneRow: { flexDirection: 'row', marginBottom: 0 },
  milestoneTrack: { alignItems: 'center', width: 32, marginRight: Spacing.sm },
  stageDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stageDotNum: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.xs, color: '#FFFFFF' },
  trackLine: { width: 2, flex: 1, marginVertical: 4, minHeight: 24 },

  /* Milestone card */
  milestoneCard: { padding: Spacing.md },
  milestoneTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  stagePill: {
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
    backgroundColor: NigeriaColors.green + '12', borderRadius: BorderRadius.full,
  },
  stagePillText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, textTransform: 'uppercase', letterSpacing: 1 },
  activePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  activeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  activePillText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs },
  milestoneTitle: { fontFamily: FontFamily.heading, fontSize: FontSize.md, marginBottom: 2 },
  milestoneDesc: { fontFamily: FontFamily.body, fontSize: FontSize.sm, lineHeight: 18 },
});
