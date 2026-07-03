import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginParentScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titre}>Connexion Parent</Text>
        <Text style={styles.sousTitre}>Bienvenue sur EduPay</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.lbl}>Email ou telephone</Text>
        <TextInput
          style={styles.input}
          placeholder="exemple@email.com ou 6XX XXX XXX"
          placeholderTextColor="#AAAAAA"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
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
          <Text style={styles.oublieTxt}>Mot de passe oublie ?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnConnexion}
          onPress={() => router.push('/screens/parent/OtpParentScreen')}
        >
          <Text style={styles.btnTxt}>Se connecter</Text>
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
          <Text style={styles.etablissementTxt}>Etablissement ? Accedez au back-office ici</Text>
        </TouchableOpacity>
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
  form: { flex: 1, padding: 20 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  oublie: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 4 },
  oublieTxt: { color: '#0D9E75', fontSize: 12, fontWeight: '600' },
  btnConnexion: { backgroundColor: '#0D9E75', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  sep: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  ligne: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  ou: { color: '#AAAAAA', fontSize: 12 },
  inscriptionTxt: { textAlign: 'center', fontSize: 13, color: '#888888' },
  inscriptionLnk: { color: '#0D9E75', fontWeight: '700' },
  etablissementBox: { backgroundColor: '#E0F5EE', borderRadius: 10, padding: 12, marginTop: 20 },
  etablissementTxt: { fontSize: 12, color: '#085041', textAlign: 'center', fontWeight: '600' },
});
