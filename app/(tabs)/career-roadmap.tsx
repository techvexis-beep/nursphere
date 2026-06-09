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
import { useResponsiveCtx } from '../../src/context/ResponsiveContext';
import { scale, verticalScale, moderateScale, responsiveFontSize } from '../../src/utils/responsive';

const PROGRESS_BAR_HEIGHT = 8;

function ProgressSection({ progress, completedCount, totalCount, role, institution }: { progress: number; completedCount: number; totalCount: number; role: string; institution: string }) {
  const { colors, isDark } = useTheme();
  const resp = useResponsiveCtx();
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: resp.scale(6) }}>
        <Text style={[styles.heroTitle, { color: isDark ? '#FFFFFF' : '#1a1a2e' }, { fontSize: resp.responsiveFontSize(FontSize.xxl) }]}>Career Roadmap</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: resp.scale(2) }}>
          <Text style={[styles.heroProgressPct, { color: NigeriaColors.green }, { fontSize: resp.responsiveFontSize(FontSize.lg) }]}>{Math.round(progress * 100)}%</Text>
          <Text style={[styles.heroProgressLabel, { color: colors.textLight }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>complete</Text>
        </View>
      </View>
      <Text style={[styles.heroSub, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>
        {role} · {institution}
      </Text>
      <View style={[styles.progressBg, { backgroundColor: isDark ? '#2a2f45' : '#e8ecf4' }, { height: PROGRESS_BAR_HEIGHT, borderRadius: PROGRESS_BAR_HEIGHT / 2, marginTop: resp.scale(Spacing.md) }]}>
        <Animated.View style={[styles.progressFill, { width: widthInterp }]} />
      </View>
      <View style={[styles.heroStatsRow, { marginTop: resp.scale(Spacing.sm) }]}>
        <View style={styles.heroStat}>
          <Text style={[styles.heroStatVal, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md) }]}>{completedCount}</Text>
          <Text style={[styles.heroStatLabel, { color: colors.textLight }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>completed</Text>
        </View>
        <View style={[styles.heroStatDivider, { backgroundColor: colors.border }, { width: 1, height: resp.verticalScale(16), marginHorizontal: resp.scale(Spacing.md) }]} />
        <View style={styles.heroStat}>
          <Text style={[styles.heroStatVal, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md) }]}>{totalCount - completedCount}</Text>
          <Text style={[styles.heroStatLabel, { color: colors.textLight }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>remaining</Text>
        </View>
      </View>
    </View>
  );
}

function StageIcon({ status, index }: { status: string; index: number }) {
  const { colors } = useTheme();
  const resp = useResponsiveCtx();
  if (status === 'completed')
    return <View style={[styles.stageDot, { backgroundColor: colors.success }, { width: resp.scale(28), height: resp.scale(28), borderRadius: resp.scale(14) }]}><Ionicons name="checkmark" size={resp.scale(14)} color="#FFFFFF" /></View>;
  if (status === 'in-progress')
    return <View style={[styles.stageDot, { backgroundColor: NigeriaColors.green, boxShadow: '0 0 8px rgba(0,135,81,0.6)', elevation: 6 }, { width: resp.scale(28), height: resp.scale(28), borderRadius: resp.scale(14) }]}><Text style={[styles.stageDotNum, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{index + 1}</Text></View>;
  return <View style={[styles.stageDot, { backgroundColor: colors.border }, { width: resp.scale(28), height: resp.scale(28), borderRadius: resp.scale(14) }]}><Text style={[styles.stageDotNum, { color: colors.textLight }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{index + 1}</Text></View>;
}

export default function CareerRoadmapScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { stats, startStudyTimer, stopStudyTimer } = useStats();
  const resp = useResponsiveCtx();
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
          <View style={[styles.milestoneTrack, { width: resp.scale(32), marginRight: resp.scale(Spacing.sm) }]}>
            <StageIcon status={item.status} index={index} />
            {!isLast && (
              <View style={[styles.trackLine, { backgroundColor: isDone ? colors.success : colors.border }, { width: 2, marginVertical: resp.scale(4), minHeight: resp.verticalScale(24) }]} />
            )}
          </View>
          <GlowGlass
            variant={isActive ? 'green' : 'subtle'}
            blurIntensity={0}
            glowIntensity={isActive ? 'high' : 'low'}
          >
            <View style={[styles.milestoneCard, { padding: resp.scale(Spacing.md) }]}>
              <View style={[styles.milestoneTop, { marginBottom: resp.scale(Spacing.sm) }]}>
                <View style={[styles.stagePill, { paddingHorizontal: resp.scale(Spacing.sm), paddingVertical: resp.scale(2), borderRadius: resp.scale(BorderRadius.full) }]}>
                  <Text style={[styles.stagePillText, { color: NigeriaColors.green }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{item.stage}</Text>
                </View>
                {isActive && (
                  <View style={[styles.activePill, { backgroundColor: NigeriaColors.green + '15' }, { paddingHorizontal: resp.scale(Spacing.sm), paddingVertical: resp.scale(2), borderRadius: resp.scale(BorderRadius.full) }]}>
                    <View style={[styles.activeDot, { backgroundColor: NigeriaColors.green }, { width: resp.scale(6), height: resp.scale(6), borderRadius: resp.scale(3), marginRight: resp.scale(4) }]} />
                    <Text style={[styles.activePillText, { color: NigeriaColors.green }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>In Progress</Text>
                  </View>
                )}
                {isDone && (
                  <Ionicons name="checkmark-circle" size={moderateScale(18)} color={colors.success} />
                )}
              </View>
              <Text style={[styles.milestoneTitle, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md) }]}>{item.title}</Text>
              <Text style={[styles.milestoneDesc, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm), lineHeight: resp.verticalScale(18) }]}>{item.description}</Text>
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
          <View style={[styles.loadingRing, { borderColor: NigeriaColors.green + '30' }, { width: resp.scale(48), height: resp.scale(48), borderRadius: resp.scale(24), borderWidth: resp.scale(4) }]}>
            <ActivityIndicator size="small" color={NigeriaColors.green} />
          </View>
          <Text style={[styles.loadingText, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm), marginTop: resp.scale(Spacing.lg) }]}>Mapping your nursing journey...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingWrap}>
          <View style={[styles.errorIconWrap, { backgroundColor: NigeriaColors.green + '12' }, { width: resp.scale(56), height: resp.scale(56), borderRadius: resp.scale(28) }]}>
            <Ionicons name="cloud-offline-outline" size={resp.moderateScale(32)} color={NigeriaColors.green} />
          </View>
          <Text style={[styles.loadingText, { color: colors.textLight }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { marginTop: resp.scale(Spacing.lg), paddingHorizontal: resp.scale(Spacing.lg), paddingVertical: resp.scale(Spacing.sm + 2), borderRadius: resp.scale(BorderRadius.full) }]} onPress={loadRoadmap}>
            <Ionicons name="refresh" size={resp.scale(16)} color="#FFFFFF" style={{ marginRight: resp.scale(6) }} />
            <Text style={[styles.retryText, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Hero header */}
      <View style={[styles.heroWrap, { paddingHorizontal: resp.scale(Spacing.lg), paddingTop: resp.scale(Spacing.sm), paddingBottom: resp.scale(Spacing.xs) }]}>
        <GlowGlass variant="green" glowIntensity="medium" blurIntensity={0}>
          <View style={[styles.heroInner, { padding: resp.scale(Spacing.md) }]}>
            <ProgressSection progress={progress} completedCount={completedCount} totalCount={totalCount} role={user?.role || 'Nursing'} institution={user?.institution || 'Nigeria'} />
          </View>
        </GlowGlass>

        {nextMilestone && (
          <View style={[styles.nextCard, { backgroundColor: isDark ? '#151b2e' : '#ffffff', borderColor: isDark ? '#2a2f45' : '#e8ecf4' }, { marginTop: resp.scale(Spacing.sm), paddingVertical: resp.scale(Spacing.sm + 2), paddingHorizontal: resp.scale(Spacing.md), borderRadius: resp.scale(BorderRadius.lg) }]}>
            <View style={[styles.nextDot, { backgroundColor: NigeriaColors.green + '15' }, { width: resp.scale(28), height: resp.scale(28), borderRadius: resp.scale(14), marginRight: resp.scale(Spacing.sm) }]}>
              <Ionicons name="flag-outline" size={resp.scale(14)} color={NigeriaColors.green} />
            </View>
            <View style={styles.nextContent}>
              <Text style={[styles.nextLabel, { color: NigeriaColors.green }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{nextLabel}</Text>
              <Text style={[styles.nextTitle, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]} numberOfLines={1}>{nextMilestone.title}</Text>
            </View>
            <Ionicons name="arrow-forward" size={resp.scale(16)} color={colors.textLight} />
          </View>
        )}
      </View>

      {/* Milestones list */}
      <FlatList
        data={roadmap}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingHorizontal: resp.scale(Spacing.lg), paddingBottom: resp.verticalScale(Spacing.xxxl + Spacing.xl) }]}
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
  loadingRing: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: FontFamily.body, textAlign: 'center' },
  errorIconWrap: { justifyContent: 'center', alignItems: 'center' },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: NigeriaColors.green,
  },
  retryText: { fontFamily: FontFamily.bodySemiBold, color: '#FFFFFF' },

  /* Hero */
  heroWrap: {},
  heroInner: {},
  heroTitle: { fontFamily: FontFamily.display },
  heroSub: { fontFamily: FontFamily.body, marginTop: 2 },
  heroProgressPct: { fontFamily: FontFamily.displayExtra },
  heroProgressLabel: { fontFamily: FontFamily.body, marginLeft: 2 },
  progressBg: { overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: PROGRESS_BAR_HEIGHT / 2, backgroundColor: NigeriaColors.green },
  heroStatsRow: { flexDirection: 'row', alignItems: 'center' },
  heroStat: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  heroStatVal: { fontFamily: FontFamily.displayExtra },
  heroStatLabel: { fontFamily: FontFamily.body },
  heroStatDivider: {},

  /* Next step card */
  nextCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1,
  },
  nextDot: { justifyContent: 'center', alignItems: 'center' },
  nextContent: { flex: 1 },
  nextLabel: { fontFamily: FontFamily.bodySemiBold, textTransform: 'uppercase', letterSpacing: 0.5 },
  nextTitle: { fontFamily: FontFamily.heading, marginTop: 1 },

  /* Milestone timeline */
  list: {},
  milestoneRow: { flexDirection: 'row', marginBottom: 0 },
  milestoneTrack: { alignItems: 'center' },
  stageDot: { justifyContent: 'center', alignItems: 'center' },
  stageDotNum: { fontFamily: FontFamily.bodyBold, color: '#FFFFFF' },
  trackLine: {},

  /* Milestone card */
  milestoneCard: {},
  milestoneTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stagePill: {
    backgroundColor: NigeriaColors.green + '12',
  },
  stagePillText: { fontFamily: FontFamily.bodySemiBold, textTransform: 'uppercase', letterSpacing: 1 },
  activePill: { flexDirection: 'row', alignItems: 'center' },
  activeDot: {},
  activePillText: { fontFamily: FontFamily.bodySemiBold },
  milestoneTitle: { fontFamily: FontFamily.heading, marginBottom: 2 },
  milestoneDesc: { fontFamily: FontFamily.body },
});
