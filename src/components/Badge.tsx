import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

type Props = {
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  color: string;
  index?: number;
};

export default function Badge({ icon, title, description, unlocked, color, index = 0 }: Props) {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      style={[
        styles.card,
        {
          backgroundColor: unlocked ? colors.surface : colors.surfaceAlt,
          borderColor: unlocked ? color + '30' : colors.border,
          opacity: unlocked ? 1 : 0.5,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: unlocked ? color + '15' : colors.border }]}>
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={unlocked ? color : colors.textLight}
        />
      </View>
      <Text style={[styles.title, { color: unlocked ? colors.text : colors.textLight }]}>{title}</Text>
      <Text style={[styles.desc, { color: colors.textSecondary }]}>{description}</Text>
      {!unlocked && (
        <View style={[styles.lockBadge, { backgroundColor: colors.border }]}>
          <Ionicons name="lock-closed" size={10} color={colors.textLight} />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    width: '47%',
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  desc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
