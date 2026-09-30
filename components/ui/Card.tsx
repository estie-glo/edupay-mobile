import { ReactNode } from 'react';
import { Platform, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { usePressScale } from '../../hooks/use-press-scale';

// Remplace les cards à bordure plate (borderWidth:1, #E2E8F0) par une ombre
// douce teintée navy, dans l'esprit des box-shadow colorées de
// buttons-enhanced.css côté web (rgba(13,158,117,.18) etc.) — l'équivalent
// RN cross-plateforme sans nouvelle dépendance native (shadow* + elevation).
type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: string;
  onPress?: () => void;
};

export default function Card({ children, style, accent, onPress }: Props) {
  const { style: pressStyle, onPressIn, onPressOut } = usePressScale();

  const cardStyle = [styles.card, accent && { borderTopColor: accent, borderTopWidth: 3 }, style];

  if (!onPress) {
    return <View style={cardStyle}>{children}</View>;
  }

  return (
    <Animated.View style={pressStyle}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={cardStyle}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(11,37,69,0.08)' } as any,
      default: {
        shadowColor: '#0B2545',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      },
    }),
  },
});
