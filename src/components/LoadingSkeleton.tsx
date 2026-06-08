import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withRepeat, withTiming, Easing, useAnimatedStyle } from 'react-native-reanimated';
import { BorderRadius, Spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

function Shimmer({ style }: { style?: any }) {
  const opacity = useSharedValue(0.3);

  opacity.value = withRepeat(
    withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
    -1,
    true
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.shimmer, style, animatedStyle]} />;
}

export function SkeletonLine({ width = '100%' }: { width?: string | number }) {
  const { colors } = useTheme();
  return <Shimmer style={{ width, height: 14, borderRadius: 7, backgroundColor: colors.border }} />;
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </View>
  );
}

export function SkeletonCircle({ size = 40 }: { size?: number }) {
  const { colors } = useTheme();
  return <Shimmer style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.border }} />;
}

const styles = StyleSheet.create({
  shimmer: {
    marginBottom: Spacing.sm,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
});
