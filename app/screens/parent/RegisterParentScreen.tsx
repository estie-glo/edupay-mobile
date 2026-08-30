import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, BookOpen, CheckCircle2, CheckSquare, GraduationCap, Square, User } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { addApprenant, register, searchEtablissements } from '../../../services/api';

type Profil = 'parent' | 'eleve' | 'etudiant';

const PROFILS: { valeur: Profil; label: string; Icone: typeof User }[] = [
  { valeur: 'parent', label: 'Parent', Icone: User },
  { valeur: 'eleve', label: 'Élève', Icone: BookOpen },
  { valeur: 'etudiant', label: 'Étudiant', Icone: GraduationCap },
];

// Règles réelles du backend (RegisterParentController) : téléphone camerounais
// mobile sans indicatif, mot de passe avec majuscule + chiffre + caractère spécial.
const TELEPHONE_REGEX = /^6\d{8}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/;

export default function RegisterParentScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  // Le flux "parent" a une étape supplémentaire (rattacher un enfant) que
  // les profils élève/étudiant n'ont pas, puisqu'ils s'inscrivent pour eux-mêmes.
  const [profil, setProfil] = useState<Profil>('parent');
  const etapes = profil === 'parent' ? (['compte', 'apprenant', 'confirmation'] as const) : (['compte', 'confirmation'] as const);
  const [etapeIndex, setEtapeIndex] = useState(0);
  const etape = etapes[etapeIndex];

  const [loading, setLoading] = useState(false);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [ville, setVille] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cguAccepted, setCguAccepted] = useState(false);

  const [apprenantPrenom, setApprenantPrenom] = useState('');
  const [apprenantNom, setApprenantNom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [classe, setClasse] = useState('');
  const [codeEtablissement, setCodeEtablissement] = useState('');
  const [rechercheEcole, setRechercheEcole] = useState('');
  const [etablissementsTrouves, setEtablissementsTrouves] = useState<{ id: number; nom: string }[]>([]);
  const [etablissementChoisi, setEtablissementChoisi] = useState<{ id: number; nom: string } | null>(null);

  const handleRegister = async () => {
    if (!prenom || !nom || !telephone || !ville) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (!TELEPHONE_REGEX.test(telephone)) {
      Alert.alert('Erreur', 'Numéro invalide. Format attendu : 6XXXXXXXX (9 chiffres, mobile camerounais)');
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
        profil,
        nom,
        prenom,
        email: email || undefined,
        telephone,
        ville,
        cgu_accepted: cguAccepted,
        password,
        password_confirmation: confirmPassword,
      });
      if (response.token) {
        await signIn(response.token, response.user);
        setEtapeIndex(1);
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur inscription',
        error.response?.data?.message || 'Une erreur est survenue'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRechercheEcole = async (q: string) => {
    setRechercheEcole(q);
    setEtablissementChoisi(null);
    if (q.length < 2) {
      setEtablissementsTrouves([]);
      return;
    }
    try {
      const response = await searchEtablissements(q);
      setEtablissementsTrouves(response.data || response || []);
    } catch {
      setEtablissementsTrouves([]);
    }
  };

  const handleAjouterApprenant = async () => {
    if (!apprenantPrenom || !apprenantNom || !etablissementChoisi || !matricule || !classe || !codeEtablissement) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs et sélectionner un établissement');
      return;
    }
    setLoading(true);
    try {
      await addApprenant({
        etablissement_id: etablissementChoisi.id,
        prenom: apprenantPrenom,
        nom: apprenantNom,
        matricule,
        classe,
        code_etablissement: codeEtablissement,
      });
      setEtapeIndex(2);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de rattacher cet apprenant');
    } finally {
      setLoading(false);
    }
  };

  const renderCompte = () => (
    <View>
      <Text style={styles.lbl}>Je m'inscris en tant que</Text>
      <View style={styles.profilRow}>
        {PROFILS.map(({ valeur, label, Icone }) => (
          <TouchableOpacity
            key={valeur}
            style={[styles.profilChip, profil === valeur && styles.profilChipActive]}
            onPress={() => setProfil(valeur)}
          >
            <Icone size={18} color={profil === valeur ? '#FFFFFF' : '#0D9E75'} />
            <Text style={[styles.profilChipTxt, profil === valeur && styles.profilChipTxtActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.lbl}>Prénom *</Text>
      <TextInput style={styles.input} placeholder="ex : Marie" placeholderTextColor="#AAAAAA" value={prenom} onChangeText={setPrenom} />
      <Text style={styles.lbl}>Nom *</Text>
      <TextInput style={styles.input} placeholder="ex : FONO" placeholderTextColor="#AAAAAA" value={nom} onChangeText={setNom} />
      <Text style={styles.lbl}>Téléphone *</Text>
      <TextInput style={styles.input} placeholder="6XXXXXXXX (sans indicatif)" placeholderTextColor="#AAAAAA" value={telephone} onChangeText={(t) => setTelephone(t.replace(/\D/g, '').slice(0, 9))} keyboardType="phone-pad" maxLength={9} />
      <Text style={styles.lbl}>Ville *</Text>
      <TextInput style={styles.input} placeholder="ex : Yaoundé" placeholderTextColor="#AAAAAA" value={ville} onChangeText={setVille} />
      <Text style={styles.lbl}>Email (optionnel)</Text>
      <TextInput style={styles.input} placeholder="email@exemple.cm" placeholderTextColor="#AAAAAA" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Text style={styles.lbl}>Mot de passe *</Text>
      <TextInput style={styles.input} placeholder="Min. 8 car., 1 majuscule, 1 chiffre, 1 spécial" placeholderTextColor="#AAAAAA" value={password} onChangeText={setPassword} secureTextEntry={true} />
      <Text style={styles.lbl}>Confirmer mot de passe *</Text>
      <TextInput style={styles.input} placeholder="Répétez" placeholderTextColor="#AAAAAA" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={true} />

      <TouchableOpacity style={styles.cguRow} onPress={() => setCguAccepted(!cguAccepted)}>
        {cguAccepted ? <CheckSquare size={18} color="#0D9E75" /> : <Square size={18} color="#AAAAAA" />}
        <Text style={styles.cguTxt}>J'accepte les conditions d'utilisation d'EduPay *</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btnSuivant, loading && { opacity: 0.7 }]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.btnSuivantTxt}>Créer mon compte →</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={{ marginTop: 16 }} onPress={() => router.push('/screens/parent/LoginParentScreen')}>
        <Text style={styles.deja}>Déjà un compte ? <Text style={styles.dejaLnk}>Se connecter</Text></Text>
      </TouchableOpacity>
    </View>
  );

  const renderApprenant = () => (
    <View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTxt}>Ajoutez votre premier enfant.</Text>
      </View>
      <Text style={styles.lbl}>Prénom de l'enfant *</Text>
      <TextInput style={styles.input} placeholder="ex : Brice" placeholderTextColor="#AAAAAA" value={apprenantPrenom} onChangeText={setApprenantPrenom} />
      <Text style={styles.lbl}>Nom de l'enfant *</Text>
      <TextInput style={styles.input} placeholder="ex : FONO" placeholderTextColor="#AAAAAA" value={apprenantNom} onChangeText={setApprenantNom} />
      <Text style={styles.lbl}>École *</Text>
      <TextInput
        style={styles.input}
        placeholder="Rechercher une école..."
        placeholderTextColor="#AAAAAA"
        value={etablissementChoisi ? etablissementChoisi.nom : rechercheEcole}
        onChangeText={handleRechercheEcole}
      />
      {etablissementsTrouves.length > 0 && !etablissementChoisi && (
        <View style={styles.suggestions}>
          {etablissementsTrouves.map((e) => (
            <TouchableOpacity
              key={e.id}
              style={styles.suggestionItem}
              onPress={() => {
                setEtablissementChoisi(e);
                setEtablissementsTrouves([]);
              }}
            >
              <Text style={styles.suggestionTxt}>{e.nom}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <Text style={styles.lbl}>Code établissement *</Text>
      <TextInput style={styles.input} placeholder="Fourni par l'école" placeholderTextColor="#AAAAAA" value={codeEtablissement} onChangeText={setCodeEtablissement} autoCapitalize="characters" />
      <Text style={styles.lbl}>Matricule *</Text>
      <TextInput style={styles.input} placeholder="ex : 2026-0451" placeholderTextColor="#AAAAAA" value={matricule} onChangeText={setMatricule} />
      <Text style={styles.lbl}>Classe *</Text>
      <TextInput style={styles.input} placeholder="ex : 3eme A" placeholderTextColor="#AAAAAA" value={classe} onChangeText={setClasse} />
      <TouchableOpacity
        style={[styles.btnSuivant, loading && { opacity: 0.7 }]}
        onPress={handleAjouterApprenant}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnSuivantTxt}>Continuer →</Text>}
      </TouchableOpacity>
    </View>
  );

  const renderConfirmation = () => (
    <View style={{ alignItems: 'center' }}>
      <View style={styles.checkCircle}>
        <CheckCircle2 size={36} color="#FFFFFF" />
      </View>
      <Text style={styles.confirmTitre}>Compte créé !</Text>
      <Text style={styles.confirmDesc}>
        Un code OTP a été envoyé au {telephone} pour vérifier votre téléphone.
      </Text>
      <TouchableOpacity
        style={styles.btnSuivant}
        onPress={() => router.push('/screens/parent/OtpParentScreen')}
      >
        <Text style={styles.btnSuivantTxt}>Vérifier mon numéro →</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => (etapeIndex > 0 ? setEtapeIndex(etapeIndex - 1) : router.back())}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.titre}>Créer un compte</Text>
        <Text style={styles.etapeTxt}>{etapeIndex + 1}/{etapes.length}</Text>
      </View>
      <View style={styles.stepsRow}>
        {etapes.map((_, i) => (
          <View key={i} style={[styles.step, i <= etapeIndex && styles.stepActive]} />
        ))}
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.etapeTitre}>
          {etape === 'compte' ? 'Votre compte' : etape === 'apprenant' ? 'Votre enfant' : 'Confirmation'}
        </Text>
        {etape === 'compte' && renderCompte()}
        {etape === 'apprenant' && renderApprenant()}
        {etape === 'confirmation' && renderConfirmation()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  etapeTxt: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  stepsRow: { flexDirection: 'row', gap: 6, padding: 16, backgroundColor: '#0B2545' },
  step: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  stepActive: { backgroundColor: '#0D9E75' },
  content: { flex: 1, padding: 16 },
  etapeTitre: { fontSize: 18, fontWeight: '800', color: '#1A1A2E', marginBottom: 20 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  btnSuivant: { backgroundColor: '#0D9E75', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 24, width: '100%' },
  btnSuivantTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  infoBox: { backgroundColor: '#E0F5EE', borderRadius: 10, padding: 12, marginBottom: 8 },
  infoTxt: { fontSize: 12, color: '#085041', lineHeight: 17 },
  checkCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#0D9E75', alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginTop: 20 },
  confirmTitre: { fontSize: 22, fontWeight: '800', color: '#085041', marginBottom: 10 },
  confirmDesc: { fontSize: 13, color: '#666666', textAlign: 'center', lineHeight: 18, marginBottom: 24 },
  deja: { textAlign: 'center', fontSize: 13, color: '#888888' },
  dejaLnk: { color: '#0D9E75', fontWeight: '700' },
  profilRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  profilChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingVertical: 10 },
  profilChipActive: { backgroundColor: '#0D9E75', borderColor: '#0D9E75' },
  profilChipTxt: { fontSize: 11, fontWeight: '700', color: '#1A1A2E' },
  profilChipTxtActive: { color: '#FFFFFF' },
  suggestions: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, marginTop: 6, overflow: 'hidden' },
  suggestionItem: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  suggestionTxt: { fontSize: 13, color: '#1A1A2E' },
  cguRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  cguTxt: { flex: 1, fontSize: 12, color: '#555555', lineHeight: 16 },
});
