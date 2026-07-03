import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function OtpParentScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titre}>Verification SMS</Text>
        <Text style={styles.sousTitre}>Code envoye au +237 6XX XXX XXX</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.icone}>📱</Text>
        <Text style={styles.desc}>Entrez le code OTP a 6 chiffres</Text>
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
        <TouchableOpacity
          style={styles.btnVerifier}
          onPress={() => router.push('/screens/parent/DashboardScreen')}
        >
          <Text style={styles.btnTxt}>Verifier le code</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.renvoyer}>
          <Text style={styles.renvoyerTxt}>
            Pas recu le code ? <Text style={styles.renvoyerLnk}>Renvoyer</Text>
          </Text>
        </TouchableOpacity>
        <View style={styles.warnBox}>
          <Text style={styles.warnTxt}>Ne partagez jamais ce code avec quelqu'un d'autre.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  backTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  titre: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  sousTitre: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  content: { flex: 1, padding: 24, alignItems: 'center' },
  icone: { fontSize: 56, marginTop: 24, marginBottom: 16 },
  desc: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 6 },
  subdesc: { fontSize: 12, color: '#888888', marginBottom: 24 },
  otpInput: { width: '100%', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#0D9E75', borderRadius: 12, paddingVertical: 16, fontSize: 28, fontWeight: '700', color: '#1A1A2E', letterSpacing: 12, marginBottom: 24 },
  btnVerifier: { backgroundColor: '#0D9E75', paddingVertical: 14, borderRadius: 12, alignItems: 'center', width: '100%', marginBottom: 16 },
  btnTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  renvoyer: { marginBottom: 24 },
  renvoyerTxt: { fontSize: 13, color: '#888888', textAlign: 'center' },
  renvoyerLnk: { color: '#0D9E75', fontWeight: '700' },
  warnBox: { backgroundColor: '#FEF3DC', borderRadius: 10, padding: 12, width: '100%' },
  warnTxt: { fontSize: 11, color: '#8B5E10', textAlign: 'center' },
});
