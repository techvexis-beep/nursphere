import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export type ToastType = 'success' | 'error' | 'info';

type Props = {
  visible: boolean;
  message: string;
  type?: ToastType;
  onDismiss: () => void;
  duration?: number;
};

const ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

export default function Toast({ visible, message, type = 'info', onDismiss, duration = 2500 }: Props) {
  const { colors } = useTheme();
  const translateY = useSharedValue(-100);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 }, () => {
          onDismiss();
        });
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const toastColors = {
    success: colors.success,
    error: colors.error,
    info: colors.primary,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderLeftColor: toastColors[type] },
        animatedStyle,
      ]}
    >
      <Ionicons name={ICONS[type]} size={20} color={toastColors[type]} />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      <TouchableOpacity onPress={onDismiss}>
        <Ionicons name="close" size={18} color={colors.textLight} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    zIndex: 9999,
    ...Shadow.lg,
  },
  message: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    marginLeft: Spacing.sm,
  },
});
