import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, FontFamily, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name={icon} size={40} color={colors.textLight} />
      </View>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textLight }]}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: Spacing.lg },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  title: { fontFamily: FontFamily.heading, fontSize: FontSize.md, textAlign: 'center' },
  subtitle: { fontFamily: FontFamily.body, fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.xs, lineHeight: 20 },
  button: { marginTop: Spacing.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  buttonText: { fontFamily: FontFamily.heading, fontSize: FontSize.sm, color: '#FFFFFF' },
});
