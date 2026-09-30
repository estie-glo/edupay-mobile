import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { usePressScale } from '../../hooks/use-press-scale';

// Bouton principal en dégradé teal, avec léger retour tactile animé —
// équivalent mobile de .hbtn-main:hover (ombre + translateY) côté web,
// adapté au tactile (scale au press plutôt qu'au survol, qui n'existe pas).
type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  variant?: 'primary' | 'outline';
  style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({ title, onPress, loading, disabled, icon, variant = 'primary', style }: Props) {
  const { style: pressStyle, onPressIn, onPressOut } = usePressScale();
  const isDisabled = !!(disabled || loading);

  if (variant === 'outline') {
    return (
      <Animated.View style={pressStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={isDisabled}
          style={[styles.outline, isDisabled && styles.disabled, style]}
        >
          {loading ? <ActivityIndicator color="#0D9E75" /> : (
            <>
              {icon}
              <Text style={styles.outlineTxt}>{title}</Text>
            </>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={pressStyle}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} disabled={isDisabled}>
        <LinearGradient
          colors={isDisabled ? ['#9FE1CB', '#9FE1CB'] : ['#0FAF83', '#0A8562']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.primary, style]}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : (
            <>
              {icon}
              <Text style={styles.primaryTxt}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 999,
    shadowColor: '#0D9E75',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  outline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#0D9E75',
    backgroundColor: '#FFFFFF',
  },
  outlineTxt: { color: '#0D9E75', fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
