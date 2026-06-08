import { useCallback, useRef } from 'react';
import { StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Shadow, BorderRadius, Spacing } from '../constants/theme';

interface TiltCardProps {
  children: React.ReactNode;
  gradientColors?: readonly [string, string];
  style?: any;
  onPress?: () => void;
}

export default function TiltCard({ children, gradientColors, style, onPress }: TiltCardProps) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const elevation = useSharedValue(4);
  const cardWidth = useRef(0);
  const cardHeight = useRef(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    cardWidth.current = e.nativeEvent.layout.width;
    cardHeight.current = e.nativeEvent.layout.height;
  }, []);

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      const halfW = cardWidth.current / 2;
      const halfH = cardHeight.current / 2;
      const tiltX = interpolate(e.y - halfH, [-halfH, halfH], [10, -10]);
      const tiltY = interpolate(e.x - halfW, [-halfW, halfW], [-10, 10]);
      rotateX.value = withSpring(tiltX, { damping: 15, stiffness: 200 });
      rotateY.value = withSpring(tiltY, { damping: 15, stiffness: 200 });
      scale.value = withSpring(0.97);
      elevation.value = withTiming(8);
    })
    .onUpdate((e) => {
      const halfW = cardWidth.current / 2;
      const halfH = cardHeight.current / 2;
      const tiltX = interpolate(e.y - halfH, [-halfH, halfH], [10, -10]);
      const tiltY = interpolate(e.x - halfW, [-halfW, halfW], [-10, 10]);
      rotateX.value = tiltX;
      rotateY.value = tiltY;
    })
    .onFinalize(() => {
      rotateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      rotateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      scale.value = withSpring(1);
      elevation.value = withTiming(4);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
    ],
    shadowOpacity: interpolate(elevation.value, [4, 8], [0.1, 0.2]),
    elevation: elevation.value,
  }));

  const content = (
    <Animated.View onLayout={onLayout} style={[styles.card, Shadow.lg, animatedStyle, style]}>
      {gradientColors ? (
        <LinearGradient colors={[...gradientColors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          {children}
        </LinearGradient>
      ) : (
        children
      )}
    </Animated.View>
  );

  if (onPress) {
    const tapGesture = Gesture.Tap().onEnd(() => onPress?.());
    const composed = Gesture.Simultaneous(gesture, tapGesture);
    return <GestureDetector gesture={composed}>{content}</GestureDetector>;
  }

  return <GestureDetector gesture={gesture}>{content}</GestureDetector>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  gradient: {
    padding: Spacing.lg,
  },
});
