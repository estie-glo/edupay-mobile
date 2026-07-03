import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.titre}>Connexion</Text>
        <Text style={styles.sousTitre}>Bienvenue sur EduPay 👋</Text>
      </View>

      {/* Formulaire */}
      <View style={styles.form}>

        <Text style={styles.label}>Email ou téléphone</Text>
        <TextInput
          style={styles.input}
          placeholder="exemple@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity>
          <Text style={styles.oublie}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        {/* Bouton connexion */}
        <TouchableOpacity
          style={styles.btnConnexion}
          onPress={() => router.push('/screens/OtpScreen')}
        >
          <Text style={styles.btnTexte}>Se connecter</Text>
        </TouchableOpacity>

        {/* Séparateur */}
        <View style={styles.separateur}>
          <View style={styles.ligne} />
          <Text style={styles.ou}>ou</Text>
          <View style={styles.ligne} />
        </View>

        {/* Pas de compte */}
        <TouchableOpacity
          onPress={() => router.push('/screens/RegisterScreen')}
        >
          <Text style={styles.inscription}>
            Pas de compte ?{' '}
            <Text style={styles.inscriptionLien}>S'inscrire</Text>
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  titre: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F4E79',
  },
  sousTitre: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 6,
  },
  form: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1e293b',
  },
  oublie: {
    color: '#0D9E75',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 6,
  },
  btnConnexion: {
    backgroundColor: '#0D9E75',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  btnTexte: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separateur: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  ligne: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  ou: {
    color: '#94a3b8',
    fontSize: 13,
  },
  inscription: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
  },
  inscriptionLien: {
    color: '#0D9E75',
    fontWeight: 'bold',
  },
});