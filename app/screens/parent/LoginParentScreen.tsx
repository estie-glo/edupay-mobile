import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, MessageSquareText, School } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { login, resendOtp } from '../../../services/api';

export default function LoginParentScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSendOtp = async () => {
    if (!telephone) {
      Alert.alert('Erreur', 'Veuillez renseigner votre numéro de téléphone');
      return;
    }
    setLoading(true);
    try {
      // Pas de route dédiée "login par OTP" côté backend : resendOtp() sert aussi à envoyer le 1er code
      await resendOtp(telephone);
      router.push({ pathname: '/screens/parent/OtpParentScreen', params: { telephone } });
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible d\'envoyer le code OTP');
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
        <Text style={styles.titre}>Connexion Parent</Text>
        <Text style={styles.sousTitre}>Bienvenue sur EduPay</Text>
      </View>
      <View style={styles.form}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === 'password' && styles.tabActive]}
            onPress={() => setMode('password')}
          >
            <Text style={[styles.tabTxt, mode === 'password' && styles.tabTxtActive]}>Mot de passe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'otp' && styles.tabActive]}
            onPress={() => setMode('otp')}
          >
            <Text style={[styles.tabTxt, mode === 'otp' && styles.tabTxtActive]}>Code OTP SMS</Text>
          </TouchableOpacity>
        </View>

        {mode === 'password' ? (
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
            <Text style={styles.lbl}>Numéro de téléphone</Text>
            <View style={styles.otpRow}>
              <MessageSquareText size={18} color="#0D9E75" />
              <TextInput
                style={styles.otpInput}
                placeholder="6XX XXX XXX"
                placeholderTextColor="#AAAAAA"
                value={telephone}
                onChangeText={setTelephone}
                keyboardType="phone-pad"
              />
            </View>
            <TouchableOpacity
              style={[styles.btnConnexion, loading && { opacity: 0.7 }]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnTxt}>Recevoir le code</Text>}
            </TouchableOpacity>
          </>
        )}

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
  tabs: { flexDirection: 'row', backgroundColor: '#F0F2F5', borderRadius: 10, padding: 4, marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  tabTxt: { fontSize: 12, fontWeight: '600', color: '#888888' },
  tabTxtActive: { color: '#1A1A2E' },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  otpRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, gap: 10 },
  otpInput: { flex: 1, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
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
