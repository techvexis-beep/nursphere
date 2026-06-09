import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow, NigeriaColors } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useStats } from '../../src/context/StatsContext';
import { drugDatabase } from '../../src/data/mockData';
import { useResponsiveCtx } from '../../src/context/ResponsiveContext';
import { scale, verticalScale, moderateScale, responsiveFontSize } from '../../src/utils/responsive';

export default function DrugReferenceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { incrementQuestions, startStudyTimer, stopStudyTimer } = useStats();
  const resp = useResponsiveCtx();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      startStudyTimer();
      return () => stopStudyTimer();
    }, [])
  );

  const handleSelect = (i: number) => {
    if (selected !== i) {
      setSelected(i);
      incrementQuestions();
    } else {
      setSelected(null);
    }
  };

  const filtered = drugDatabase.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <LinearGradient colors={['#F59E0B', '#F97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.header, { paddingHorizontal: resp.scale(Spacing.lg), paddingVertical: resp.scale(Spacing.md) }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { width: resp.scale(36), height: resp.scale(36), borderRadius: resp.scale(10) }]}><Ionicons name="arrow-back" size={moderateScale(22)} color={colors.white} /></TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: resp.responsiveFontSize(FontSize.lg) }]}>Drug Reference</Text>
          <View style={[styles.backBtn, { width: resp.scale(36), height: resp.scale(36), borderRadius: resp.scale(10) }]} />
        </View>
        <Text style={[styles.headerSub, { fontSize: resp.responsiveFontSize(FontSize.sm), marginTop: resp.scale(Spacing.xs) }]}>Common medications & dosages</Text>
      </LinearGradient>

      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }, { borderRadius: resp.scale(BorderRadius.lg), marginHorizontal: resp.scale(Spacing.md), marginTop: resp.scale(Spacing.md), paddingHorizontal: resp.scale(Spacing.md) }]}>
        <Ionicons name="search" size={moderateScale(18)} color={colors.textSecondary} style={[styles.searchIcon, { marginRight: resp.scale(Spacing.sm) }]} />
        <TextInput style={[styles.searchInput, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md), paddingVertical: resp.scale(Spacing.sm + 2) }]} value={search} onChangeText={setSearch} placeholder="Search drugs..." placeholderTextColor={colors.textLight} />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={moderateScale(18)} color={colors.textLight} /></TouchableOpacity> : null}
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { padding: resp.scale(Spacing.md), paddingTop: resp.scale(Spacing.sm) }]} keyboardShouldPersistTaps="handled">
        {filtered.length === 0 ? (
          <View style={[styles.empty, { paddingVertical: resp.scale(Spacing.xxl) }]}><Ionicons name="medkit-outline" size={resp.moderateScale(40)} color={colors.textLight} /><Text style={[styles.emptyText, { color: colors.textLight }, { fontSize: resp.responsiveFontSize(FontSize.md), marginTop: resp.scale(Spacing.md) }]}>No drugs found</Text></View>
        ) : (
          filtered.map((drug, i) => {
            const isSelected = selected === i;
            const colors_ = [['#0D9488', '#14B8A6'], ['#6366F1', '#818CF8'], ['#F59E0B', '#F97316']];
            const grad = colors_[i % colors_.length] as [string, string];
            return (
              <TouchableOpacity key={i} style={[styles.drugCard, { backgroundColor: colors.surface, borderColor: colors.border }, { borderRadius: resp.scale(BorderRadius.lg), padding: resp.scale(Spacing.md), marginBottom: resp.scale(Spacing.sm) }]} onPress={() => handleSelect(i)} activeOpacity={0.85}>
                <View style={styles.drugHeader}>
                  <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.drugIconWrap, { width: resp.scale(40), height: resp.scale(40), borderRadius: resp.scale(12), marginRight: resp.scale(Spacing.sm) }]}><Ionicons name="medical" size={resp.scale(18)} color={colors.white} /></LinearGradient>
                  <View style={styles.drugInfo}>
                    <Text style={[styles.drugName, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md) }]}>{drug.name}</Text>
                    <Text style={[styles.drugRoute, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.xs), marginTop: 1 }]}>{drug.route} · {drug.indication}</Text>
                  </View>
                  <Ionicons name={isSelected ? 'chevron-up' : 'chevron-down'} size={moderateScale(18)} color={colors.textSecondary} />
                </View>
                {isSelected && (
                  <View style={[styles.drugDetails, { borderTopColor: colors.border }, { borderTopWidth: 1, marginTop: resp.scale(Spacing.sm), paddingTop: resp.scale(Spacing.sm) }]}>
                    <View style={[styles.detailRow, { marginBottom: resp.scale(Spacing.xs) }]}><Text style={[styles.detailLabel, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm), width: resp.moderateScale(90) }]}>Dosage</Text><Text style={[styles.detailValue, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm), lineHeight: resp.verticalScale(20) }]}>{drug.commonDosage}</Text></View>
                    <View style={[styles.detailRow, { marginBottom: resp.scale(Spacing.xs) }]}><Text style={[styles.detailLabel, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm), width: resp.moderateScale(90) }]}>Max Daily</Text><Text style={[styles.detailValue, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm), lineHeight: resp.verticalScale(20) }]}>{drug.maxDaily}</Text></View>
                    <View style={[styles.detailRow, { marginBottom: resp.scale(Spacing.xs) }]}><Text style={[styles.detailLabel, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm), width: resp.moderateScale(90) }]}>Route</Text><Text style={[styles.detailValue, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm), lineHeight: resp.verticalScale(20) }]}>{drug.route}</Text></View>
                    <View style={[styles.detailRow, { marginBottom: resp.scale(Spacing.xs) }]}><Text style={[styles.detailLabel, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm), width: resp.moderateScale(90) }]}>Indication</Text><Text style={[styles.detailValue, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.sm), lineHeight: resp.verticalScale(20) }]}>{drug.indication}</Text></View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: resp.scale(Spacing.xxl) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {},
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: FontFamily.display, color: '#FFFFFF' },
  headerSub: { fontFamily: FontFamily.body, color: 'rgba(255,255,255,0.8)' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, ...Shadow.sm },
  searchIcon: {},
  searchInput: { flex: 1, fontFamily: FontFamily.body },
  scroll: {},
  drugCard: { borderWidth: 1, ...Shadow.sm },
  drugHeader: { flexDirection: 'row', alignItems: 'center' },
  drugIconWrap: { justifyContent: 'center', alignItems: 'center' },
  drugInfo: { flex: 1 },
  drugName: { fontFamily: FontFamily.heading },
  drugRoute: { fontFamily: FontFamily.body },
  drugDetails: {},
  detailRow: { flexDirection: 'row' },
  detailLabel: { fontFamily: FontFamily.bodyMedium },
  detailValue: { fontFamily: FontFamily.body, flex: 1 },
  empty: { alignItems: 'center' },
  emptyText: { fontFamily: FontFamily.body },
});
