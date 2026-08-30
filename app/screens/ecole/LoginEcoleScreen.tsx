import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, School, Users } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { login } from '../../../services/api';

const ROLES = ['Directeur', 'Comptable', 'Caissier'];

export default function LoginEcoleScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [role, setRole] = useState(ROLES[0]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez renseigner votre email et votre mot de passe');
      return;
    }
    setLoading(true);
    try {
      const response = await login(email, password);
      await signIn(response.token, response.user);
      router.replace('/screens/ecole/BackOfficeScreen');
    } catch (error: any) {
      Alert.alert('Erreur de connexion', error.response?.data?.message || 'Identifiants incorrects');
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
        <Text style={styles.titre}>Connexion Établissement</Text>
        <View style={styles.sousTitreRow}>
          <School size={13} color="rgba(255,255,255,0.6)" />
          <Text style={styles.sousTitre}>Back-office EduPay</Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.roleBox}>
          <Text style={styles.roleTxt}>Connectez-vous en tant que :</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity key={r} style={[styles.roleBtn, role === r && styles.roleBtnActive]} onPress={() => setRole(r)}>
                <Text style={role === r ? styles.roleBtnTxt : styles.roleBtnTxtInactive}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.lbl}>Email professionnel</Text>
        <TextInput
          style={styles.input}
          placeholder="directeur@ecole.cm"
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
          <Text style={styles.oublieTxt}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btnConnexion, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnTxt}>Se connecter</Text>}
        </TouchableOpacity>

        <View style={styles.sep}>
          <View style={styles.ligne} />
          <Text style={styles.ou}>ou</Text>
          <View style={styles.ligne} />
        </View>

        <TouchableOpacity
          style={styles.inscriptionBox}
          onPress={() => router.push('/screens/ecole/RegisterEcoleScreen')}
        >
          <Text style={styles.inscriptionTxt}>
            Nouvel établissement ?{' '}
            <Text style={styles.inscriptionLnk}>S'inscrire sur EduPay</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.parentBox}
          onPress={() => router.push('/screens/parent/LoginParentScreen')}
        >
          <Users size={14} color="#085041" />
          <Text style={styles.parentTxt}>
            Vous êtes un parent ?{' '}
            <Text style={styles.parentLnk}>Espace parent</Text>
          </Text>
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
  sousTitreRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sousTitre: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  form: { flex: 1, padding: 20 },
  roleBox: { backgroundColor: '#F0F4F8', borderRadius: 12, padding: 12, marginBottom: 16 },
  roleTxt: { fontSize: 11, color: '#666666', marginBottom: 8, fontWeight: '600' },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleBtn: { flex: 1, padding: 8, borderRadius: 8, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', backgroundColor: '#FFFFFF' },
  roleBtnActive: { borderColor: '#E8A020', backgroundColor: '#FEF3DC' },
  roleBtnTxt: { fontSize: 11, fontWeight: '700', color: '#8B5E10' },
  roleBtnTxtInactive: { fontSize: 11, fontWeight: '600', color: '#888888' },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  oublie: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 4 },
  oublieTxt: { color: '#0D9E75', fontSize: 12, fontWeight: '600' },
  btnConnexion: { backgroundColor: '#E8A020', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  sep: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  ligne: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  ou: { color: '#AAAAAA', fontSize: 12 },
  inscriptionBox: { backgroundColor: '#FEF3DC', borderRadius: 10, padding: 12, marginBottom: 10 },
  inscriptionTxt: { fontSize: 12, color: '#8B5E10', textAlign: 'center' },
  inscriptionLnk: { fontWeight: '700', color: '#E8A020' },
  parentBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#E0F5EE', borderRadius: 10, padding: 12 },
  parentTxt: { fontSize: 12, color: '#085041', textAlign: 'center' },
  parentLnk: { fontWeight: '700', color: '#0D9E75' },
});
