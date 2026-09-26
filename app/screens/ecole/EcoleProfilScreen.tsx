import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Building2, Calendar, KeyRound, LogOut, Save, UserRound } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getAbonnement, getProfilEcole, updateProfilEcole, updateProfilPasswordEcole } from '../../../services/api';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/;

type Abonnement = { plan_nom?: string; statut?: string; date_fin?: string; jours_restants?: number };

export default function EcoleProfilScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading, signOut, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [changementMdp, setChangementMdp] = useState(false);
  const [abonnement, setAbonnement] = useState<Abonnement | null>(null);
  const [etablissement, setEtablissement] = useState<{ nom?: string; type?: string; ville?: string } | null>(null);
  const [role, setRole] = useState('');

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [ville, setVille] = useState('');

  const [mdpActuel, setMdpActuel] = useState('');
  const [mdpNouveau, setMdpNouveau] = useState('');
  const [mdpConfirmation, setMdpConfirmation] = useState('');

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/ecole/LoginEcoleScreen');
      return;
    }
    if (token) charger();
  }, [token, authLoading]);

  const charger = async () => {
    setLoading(true);
    try {
      const [profilRes, aboRes] = await Promise.allSettled([getProfilEcole(), getAbonnement()]);
      if (profilRes.status === 'fulfilled') {
        const d = profilRes.value.data ?? profilRes.value;
        setPrenom(d.prenom || '');
        setNom(d.nom || '');
        setTelephone(d.telephone || '');
        setEmail(d.email || '');
        setVille(d.ville || '');
        setRole(d.role || '');
        setEtablissement(d.etablissement || null);
      }
      if (aboRes.status === 'fulfilled') {
        const d = aboRes.value.data ?? aboRes.value;
        setAbonnement(d.abonnement || null);
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger votre profil');
    } finally {
      setLoading(false);
    }
  };

  const handleEnregistrer = async () => {
    if (!prenom || !nom || !/^6\d{8}$/.test(telephone)) {
      Alert.alert('Erreur', 'Prénom, nom et téléphone (6XXXXXXXX) sont obligatoires');
      return;
    }
    setEnregistrement(true);
    try {
      await updateProfilEcole({ prenom, nom, telephone, email: email || undefined, ville: ville || undefined });
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
      await updateProfilPasswordEcole({ current_password: mdpActuel, password: mdpNouveau, password_confirmation: mdpConfirmation });
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
    return <ActivityIndicator size="large" color="#E8A020" style={{ flex: 1 }} />;
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
        {!!etablissement && (
          <View style={styles.etabCard}>
            <View style={styles.etabIco}>
              <Building2 size={18} color="#E8A020" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.etabNom}>{etablissement.nom}</Text>
              <Text style={styles.etabSousTitre}>{etablissement.ville} · {role}</Text>
            </View>
          </View>
        )}

        {!!abonnement && (
          <View style={styles.aboCard}>
            <Calendar size={14} color="#888888" />
            <Text style={styles.aboTxt}>
              Formule {abonnement.plan_nom || '—'}{abonnement.jours_restants != null ? ` · ${abonnement.jours_restants} j. restants` : ''}
            </Text>
          </View>
        )}

        <Text style={styles.secLabel}>INFORMATIONS DU COMPTE</Text>
        <Text style={styles.lbl}>Prénom *</Text>
        <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Nom *</Text>
        <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Téléphone *</Text>
        <TextInput style={styles.input} value={telephone} onChangeText={(t) => setTelephone(t.replace(/\D/g, '').slice(0, 9))} keyboardType="phone-pad" maxLength={9} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Ville</Text>
        <TextInput style={styles.input} value={ville} onChangeText={setVille} placeholderTextColor="#AAAAAA" />

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
          {changementMdp ? <ActivityIndicator color="#E8A020" /> : <><KeyRound size={16} color="#E8A020" /><Text style={styles.btnMdpTxt}>Changer le mot de passe</Text></>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnDeconnexion} onPress={handleDeconnexion}>
          <LogOut size={16} color="#D94040" />
          <Text style={styles.btnDeconnexionTxt}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
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
  etabCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  etabIco: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#FEF3DC', alignItems: 'center', justifyContent: 'center' },
  etabNom: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  etabSousTitre: { fontSize: 11, color: '#888888', marginTop: 2, textTransform: 'capitalize' },
  aboCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  aboTxt: { fontSize: 11, color: '#666666', fontWeight: '600' },
  secLabel: { fontSize: 10, fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  btnEnregistrer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#E8A020', paddingVertical: 14, borderRadius: 12, marginTop: 20 },
  btnEnregistrerTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  btnMdp: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 12, marginTop: 20, borderWidth: 1.5, borderColor: '#E8A020' },
  btnMdpTxt: { color: '#E8A020', fontSize: 14, fontWeight: '700' },
  btnDeconnexion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, marginTop: 24 },
  btnDeconnexionTxt: { color: '#D94040', fontSize: 13, fontWeight: '700' },
});
