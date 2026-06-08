import { useState, useRef } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, NigeriaColors, Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'medkit' as const,
    title: 'Welcome to Nursphere',
    subtitle: 'Your ultimate Nigerian nursing companion — powered by AI and built for success.',
    gradient: ['#0D9488', '#0F766E'] as [string, string],
  },
  {
    id: '2',
    icon: 'sparkles' as const,
    title: 'AI-Powered Clinical Tools',
    subtitle: 'NANDA-I 2024-2026 diagnosis, dosage calculator, drug reference, and step-by-step nursing guides.',
    gradient: ['#6366F1', '#4F46E5'] as [string, string],
  },
  {
    id: '3',
    icon: 'people' as const,
    title: 'Connect & Grow',
    subtitle: 'Join Nigerian nursing professionals. Share knowledge, track your career, and ace the NMCN exam.',
    gradient: ['#008751', '#00A859'] as [string, string],
  },
];

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) setCurrentIndex(viewableItems[0].index ?? 0);
  }).current;

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconWrap}>
              <Ionicons name={item.icon} size={48} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === currentIndex ? NigeriaColors.green : Colors.border, width: i === currentIndex ? 24 : 8 },
              ]}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={nextSlide} activeOpacity={0.8}>
          <Text style={styles.nextBtnText}>{currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
          <Ionicons name={currentIndex === slides.length - 1 ? 'checkmark' : 'arrow-forward'} size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.flagBar}>
        <View style={[styles.flagSegment, { backgroundColor: NigeriaColors.green }]} />
        <View style={[styles.flagSegment, { backgroundColor: Colors.white }]} />
        <View style={[styles.flagSegment, { backgroundColor: NigeriaColors.green }]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  slide: { width: SCREEN_WIDTH, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  iconWrap: {
    width: 120, height: 120, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xl, ...Shadow.lg,
  },
  title: { fontFamily: FontFamily.display, fontSize: FontSize.xxl, color: Colors.text, textAlign: 'center', marginBottom: Spacing.md },
  subtitle: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: Spacing.md },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg },
  dots: { flexDirection: 'row', gap: Spacing.xs },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: NigeriaColors.green, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.full, gap: Spacing.sm, ...Shadow.md },
  nextBtnText: { fontFamily: FontFamily.heading, fontSize: FontSize.md, color: Colors.white },
  flagBar: { flexDirection: 'row', height: 4 },
  flagSegment: { flex: 1 },
});
