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

export default function DrugReferenceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { incrementQuestions, startStudyTimer, stopStudyTimer } = useStats();
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
      <LinearGradient colors={['#F59E0B', '#F97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={22} color={colors.white} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Drug Reference</Text>
          <View style={styles.backBtn} />
        </View>
        <Text style={styles.headerSub}>Common medications & dosages</Text>
      </LinearGradient>

      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput style={[styles.searchInput, { color: colors.text }]} value={search} onChangeText={setSearch} placeholder="Search drugs..." placeholderTextColor={colors.textLight} />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={colors.textLight} /></TouchableOpacity> : null}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {filtered.length === 0 ? (
          <View style={styles.empty}><Ionicons name="medkit-outline" size={40} color={colors.textLight} /><Text style={[styles.emptyText, { color: colors.textLight }]}>No drugs found</Text></View>
        ) : (
          filtered.map((drug, i) => {
            const isSelected = selected === i;
            const colors_ = [['#0D9488', '#14B8A6'], ['#6366F1', '#818CF8'], ['#F59E0B', '#F97316']];
            const grad = colors_[i % colors_.length] as [string, string];
            return (
              <TouchableOpacity key={i} style={[styles.drugCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => handleSelect(i)} activeOpacity={0.85}>
                <View style={styles.drugHeader}>
                  <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.drugIconWrap}><Ionicons name="medical" size={18} color={colors.white} /></LinearGradient>
                  <View style={styles.drugInfo}>
                    <Text style={[styles.drugName, { color: colors.text }]}>{drug.name}</Text>
                    <Text style={[styles.drugRoute, { color: colors.textSecondary }]}>{drug.route} · {drug.indication}</Text>
                  </View>
                  <Ionicons name={isSelected ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
                </View>
                {isSelected && (
                  <View style={[styles.drugDetails, { borderTopColor: colors.border }]}>
                    <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Dosage</Text><Text style={[styles.detailValue, { color: colors.text }]}>{drug.commonDosage}</Text></View>
                    <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Max Daily</Text><Text style={[styles.detailValue, { color: colors.text }]}>{drug.maxDaily}</Text></View>
                    <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Route</Text><Text style={[styles.detailValue, { color: colors.text }]}>{drug.route}</Text></View>
                    <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Indication</Text><Text style={[styles.detailValue, { color: colors.text }]}>{drug.indication}</Text></View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: FontFamily.display, fontSize: FontSize.lg, color: '#FFFFFF' },
  headerSub: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: Spacing.xs },
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg, marginHorizontal: Spacing.md, marginTop: Spacing.md, paddingHorizontal: Spacing.md, borderWidth: 1, ...Shadow.sm },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.md, paddingVertical: Spacing.sm + 2 },
  scroll: { padding: Spacing.md, paddingTop: Spacing.sm },
  drugCard: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, ...Shadow.sm },
  drugHeader: { flexDirection: 'row', alignItems: 'center' },
  drugIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm },
  drugInfo: { flex: 1 },
  drugName: { fontFamily: FontFamily.heading, fontSize: FontSize.md },
  drugRoute: { fontFamily: FontFamily.body, fontSize: FontSize.xs, marginTop: 1 },
  drugDetails: { borderTopWidth: 1, marginTop: Spacing.sm, paddingTop: Spacing.sm },
  detailRow: { flexDirection: 'row', marginBottom: Spacing.xs },
  detailLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, width: 90 },
  detailValue: { fontFamily: FontFamily.body, fontSize: FontSize.sm, flex: 1, lineHeight: 20 },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontFamily: FontFamily.body, fontSize: FontSize.md, marginTop: Spacing.md },
});
