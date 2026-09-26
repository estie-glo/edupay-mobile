import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, KeyRound, School } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { envoyerOtp, login, verifierOtp } from '../../../services/api';

export default function LoginParentScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [modeOtp, setModeOtp] = useState(false);
  const [codeEnvoye, setCodeEnvoye] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifiant || !password) {
      Alert.alert('Erreur', 'Veuillez renseigner votre email/téléphone et votre mot de passe');
      return;
    }
    setLoading(true);
    try {
      const response = await login(identifiant, password);
      await signIn(response.token, response.user);
      router.replace('/screens/parent/DashboardScreen');
    } catch (error: any) {
      Alert.alert('Erreur de connexion', error.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  const handleEnvoyerOtp = async () => {
    if (!identifiant) {
      Alert.alert('Erreur', 'Veuillez renseigner votre email');
      return;
    }
    setOtpLoading(true);
    try {
      await envoyerOtp(identifiant);
      setCodeEnvoye(true);
      Alert.alert('Code envoyé', 'Vérifiez votre boîte mail.');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || "Impossible d'envoyer le code");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifierOtp = async () => {
    if (!otpCode) {
      Alert.alert('Erreur', 'Veuillez saisir le code reçu par email');
      return;
    }
    setOtpLoading(true);
    try {
      const response = await verifierOtp(identifiant, otpCode);
      await signIn(response.token, response.user);
      router.replace('/screens/parent/DashboardScreen');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Code incorrect ou expiré');
    } finally {
      setOtpLoading(false);
    }
  };

  const basculerMode = () => {
    setModeOtp((v) => !v);
    setCodeEnvoye(false);
    setOtpCode('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.titre}>Connexion Parent</Text>
        <Text style={styles.sousTitre}>Bienvenue sur EduPay</Text>
      </View>
      <View style={styles.form}>
        {!modeOtp ? (
          <>
            <Text style={styles.lbl}>Email ou téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="exemple@email.com ou 6XX XXX XXX"
              placeholderTextColor="#AAAAAA"
              value={identifiant}
              onChangeText={setIdentifiant}
              autoCapitalize="none"
            />
            <Text style={styles.lbl}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre mot de passe"
              placeholderTextColor="#AAAAAA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
            <TouchableOpacity style={styles.oublie}>
              <Text style={styles.oublieTxt}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnConnexion, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnTxt}>Se connecter</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.lbl}>Email</Text>
            <TextInput
              style={[styles.input, codeEnvoye && styles.inputDisabled]}
              placeholder="exemple@email.com"
              placeholderTextColor="#AAAAAA"
              value={identifiant}
              onChangeText={setIdentifiant}
              autoCapitalize="none"
              editable={!codeEnvoye}
            />
            {!codeEnvoye ? (
              <TouchableOpacity
                style={[styles.btnConnexion, otpLoading && { opacity: 0.7 }]}
                onPress={handleEnvoyerOtp}
                disabled={otpLoading}
              >
                {otpLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnTxt}>Recevoir un code par email</Text>}
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.lbl}>Code reçu par email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123456"
                  placeholderTextColor="#AAAAAA"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  style={[styles.btnConnexion, otpLoading && { opacity: 0.7 }]}
                  onPress={handleVerifierOtp}
                  disabled={otpLoading}
                >
                  {otpLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnTxt}>Valider le code</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.oublie} onPress={handleEnvoyerOtp} disabled={otpLoading}>
                  <Text style={styles.oublieTxt}>Renvoyer le code</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        <TouchableOpacity style={styles.otpToggle} onPress={basculerMode}>
          <KeyRound size={14} color="#0D9E75" />
          <Text style={styles.otpToggleTxt}>{modeOtp ? 'Se connecter avec un mot de passe' : 'Se connecter par code (email)'}</Text>
        </TouchableOpacity>

        <View style={styles.sep}>
          <View style={styles.ligne} />
          <Text style={styles.ou}>ou</Text>
          <View style={styles.ligne} />
        </View>
        <TouchableOpacity onPress={() => router.push('/screens/commun/ChoixProfilScreen')}>
          <Text style={styles.inscriptionTxt}>
            Pas encore de compte ? <Text style={styles.inscriptionLnk}>S'inscrire</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.etablissementBox} onPress={() => router.push('/screens/ecole/LoginEcoleScreen')}>
          <School size={16} color="#085041" />
          <Text style={styles.etablissementTxt}>Établissement ? Accédez au back-office ici</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  titre: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  sousTitre: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  form: { flex: 1, padding: 20 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  inputDisabled: { backgroundColor: '#F0F2F5', color: '#888888' },
  otpToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  otpToggleTxt: { color: '#0D9E75', fontSize: 12, fontWeight: '700' },
  oublie: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 4 },
  oublieTxt: { color: '#0D9E75', fontSize: 12, fontWeight: '600' },
  btnConnexion: { backgroundColor: '#0D9E75', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  sep: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  ligne: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  ou: { color: '#AAAAAA', fontSize: 12 },
  inscriptionTxt: { textAlign: 'center', fontSize: 13, color: '#888888' },
  inscriptionLnk: { color: '#0D9E75', fontWeight: '700' },
  etablissementBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#E0F5EE', borderRadius: 10, padding: 12, marginTop: 20 },
  etablissementTxt: { fontSize: 12, color: '#085041', textAlign: 'center', fontWeight: '600' },
});
