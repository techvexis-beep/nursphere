import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, Shadow, NigeriaColors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useResponsiveCtx } from '../context/ResponsiveContext';

type GlowVariant = 'default' | 'green' | 'subtle';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: GlowVariant;
  blurIntensity?: number;
  noPadding?: boolean;
  glowIntensity?: 'low' | 'medium' | 'high';
};

const GREEN_RGB = '0,135,81';

function glowBoxShadow(color: string, opacity: number, radius: number): string {
  return `0 4px ${radius}px rgba(${color},${opacity})`;
}

export default function GlowGlass({
  children, style, variant = 'default',
  blurIntensity: _blurIntensity, noPadding, glowIntensity = 'medium',
}: Props) {
  const { isDark } = useTheme();
  const resp = useResponsiveCtx();

  const glowShadows: Record<GlowVariant, ViewStyle> = {
    green: {
      boxShadow: glowBoxShadow(GREEN_RGB, glowIntensity === 'high' ? 0.4 : glowIntensity === 'medium' ? 0.25 : 0.15, glowIntensity === 'high' ? 32 : glowIntensity === 'medium' ? 20 : 12),
      elevation: glowIntensity === 'high' ? 16 : glowIntensity === 'medium' ? 10 : 6,
    },
    default: {
      boxShadow: glowBoxShadow(GREEN_RGB, glowIntensity === 'high' ? 0.3 : 0.15, glowIntensity === 'high' ? 28 : 16),
      elevation: glowIntensity === 'high' ? 14 : 8,
    },
    subtle: {
      boxShadow: glowBoxShadow('0,0,0', isDark ? 0.3 : 0.08, 12),
      elevation: 4,
    },
  };

  const bgColor = isDark
    ? variant === 'green'
      ? '#0f1d14'
      : '#151b2e'
    : variant === 'green'
      ? '#f0faf4'
      : '#ffffff';

  const borderColor = variant === 'green'
    ? isDark ? '#1a3d28' : '#d4ede0'
    : isDark ? '#2a2f45' : '#e8ecf4';

  const shineColors = variant === 'green'
    ? ['rgba(0, 135, 81, 0.04)', 'rgba(255,255,255,0.06)', 'rgba(0, 135, 81, 0.02)'] as const
    : ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.06)'] as const;

  return (
    <View
      style={[
        styles.container,
        glowShadows[variant],
        {
          borderColor,
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={shineColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.content, noPadding && { padding: 0 }, !noPadding && { padding: resp.moderateScale(16) }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadow.md,
  },
  content: {
    position: 'relative',
    zIndex: 2,
  },
});
