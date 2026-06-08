import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Glass, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  blurIntensity?: number;
  noPadding?: boolean;
};

export default function GlassCard({ children, style, blurIntensity = 60, noPadding }: Props) {
  const { isDark } = useTheme();
  const glassStyle = isDark ? Glass.dark : Glass.light;

  return (
    <View style={[Glass.shared, glassStyle, style]}>
      <BlurView intensity={blurIntensity} tint={isDark ? 'dark' : 'light'} style={[StyleSheet.absoluteFill, { borderRadius: BorderRadius.lg }]} />
      <View style={[styles.content, noPadding && { padding: 0 }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    position: 'relative',
    zIndex: 2,
  },
});
