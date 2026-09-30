import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Forme floue animée en arrière-plan (dérive lente + respiration d'échelle),
// dans l'esprit des landing pages modernes avec fond "vivant" plutôt que
// plat. Purement décoratif : pointerEvents désactivés, ne capte aucun tap.
type Props = {
  size: number;
  color: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  duration?: number;
  driftY?: number;
};

export default function FloatingBlob({ size, color, top, bottom, left, right, duration = 6000, driftY = 16 }: Props) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-driftY, { duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blob,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color, top, bottom, left, right },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute', opacity: 0.35 },
});
