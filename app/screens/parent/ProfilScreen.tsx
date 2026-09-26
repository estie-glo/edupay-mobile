import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, KeyRound, LogOut, Save, UserRound } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getProfil, updateProfil, updateProfilPassword } from '../../../services/api';
import BottomNavParent from '../../../components/BottomNavParent';

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
      Alert.alert('Mot de passe modifié', 'Votre mot de passe a été mis à jour avec succès.');
      setMdpActuel('');
      setMdpNouveau('');
      setMdpConfirmation('');
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
        <View style={styles.switchRow}>
          <Text style={styles.switchLbl}>SMS (rappels, confirmations)</Text>
          <Switch value={notifSms} onValueChange={setNotifSms} trackColor={{ true: '#0D9E75' }} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLbl}>Email</Text>
          <Switch value={notifEmail} onValueChange={setNotifEmail} trackColor={{ true: '#0D9E75' }} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLbl}>Rappels d'échéance</Text>
          <Switch value={notifRappel} onValueChange={setNotifRappel} trackColor={{ true: '#0D9E75' }} />
        </View>

        <TouchableOpacity style={[styles.btnEnregistrer, enregistrement && { opacity: 0.7 }]} onPress={handleEnregistrer} disabled={enregistrement}>
          {enregistrement ? <ActivityIndicator color="#FFFFFF" /> : <><Save size={16} color="#FFFFFF" /><Text style={styles.btnEnregistrerTxt}>Enregistrer</Text></>}
        </TouchableOpacity>

        <Text style={[styles.secLabel, { marginTop: 28 }]}>MOT DE PASSE</Text>
        <Text style={styles.lbl}>Mot de passe actuel *</Text>
        <TextInput style={styles.input} value={mdpActuel} onChangeText={setMdpActuel} secureTextEntry placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Nouveau mot de passe *</Text>
        <TextInput style={styles.input} value={mdpNouveau} onChangeText={setMdpNouveau} secureTextEntry placeholder="Min. 8 car., 1 majuscule, 1 chiffre, 1 spécial" placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Confirmer *</Text>
        <TextInput style={styles.input} value={mdpConfirmation} onChangeText={setMdpConfirmation} secureTextEntry placeholderTextColor="#AAAAAA" />

        <TouchableOpacity style={[styles.btnMdp, changementMdp && { opacity: 0.7 }]} onPress={handleChangerMdp} disabled={changementMdp}>
          {changementMdp ? <ActivityIndicator color="#0D9E75" /> : <><KeyRound size={16} color="#0D9E75" /><Text style={styles.btnMdpTxt}>Changer le mot de passe</Text></>}
        </TouchableOpacity>

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
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  switchLbl: { fontSize: 12, color: '#1A1A2E', fontWeight: '600' },
  btnEnregistrer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0D9E75', paddingVertical: 14, borderRadius: 12, marginTop: 20 },
  btnEnregistrerTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  btnMdp: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 12, marginTop: 20, borderWidth: 1.5, borderColor: '#0D9E75' },
  btnMdpTxt: { color: '#0D9E75', fontSize: 14, fontWeight: '700' },
  btnDeconnexion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, marginTop: 24 },
  btnDeconnexionTxt: { color: '#D94040', fontSize: 13, fontWeight: '700' },
});
