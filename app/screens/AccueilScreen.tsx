import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AccueilScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🏦</Text>
        <Text style={styles.titre}>EduPay</Text>
        <Text style={styles.sousTitre}>Cameroun</Text>
        <Text style={styles.description}>
          Payez les frais scolaires de vos enfants{'\n'}
          en toute simplicité et sécurité
        </Text>
      </View>

      {/* Boutons */}
      <View style={styles.boutons}>
        <TouchableOpacity
          style={styles.btnConnexion}
          onPress={() => router.push('/screens/LoginScreen')}
        >
          <Text style={styles.btnConnexionTexte}>Se connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnInscription}
          onPress={() => router.push('/screens/RegisterScreen')}
        >
          <Text style={styles.btnInscriptionTexte}>Créer un compte</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        MTN MoMo · Orange Money · Carte bancaire
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    fontSize: 70,
    marginBottom: 10,
  },
  titre: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#0D9E75',
  },
  sousTitre: {
    fontSize: 16,
    color: '#1F4E79',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  boutons: {
    width: '100%',
    gap: 14,
  },
  btnConnexion: {
    backgroundColor: '#0D9E75',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnConnexionTexte: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnInscription: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0D9E75',
  },
  btnInscriptionTexte: {
    color: '#0D9E75',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});