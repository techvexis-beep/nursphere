import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import {
  isTablet, isSmallDevice, getDeviceType, getOrientation,
  scale, verticalScale, moderateScale, responsiveFontSize,
  screenWidth, screenHeight,
} from '../utils/responsive';

type LayoutMode = 'mobile' | 'tablet' | 'desktop';

export type ResponsiveConfig = {
  isTablet: boolean;
  isSmallDevice: boolean;
  isLandscape: boolean;
  deviceType: 'phone' | 'tablet' | 'large-tablet';
  orientation: 'portrait' | 'landscape';
  layoutMode: LayoutMode;
  width: number;
  height: number;
  scale: (size: number) => number;
  verticalScale: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  responsiveFontSize: (size: number, factor?: number) => number;
  gridColumns: (max?: number) => number;
  contentWidth: () => number;
};

export function useResponsive(): ResponsiveConfig {
  const [dims, setDims] = useState({ width: screenWidth(), height: screenHeight() });

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setDims({ width: window.width, height: window.height });
    });
    return () => sub.remove();
  }, []);

  const tablet = dims.width >= 768;
  const small = dims.width < 360;
  const landscape = dims.width > dims.height;
  const device = dims.width >= 1024 ? 'large-tablet' as const : dims.width >= 768 ? 'tablet' as const : 'phone' as const;
  const orientation = landscape ? 'landscape' as const : 'portrait' as const;
  const layoutMode: LayoutMode = dims.width >= 1024 ? 'desktop' : dims.width >= 768 ? 'tablet' : 'mobile';

  function gridColumns(max = 4): number {
    if (dims.width >= 1024) return Math.min(max, 4);
    if (dims.width >= 600) return Math.min(max, 3);
    if (dims.width >= 400) return Math.min(max, 2);
    return 1;
  }

  function contentWidth(): number {
    const w = dims.width;
    if (w >= 1200) return 1100;
    if (w >= 1024) return 900;
    if (w >= 768) return 720;
    return w - 32;
  }

  return {
    isTablet: tablet,
    isSmallDevice: small,
    isLandscape: landscape,
    deviceType: device,
    orientation,
    layoutMode,
    width: dims.width,
    height: dims.height,
    scale,
    verticalScale,
    moderateScale,
    responsiveFontSize,
    gridColumns,
    contentWidth,
  };
}
