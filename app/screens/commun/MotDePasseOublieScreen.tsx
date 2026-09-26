import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, KeyRound } from 'lucide-react-native';
import { forgotPassword, resetPassword } from '../../../services/api';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/;

export default function MotDePasseOublieScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [codeEnvoye, setCodeEnvoye] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnvoyerCode = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez renseigner votre email');
      return;
    }
    setLoading(true);
    try {
      const reponse = await forgotPassword(email);
      setCodeEnvoye(true);
      Alert.alert('Code envoyé', reponse.message || 'Vérifiez votre boîte mail.');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || "Impossible d'envoyer le code");
    } finally {
      setLoading(false);
    }
  };

  const handleReinitialiser = async () => {
    if (!code || password.length < 8 || !PASSWORD_REGEX.test(password)) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 chiffre et 1 caractère spécial');
      return;
    }
    if (password !== passwordConfirmation) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email, code, password, password_confirmation: passwordConfirmation });
      Alert.alert('Mot de passe réinitialisé', 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const messagesValidation = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join('\n')
        : null;
      Alert.alert('Erreur', messagesValidation || error.response?.data?.message || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.titreRow}>
          <KeyRound size={18} color="#FFFFFF" />
          <Text style={styles.titre}>Mot de passe oublié</Text>
        </View>
        <Text style={styles.sousTitre}>
          {codeEnvoye ? 'Saisissez le code reçu et votre nouveau mot de passe.' : 'Recevez un code de vérification par email.'}
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.lbl}>Email</Text>
        <TextInput
          style={[styles.input, codeEnvoye && styles.inputDisabled]}
          placeholder="exemple@email.com"
          placeholderTextColor="#AAAAAA"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!codeEnvoye}
        />

        {!codeEnvoye ? (
          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleEnvoyerCode} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnTxt}>Recevoir le code</Text>}
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.lbl}>Code reçu par email</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              placeholderTextColor="#AAAAAA"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />
            <Text style={styles.lbl}>Nouveau mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Min. 8 car., 1 majuscule, 1 chiffre, 1 spécial"
              placeholderTextColor="#AAAAAA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Text style={styles.lbl}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Répétez"
              placeholderTextColor="#AAAAAA"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              secureTextEntry
            />
            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleReinitialiser} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnTxt}>Réinitialiser le mot de passe</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.renvoi} onPress={handleEnvoyerCode} disabled={loading}>
              <Text style={styles.renvoiTxt}>Renvoyer le code</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  titreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  titre: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  sousTitre: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  form: { flex: 1, padding: 20 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  inputDisabled: { backgroundColor: '#F0F2F5', color: '#888888' },
  btn: { backgroundColor: '#0D9E75', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  renvoi: { alignSelf: 'center', marginTop: 16 },
  renvoiTxt: { color: '#0D9E75', fontSize: 12, fontWeight: '600' },
});
