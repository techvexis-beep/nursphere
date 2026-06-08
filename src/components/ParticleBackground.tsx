import { StyleSheet, Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients } from '../constants/theme';

const { width: W, height: H } = Dimensions.get('window');

const BLOBS = [
  { size: 200, x: W * 0.05, y: H * 0.05 },
  { size: 250, x: W * 0.55, y: H * 0.02 },
  { size: 180, x: W * 0.25, y: H * 0.45 },
  { size: 220, x: W * 0.65, y: H * 0.65 },
  { size: 160, x: W * -0.05, y: H * 0.75 },
];

export default function ParticleBackground() {
  return (
    <LinearGradient colors={[...Gradients.hero]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      {BLOBS.map((b, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: b.size,
            height: b.size,
            borderRadius: b.size / 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            left: b.x,
            top: b.y,
          }}
        />
      ))}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
});
