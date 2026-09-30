import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Eye, EyeOff, KeyRound, LogOut, Save, UserRound } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getProfil, updateProfil, updateProfilPassword } from '../../../services/api';
import BottomNavParent from '../../../components/BottomNavParent';
import Card from '../../../components/ui/Card';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/;

export default function ProfilScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading, signOut, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [changementMdp, setChangementMdp] = useState(false);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [ville, setVille] = useState('');
  const [quartier, setQuartier] = useState('');
  const [telephone, setTelephone] = useState('');
  const [notifSms, setNotifSms] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifRappel, setNotifRappel] = useState(true);

  const [mdpActuel, setMdpActuel] = useState('');
  const [mdpNouveau, setMdpNouveau] = useState('');
  const [mdpConfirmation, setMdpConfirmation] = useState('');
  const [mdpActuelVisible, setMdpActuelVisible] = useState(false);
  const [mdpNouveauVisible, setMdpNouveauVisible] = useState(false);
  const [mdpConfirmationVisible, setMdpConfirmationVisible] = useState(false);

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/parent/LoginParentScreen');
      return;
    }
    if (token) charger();
  }, [token, authLoading]);

  const charger = async () => {
    setLoading(true);
    try {
      const response = await getProfil();
      const u = response.user ?? response.data ?? response;
      setPrenom(u.prenom || '');
      setNom(u.nom || '');
      setEmail(u.email || '');
      setVille(u.ville || '');
      setQuartier(u.quartier || '');
      setTelephone(u.telephone || '');
      setNotifSms(u.notif_sms ?? true);
      setNotifEmail(u.notif_email ?? true);
      setNotifRappel(u.notif_rappel_echeance ?? true);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger votre profil');
    } finally {
      setLoading(false);
    }
  };

  const handleEnregistrer = async () => {
    if (!prenom || !nom) {
      Alert.alert('Erreur', 'Le prénom et le nom sont obligatoires');
      return;
    }
    setEnregistrement(true);
    try {
      await updateProfil({
        prenom, nom, ville: ville || undefined, quartier: quartier || undefined, email: email || undefined,
        notif_sms: notifSms, notif_email: notifEmail, notif_rappel_echeance: notifRappel,
      });
      await refreshUser();
      Alert.alert('Profil mis à jour', 'Vos informations ont été enregistrées.');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Mise à jour impossible');
    } finally {
      setEnregistrement(false);
    }
  };

  const handleChangerMdp = async () => {
    if (!mdpActuel || mdpNouveau.length < 8 || !PASSWORD_REGEX.test(mdpNouveau)) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 chiffre et 1 caractère spécial');
      return;
    }
    if (mdpNouveau !== mdpConfirmation) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    setChangementMdp(true);
    try {
      await updateProfilPassword({ current_password: mdpActuel, password: mdpNouveau, password_confirmation: mdpConfirmation });
      // Le changement de mot de passe révoque tous les tokens Sanctum côté
      // serveur, y compris celui de cette requête (vérifié le 27/09/2026) :
      // sans déconnexion locale immédiate, l'app resterait bloquée avec un
      // token mort jusqu'à la prochaine action.
      await signOut();
      Alert.alert('Mot de passe modifié', 'Veuillez vous reconnecter avec votre nouveau mot de passe.');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Changement de mot de passe impossible');
    } finally {
      setChangementMdp(false);
    }
  };

  const handleDeconnexion = () => {
    Alert.alert('Se déconnecter ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0D9E75" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.titreRow}>
          <UserRound size={18} color="#FFFFFF" />
          <Text style={styles.titre}>Mon profil</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.secLabel}>INFORMATIONS PERSONNELLES</Text>
        <Text style={styles.lbl}>Prénom *</Text>
        <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Nom *</Text>
        <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Téléphone</Text>
        <TextInput style={[styles.input, styles.inputDisabled]} value={telephone} editable={false} />
        <Text style={styles.lbl}>Email (optionnel)</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Ville</Text>
        <TextInput style={styles.input} value={ville} onChangeText={setVille} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Quartier (optionnel)</Text>
        <TextInput style={styles.input} value={quartier} onChangeText={setQuartier} placeholderTextColor="#AAAAAA" />

        <Text style={[styles.secLabel, { marginTop: 20 }]}>NOTIFICATIONS</Text>
        <Card style={styles.switchRow}>
          <Text style={styles.switchLbl}>SMS (rappels, confirmations)</Text>
          <Switch value={notifSms} onValueChange={setNotifSms} trackColor={{ true: '#0D9E75' }} />
        </Card>
        <Card style={styles.switchRow}>
          <Text style={styles.switchLbl}>Email</Text>
          <Switch value={notifEmail} onValueChange={setNotifEmail} trackColor={{ true: '#0D9E75' }} />
        </Card>
        <Card style={styles.switchRow}>
          <Text style={styles.switchLbl}>Rappels d'échéance</Text>
          <Switch value={notifRappel} onValueChange={setNotifRappel} trackColor={{ true: '#0D9E75' }} />
        </Card>

        <PrimaryButton
          title="Enregistrer"
          onPress={handleEnregistrer}
          loading={enregistrement}
          icon={<Save size={16} color="#FFFFFF" />}
          style={{ marginTop: 20 }}
        />

        <Text style={[styles.secLabel, { marginTop: 28 }]}>MOT DE PASSE</Text>
        <Text style={styles.lbl}>Mot de passe actuel *</Text>
        <View style={styles.passwordRow}>
          <TextInput style={[styles.input, styles.passwordInput]} value={mdpActuel} onChangeText={setMdpActuel} secureTextEntry={!mdpActuelVisible} placeholderTextColor="#AAAAAA" />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setMdpActuelVisible((v) => !v)}>
            {mdpActuelVisible ? <EyeOff size={18} color="#888888" /> : <Eye size={18} color="#888888" />}
          </TouchableOpacity>
        </View>
        <Text style={styles.lbl}>Nouveau mot de passe *</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            value={mdpNouveau}
            onChangeText={setMdpNouveau}
            secureTextEntry={!mdpNouveauVisible}
            placeholder="Min. 8 car., 1 majuscule, 1 chiffre, 1 spécial"
            placeholderTextColor="#AAAAAA"
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setMdpNouveauVisible((v) => !v)}>
            {mdpNouveauVisible ? <EyeOff size={18} color="#888888" /> : <Eye size={18} color="#888888" />}
          </TouchableOpacity>
        </View>
        <Text style={styles.lbl}>Confirmer *</Text>
        <View style={styles.passwordRow}>
          <TextInput style={[styles.input, styles.passwordInput]} value={mdpConfirmation} onChangeText={setMdpConfirmation} secureTextEntry={!mdpConfirmationVisible} placeholderTextColor="#AAAAAA" />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setMdpConfirmationVisible((v) => !v)}>
            {mdpConfirmationVisible ? <EyeOff size={18} color="#888888" /> : <Eye size={18} color="#888888" />}
          </TouchableOpacity>
        </View>

        <PrimaryButton
          variant="outline"
          title="Changer le mot de passe"
          onPress={handleChangerMdp}
          loading={changementMdp}
          icon={<KeyRound size={16} color="#0D9E75" />}
          style={{ marginTop: 20 }}
        />

        <TouchableOpacity style={styles.btnDeconnexion} onPress={handleDeconnexion}>
          <LogOut size={16} color="#D94040" />
          <Text style={styles.btnDeconnexionTxt}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavParent actif="profil" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titre: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  secLabel: { fontSize: 10, fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  inputDisabled: { backgroundColor: '#F0F2F5', color: '#888888' },
  passwordRow: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: 44 },
  eyeBtn: { position: 'absolute', right: 14, padding: 4 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 },
  switchLbl: { fontSize: 12, color: '#1A1A2E', fontWeight: '600' },
  btnDeconnexion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, marginTop: 24 },
  btnDeconnexionTxt: { color: '#D94040', fontSize: 13, fontWeight: '700' },
});
