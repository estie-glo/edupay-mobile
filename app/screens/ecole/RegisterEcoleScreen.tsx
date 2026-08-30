import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, CheckSquare, School, Square } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { register } from '../../../services/api';

// Téléphone camerounais (mobile ou fixe) sans indicatif, selon RegisterEcolController
const TELEPHONE_REGEX = /^[236]\d{8}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/;

export default function RegisterEcoleScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [ville, setVille] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cguAccepted, setCguAccepted] = useState(false);

  const handleRegister = async () => {
    if (!prenom || !nom || !telephone || !ville || !email) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (!TELEPHONE_REGEX.test(telephone)) {
      Alert.alert('Erreur', 'Numéro invalide. Format attendu : 9 chiffres, sans indicatif');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 8 || !PASSWORD_REGEX.test(password)) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 chiffre et 1 caractère spécial');
      return;
    }
    if (!cguAccepted) {
      Alert.alert('Erreur', "Vous devez accepter les conditions d'utilisation");
      return;
    }
    setLoading(true);
    try {
      const response = await register({
        profil: 'ecole',
        prenom,
        nom,
        email,
        telephone,
        ville,
        cgu_accepted: cguAccepted,
        password,
        password_confirmation: confirmPassword,
      });
      if (response.token) {
        await signIn(response.token, response.user);
        router.push('/screens/ecole/OtpEcoleScreen');
      }
    } catch (error: any) {
      Alert.alert('Erreur inscription', error.response?.data?.message || 'Une erreur est survenue');
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
          <School size={18} color="#FFFFFF" />
          <Text style={styles.titre}>Inscrire mon établissement</Text>
        </View>
        <Text style={styles.sousTitre}>Vous pourrez compléter les informations de l'établissement à l'étape suivante</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.sec}>Responsable de l'inscription</Text>
        <Text style={styles.lbl}>Prénom *</Text>
        <TextInput style={styles.input} placeholder="ex : Steve" placeholderTextColor="#AAAAAA" value={prenom} onChangeText={setPrenom} />
        <Text style={styles.lbl}>Nom *</Text>
        <TextInput style={styles.input} placeholder="ex : MEKONTSO" placeholderTextColor="#AAAAAA" value={nom} onChangeText={setNom} />
        <Text style={styles.lbl}>Téléphone professionnel *</Text>
        <TextInput style={styles.input} placeholder="6XXXXXXXX (sans indicatif)" placeholderTextColor="#AAAAAA" value={telephone} onChangeText={(t) => setTelephone(t.replace(/\D/g, '').slice(0, 9))} keyboardType="phone-pad" maxLength={9} />
        <Text style={styles.lbl}>Ville *</Text>
        <TextInput style={styles.input} placeholder="ex : Yaoundé" placeholderTextColor="#AAAAAA" value={ville} onChangeText={setVille} />
        <Text style={styles.lbl}>Email professionnel *</Text>
        <TextInput style={styles.input} placeholder="directeur@ecole.cm" placeholderTextColor="#AAAAAA" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Text style={styles.lbl}>Mot de passe *</Text>
        <TextInput style={styles.input} placeholder="Min. 8 car., 1 majuscule, 1 chiffre, 1 spécial" placeholderTextColor="#AAAAAA" value={password} onChangeText={setPassword} secureTextEntry={true} />
        <Text style={styles.lbl}>Confirmer mot de passe *</Text>
        <TextInput style={styles.input} placeholder="Répétez" placeholderTextColor="#AAAAAA" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={true} />

        <TouchableOpacity style={styles.cguRow} onPress={() => setCguAccepted(!cguAccepted)}>
          {cguAccepted ? <CheckSquare size={18} color="#E8A020" /> : <Square size={18} color="#AAAAAA" />}
          <Text style={styles.cguTxt}>J'accepte les conditions d'utilisation d'EduPay *</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btnSuivant, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnSuivantTxt}>Continuer →</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 16 }} onPress={() => router.push('/screens/ecole/LoginEcoleScreen')}>
          <Text style={styles.deja}>Déjà inscrit ? <Text style={styles.dejaLnk}>Se connecter</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  titreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  titre: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  sousTitre: { fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 16 },
  content: { flex: 1, padding: 16 },
  sec: { fontSize: 10, fontWeight: '700', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, marginTop: 8 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  cguRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  cguTxt: { flex: 1, fontSize: 12, color: '#555555', lineHeight: 16 },
  btnSuivant: { backgroundColor: '#E8A020', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 24, width: '100%' },
  btnSuivantTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  deja: { textAlign: 'center', fontSize: 13, color: '#888888' },
  dejaLnk: { color: '#E8A020', fontWeight: '700' },
});
