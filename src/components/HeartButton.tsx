import { TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedStyle, withSequence } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  liked: boolean;
  onToggle: () => void;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  disabled?: boolean;
};

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

export default function HeartButton({
  liked,
  onToggle,
  size = 18,
  activeColor = '#EF4444',
  inactiveColor = '#94A3B8',
  disabled = false,
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.3, { damping: 3, stiffness: 200 }),
      withSpring(1)
    );
    onToggle();
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled} activeOpacity={0.7}>
      <AnimatedIcon
        name={liked ? 'heart' : 'heart-outline'}
        size={size}
        color={liked ? activeColor : inactiveColor}
        style={animatedStyle}
      />
    </TouchableOpacity>
  );
}
