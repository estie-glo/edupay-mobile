import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { resendOtp, verifyOtp } from '../../../services/api';

export default function OtpEcoleScreen() {
  const router = useRouter();
  const { user, signIn } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Erreur', 'Le code doit contenir 6 chiffres');
      return;
    }
    setLoading(true);
    try {
      const response = await verifyOtp(user?.telephone || '', otp);
      if (response.token) {
        await signIn(response.token, response.user);
      }
      router.replace('/screens/ecole/EcoleKycScreen');
    } catch (error: any) {
      Alert.alert('Code invalide', error.response?.data?.message || 'Code incorrect ou expiré');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp(user?.telephone || '');
      Alert.alert('Code envoyé', 'Un nouveau code vous a été envoyé par SMS');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de renvoyer le code');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.titre}>Vérification 2FA</Text>
        <Text style={styles.sousTitre}>Code envoyé au {user?.telephone || '+237 6XX XXX XXX'}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.iconeBox}>
          <ShieldCheck size={40} color="#E8A020" />
        </View>
        <Text style={styles.desc}>Code de vérification à 6 chiffres</Text>
        <Text style={styles.subdesc}>Valide pendant 10 minutes</Text>
        <TextInput
          style={styles.otpInput}
          placeholder="- - - - - -"
          placeholderTextColor="#AAAAAA"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />
        <TouchableOpacity style={[styles.btnVerifier, loading && { opacity: 0.7 }]} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnTxt}>Vérifier et continuer</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.renvoyerTxt}>
            Pas reçu ? <Text style={styles.renvoyerLnk}>Renvoyer</Text>
          </Text>
        </TouchableOpacity>
        <View style={styles.warnBox}>
          <Text style={styles.warnTxt}>Accès réservé aux personnels autorisés de l'établissement.</Text>
        </View>
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
  content: { flex: 1, padding: 24, alignItems: 'center' },
  iconeBox: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#FEF3DC', alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 16 },
  desc: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 6 },
  subdesc: { fontSize: 12, color: '#888888', marginBottom: 24 },
  otpInput: { width: '100%', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E8A020', borderRadius: 12, paddingVertical: 16, fontSize: 28, fontWeight: '700', color: '#1A1A2E', letterSpacing: 12, marginBottom: 24 },
  btnVerifier: { backgroundColor: '#E8A020', paddingVertical: 14, borderRadius: 12, alignItems: 'center', width: '100%', marginBottom: 16 },
  btnTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  renvoyerTxt: { fontSize: 13, color: '#888888', marginBottom: 24 },
  renvoyerLnk: { color: '#E8A020', fontWeight: '700' },
  warnBox: { backgroundColor: '#FEF3DC', borderRadius: 10, padding: 12, width: '100%' },
  warnTxt: { fontSize: 11, color: '#8B5E10', textAlign: 'center' },
});
