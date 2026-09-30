import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Retour tactile animé (légère compression au press) — équivalent mobile du
// hover/active des boutons web (buttons-enhanced.css : transform + shadow au
// survol). Partagé par Card et PrimaryButton.
export function usePressScale(to = 0.96) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = () => { scale.value = withSpring(to, { damping: 15, stiffness: 400 }); };
  const onPressOut = () => { scale.value = withSpring(1, { damping: 15, stiffness: 400 }); };
  return { style, onPressIn, onPressOut };
}
