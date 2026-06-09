import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow, NigeriaColors } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useStats } from '../../src/context/StatsContext';
import { achievements } from '../../src/data/achievements';
import { fetchCareerInsight } from '../../src/services/geminiInsights';
import { useResponsiveCtx } from '../../src/context/ResponsiveContext';
import { scale, verticalScale, moderateScale, responsiveFontSize } from '../../src/utils/responsive';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  right: React.ReactNode;
  onPress?: () => void;
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleDark } = useTheme();
  const { stats, startStudyTimer, stopStudyTimer } = useStats();
  const resp = useResponsiveCtx();

  useFocusEffect(
    useCallback(() => {
      startStudyTimer();
      return () => stopStudyTimer();
    }, [])
  );

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const [careerInsight, setCareerInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);

  useEffect(() => {
    (async () => {
      const role = user?.role || 'Nursing Student';
      const year = user?.year || '';
      const institution = user?.institution || '';
      const insight = await fetchCareerInsight(role, year, institution);
      setCareerInsight(insight);
      setLoadingInsight(false);
    })();
  }, [user]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems: MenuItem[][] = [
    [
      {
        icon: 'trophy-outline',
        label: 'Achievements',
        right: <Text style={[styles.menuRightText, { color: colors.textSecondary }]}>{unlockedCount}/{achievements.length}</Text>,
      },
      {
        icon: 'trending-up',
        label: 'Career Progress',
        right: (
          <View style={styles.progressMini}>
            <View style={[styles.miniBarBg, { backgroundColor: colors.surfaceAlt }]}>
              <View style={[styles.miniBarFill, { width: '42%', backgroundColor: NigeriaColors.green }]} />
            </View>
          </View>
        ),
      },
    ],
    [
      {
        icon: 'bulb-outline',
        label: 'AI Career Insight',
        right: loadingInsight
          ? <ActivityIndicator size="small" color={NigeriaColors.green} />
          : <Text style={[styles.menuRightText, { color: colors.textSecondary, maxWidth: moderateScale(180), textAlign: 'right' }]} numberOfLines={2}>{careerInsight}</Text>,
      },
    ],
    [
      {
        icon: isDark ? 'moon' : 'moon-outline',
        label: 'Dark Mode',
        right: (
          <Switch
            value={isDark}
            onValueChange={toggleDark}
            trackColor={{ false: colors.border, true: NigeriaColors.green + '60' }}
            thumbColor={isDark ? NigeriaColors.green : colors.textLight}
          />
        ),
      },
    ],
    [
      {
        icon: 'log-out-outline',
        label: 'Sign Out',
        right: <Ionicons name="chevron-forward" size={moderateScale(18)} color={colors.textLight} />,
        onPress: handleLogout,
      },
    ],
  ];

  const displayName = user?.name || 'Nurse';
  const displayAvatar = user?.avatar || 'NU';
  const displayRole = user?.role || 'Nursing Student';
  const displayInstitution = user?.institution || '';
  const displayYear = user?.year || '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: verticalScale(Spacing.xxxl + Spacing.xl) }]}>
        <View style={[styles.profileTop, { paddingTop: resp.scale(Spacing.xl), paddingBottom: resp.scale(Spacing.lg), paddingHorizontal: resp.scale(Spacing.lg) }]}>
          <View style={[styles.ghostWrap, { backgroundColor: isDark ? '#1a2040' : '#e8ecf4' }, { width: resp.scale(100), height: resp.verticalScale(120), borderRadius: resp.scale(30), marginBottom: resp.scale(Spacing.md) }]}>
            <View style={styles.ghostBody}>
              <Ionicons name="happy-outline" size={resp.scale(44)} color={NigeriaColors.green} style={styles.ghostIcon} />
              <Text style={[styles.ghostInitials, { color: isDark ? '#b8c4e0' : '#556080' }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>{displayAvatar}</Text>
            </View>
          </View>
          <Text style={[styles.displayName, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.xxl) }]}>{displayName}</Text>
          {displayRole ? <Text style={[styles.displayRole, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.md) }]}>{displayRole}</Text> : null}
          {displayInstitution ? (
            <Text style={[styles.displayInstitution, { color: colors.textLight }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>
              {displayInstitution}{displayYear ? ` · ${displayYear}` : ''}
            </Text>
          ) : null}
        </View>

        <View style={[styles.statsRow, { backgroundColor: isDark ? '#151b2e' : '#ffffff', borderColor: isDark ? '#2a2f45' : '#e8ecf4' }, { marginHorizontal: resp.scale(Spacing.lg), borderRadius: resp.scale(BorderRadius.lg), padding: resp.scale(Spacing.md), marginBottom: resp.scale(Spacing.md) }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.xl) }]}>{stats.studyMinutes}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>Minutes</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }, { width: 1, height: resp.verticalScale(36) }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.xl) }]}>{stats.practiceQuestions}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>Questions</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }, { width: 1, height: resp.verticalScale(36) }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.xl) }]}>{stats.connections}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>Connections</Text>
          </View>
        </View>

        <View style={[styles.menuSections, { paddingHorizontal: resp.scale(Spacing.lg), gap: resp.scale(Spacing.sm) }]}>
          {menuItems.map((section, si) => (
            <View key={si} style={[styles.menuSection, { backgroundColor: isDark ? '#151b2e' : '#ffffff', borderColor: isDark ? '#2a2f45' : '#e8ecf4' }, { borderRadius: resp.scale(BorderRadius.lg) }]}>
              {section.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[styles.menuRow, ii < section.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#2a2f45' : '#f0f0f5' }, { paddingVertical: resp.scale(Spacing.md), paddingHorizontal: resp.scale(Spacing.md) }]}
                  onPress={item.onPress}
                  activeOpacity={item.onPress ? 0.6 : 1}
                >
                  <View style={styles.menuLeft}>
                    <Ionicons name={item.icon} size={moderateScale(20)} color={NigeriaColors.green} style={[styles.menuIcon, { marginRight: resp.scale(Spacing.sm) }]} />
                    <Text style={[styles.menuLabel, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md) }]}>{item.label}</Text>
                  </View>
                  <View style={styles.menuRight}>{item.right}</View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <Text style={[styles.footer, { color: colors.textLight }, { fontSize: resp.responsiveFontSize(FontSize.xs), marginTop: resp.scale(Spacing.xl) }]}>Nursphere · Nigerian Nursing Companion</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {},

  profileTop: { alignItems: 'center' },
  ghostWrap: {
    justifyContent: 'center', alignItems: 'center',
  },
  ghostBody: { alignItems: 'center', justifyContent: 'center' },
  ghostIcon: { marginBottom: -4 },
  ghostInitials: { fontFamily: FontFamily.heading, letterSpacing: 1 },
  displayName: { fontFamily: FontFamily.display },
  displayRole: { fontFamily: FontFamily.bodyMedium, marginTop: 2 },
  displayInstitution: { fontFamily: FontFamily.body, marginTop: 2 },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, ...Shadow.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: FontFamily.displayExtra },
  statLabel: { fontFamily: FontFamily.body, marginTop: 2 },
  statDivider: {},

  menuSections: {},
  menuSection: {
    overflow: 'hidden',
    borderWidth: 1, ...Shadow.sm,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIcon: {},
  menuLabel: { fontFamily: FontFamily.body },
  menuRight: { flexDirection: 'row', alignItems: 'center' },
  menuRightText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm },
  progressMini: { width: moderateScale(80) },
  miniBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 3 },

  footer: { fontFamily: FontFamily.body, textAlign: 'center' },
});
