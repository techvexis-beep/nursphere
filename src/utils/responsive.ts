import { Dimensions, Platform, ScaledSize } from 'react-native';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

export function screenWidth(): number {
  return Dimensions.get('window').width;
}

export function screenHeight(): number {
  return Dimensions.get('window').height;
}

export function scale(size: number): number {
  return (WINDOW_WIDTH / BASE_WIDTH) * size;
}

export function verticalScale(size: number): number {
  return (WINDOW_HEIGHT / BASE_HEIGHT) * size;
}

export function moderateScale(size: number, factor = 0.5): number {
  return size + (scale(size) - size) * factor;
}

export function responsiveFontSize(size: number, factor = 0.4): number {
  return moderateScale(size, factor);
}

let _isTablet: boolean | null = null;
export function isTablet(): boolean {
  if (_isTablet !== null) return _isTablet;
  const dim = Dimensions.get('window');
  const aspectRatio = dim.height / dim.width;
  _isTablet = (dim.width >= 768 || aspectRatio < 1.4);
  return _isTablet;
}

let _isSmallDevice: boolean | null = null;
export function isSmallDevice(): boolean {
  if (_isSmallDevice !== null) return _isSmallDevice;
  _isSmallDevice = WINDOW_WIDTH < 360;
  return _isSmallDevice;
}

export function isLandscape(): boolean {
  const dim = Dimensions.get('window');
  return dim.width > dim.height;
}

export function getDeviceType(): 'phone' | 'tablet' | 'large-tablet' {
  const w = Dimensions.get('window').width;
  if (w >= 1024) return 'large-tablet';
  if (w >= 768) return 'tablet';
  return 'phone';
}

export function getOrientation(): 'portrait' | 'landscape' {
  const dim = Dimensions.get('window');
  return dim.width > dim.height ? 'landscape' : 'portrait';
}

export function tabBarWidth(): number {
  const w = Dimensions.get('window').width;
  if (w >= 1024) return Math.min(w * 0.7, 800);
  if (w >= 768) return w * 0.85;
  return w - 32;
}

export function gridColumns(numItems: number): number {
  const w = Dimensions.get('window').width;
  if (w >= 1024) return Math.min(numItems, 4);
  if (w >= 600) return Math.min(numItems, 3);
  if (w >= 400) return Math.min(numItems, 2);
  return 1;
}

export function contentMaxWidth(): number {
  const w = Dimensions.get('window').width;
  if (w >= 1200) return 1100;
  if (w >= 1024) return 900;
  if (w >= 768) return 720;
  return w - 32;
}

export function handleOrientationChange(handler: (dims: { width: number; height: number }) => void) {
  const subscription = Dimensions.addEventListener('change', ({ window }) => {
    _isTablet = null;
    _isSmallDevice = null;
    handler(window);
  });
  return subscription;
}
