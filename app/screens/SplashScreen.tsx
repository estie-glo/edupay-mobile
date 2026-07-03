import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Après 3 secondes on va vers l'accueil
    setTimeout(() => {
      router.replace('/screens/commun/AccueilInviteScreen');
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🏦</Text>
        <Text style={styles.titre}>EduPay</Text>
        <Text style={styles.sousTitre}>Cameroun</Text>
      </View>

      {/* Slogan */}
      <Text style={styles.slogan}>
        Payez les frais scolaires{'\n'}en toute simplicité
      </Text>

      {/* Chargement */}
      <Text style={styles.chargement}>Chargement...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D9E75',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 10,
  },
  titre: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  sousTitre: {
    fontSize: 20,
    color: '#FFFFFF',
    opacity: 0.8,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  slogan: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
  },
  chargement: {
    position: 'absolute',
    bottom: 50,
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 14,
  },
});