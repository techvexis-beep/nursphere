export const Colors = {
  primary: '#0D9488',
  primaryLight: '#14B8A6',
  primaryDark: '#0F766E',
  secondary: '#6366F1',
  secondaryLight: '#818CF8',
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  background: '#F0F4F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#475569',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  white: '#FFFFFF',
  glassBg: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  glassShadow: 'rgba(0, 0, 0, 0.1)',
};

export const DarkColors: typeof Colors = {
  primary: '#14B8A6',
  primaryLight: '#2DD4BF',
  primaryDark: '#0D9488',
  secondary: '#818CF8',
  secondaryLight: '#A5B4FC',
  accent: '#FBBF24',
  accentLight: '#FCD34D',
  background: '#080C1A',
  surface: '#111627',
  surfaceAlt: '#0D1223',
  text: '#EDF2F7',
  textSecondary: '#94A3B8',
  textLight: '#64748B',
  border: '#1E2340',
  error: '#F87171',
  success: '#4ADE80',
  warning: '#FBBF24',
  white: '#FFFFFF',
  glassBg: 'rgba(17, 22, 39, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassShadow: 'rgba(0, 0, 0, 0.4)',
};

export const NigeriaColors = {
  green: '#008751',
  greenLight: '#00A859',
  greenDark: '#006B3F',
  white: '#FFFFFF',
};

export const Gradients = {
  primary: ['#0D9488', '#0F766E'] as const,
  secondary: ['#6366F1', '#4F46E5'] as const,
  hero: ['#0D9488', '#0891B2', '#6366F1'] as const,
  accent: ['#F59E0B', '#F97316'] as const,
  card1: ['#0D9488', '#14B8A6'] as const,
  card2: ['#6366F1', '#818CF8'] as const,
  card3: ['#F59E0B', '#F97316'] as const,
  glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.5)'] as const,
  ngFlag: ['#008751', '#FFFFFF', '#008751'] as const,
  ngGreen: ['#008751', '#00A859'] as const,
  darkGlass: ['rgba(17,22,39,0.9)', 'rgba(17,22,39,0.5)'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  title: 40,
  hero: 52,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const FontFamily = {
  display: 'Poppins_700Bold',
  displayExtra: 'Poppins_800ExtraBold',
  heading: 'Poppins_600SemiBold',
  body: 'Geist-Regular',
  bodyMedium: 'Geist-Medium',
  bodySemiBold: 'Geist-SemiBold',
  bodyBold: 'Geist-Bold',
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const Glass = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  dark: {
    backgroundColor: 'rgba(17, 22, 39, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
  },
  shared: {
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    overflow: 'hidden' as const,
  },
};
