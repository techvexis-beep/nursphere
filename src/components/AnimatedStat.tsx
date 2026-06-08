import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

type Props = {
  value: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  delay?: number;
};

export default function AnimatedStat({ value, label, icon, delay = 0 }: Props) {
  const [displayValue, setDisplayValue] = useState(0);
  const { colors } = useTheme();

  useEffect(() => {
    setDisplayValue(0);
    const timer = setTimeout(() => {
      const steps = 20;
      const increment = value / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.round(current));
        }
      }, 40);
    }, delay + 200);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={[styles.card, { backgroundColor: colors.surface }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primary + '12' }]}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{displayValue}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.sm,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  value: {
    fontFamily: FontFamily.displayExtra,
    fontSize: FontSize.xl,
  },
  label: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    marginTop: 1,
  },
});
