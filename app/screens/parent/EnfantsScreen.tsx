import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Award, ChevronRight, Trash2, UserPlus } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getApprenants, rattacherApprenant, removeApprenant } from '../../../services/api';
import { telechargerEtPartager } from '../../../services/fichiers';
import BottomNavParent from '../../../components/BottomNavParent';

type Apprenant = {
  id: number;
  prenom: string;
  nom: string;
  classe?: string;
  etablissement?: { nom?: string };
  solde_du?: number;
  statut?: string;
};

const STATUT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  a_jour: { bg: '#E0F5EE', fg: '#085041', label: 'À jour' },
  partiel: { bg: '#FEF3DC', fg: '#8B5E10', label: 'Partiel' },
  impaye: { bg: '#FBEAEA', fg: '#9B2C2C', label: 'Impayé' },
};

function styleStatut(statut?: string) {
  return STATUT_STYLE[(statut || 'a_jour').toLowerCase()] || { bg: '#F0F2F5', fg: '#666666', label: statut || '—' };
}

export default function EnfantsScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOuvert, setFormOuvert] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  const [codeEtablissement, setCodeEtablissement] = useState('');
  const [matricule, setMatricule] = useState('');
  const [certificatEnCoursId, setCertificatEnCoursId] = useState<number | null>(null);

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/parent/LoginParentScreen');
      return;
    }
    if (token) chargerApprenants();
  }, [token, authLoading]);

  const chargerApprenants = async () => {
    setLoading(true);
    try {
      const response = await getApprenants();
      const data = response.data ?? response;
      setApprenants(Array.isArray(data) ? data : data.apprenants ?? []);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger vos enfants');
    } finally {
      setLoading(false);
    }
  };

  const resetFormulaire = () => {
    setFormOuvert(false);
    setCodeEtablissement('');
    setMatricule('');
  };

  const handleAjouter = async () => {
    if (!codeEtablissement || !matricule) {
      Alert.alert('Erreur', "Veuillez renseigner le code établissement et le matricule");
      return;
    }
    setEnvoi(true);
    try {
      await rattacherApprenant({ code_etablissement: codeEtablissement, matricule });
      resetFormulaire();
      chargerApprenants();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de rattacher cet apprenant');
    } finally {
      setEnvoi(false);
    }
  };

  const handleSupprimer = (apprenant: Apprenant) => {
    Alert.alert(
      'Supprimer cet enfant ?',
      `${apprenant.prenom} ${apprenant.nom} sera détaché de votre compte.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeApprenant(apprenant.id);
              chargerApprenants();
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.message || 'Suppression impossible');
            }
          },
        },
      ]
    );
  };

  const handleTelechargerCertificat = async (apprenant: Apprenant) => {
    setCertificatEnCoursId(apprenant.id);
    try {
      await telechargerEtPartager(`/apprenants/${apprenant.id}/certificat`, `certificat-${apprenant.prenom}-${apprenant.nom}.pdf`);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Téléchargement du certificat impossible');
    } finally {
      setCertificatEnCoursId(null);
    }
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
        <Text style={styles.titre}>Mes enfants</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setFormOuvert(true)}>
          <UserPlus size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {formOuvert && (
          <View style={styles.formCard}>
            <Text style={styles.formTitre}>Rattacher un enfant</Text>
            <Text style={styles.formSousTitre}>Ces informations vous sont fournies par l'établissement de l'enfant.</Text>
            <Text style={styles.lbl}>Code établissement *</Text>
            <TextInput style={styles.input} placeholder="Fourni par l'école" placeholderTextColor="#AAAAAA" value={codeEtablissement} onChangeText={setCodeEtablissement} autoCapitalize="characters" />
            <Text style={styles.lbl}>Matricule de l'enfant *</Text>
            <TextInput style={styles.input} placeholder="ex : 2026-0451" placeholderTextColor="#AAAAAA" value={matricule} onChangeText={setMatricule} />

            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.btnAnnuler} onPress={resetFormulaire}>
                <Text style={styles.btnAnnulerTxt}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnEnvoyer, envoi && { opacity: 0.7 }]} onPress={handleAjouter} disabled={envoi}>
                {envoi ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnEnvoyerTxt}>Rattacher</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {apprenants.length === 0 ? (
          <Text style={styles.vide}>Aucun enfant rattaché pour le moment.</Text>
        ) : (
          apprenants.map((a) => {
            const s = styleStatut(a.statut);
            return (
              <TouchableOpacity
                key={a.id}
                style={styles.card}
                onPress={() => router.push({ pathname: '/screens/parent/EcheancierScreen', params: { apprenantId: String(a.id) } })}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nom}>{a.prenom} {a.nom}</Text>
                    <Text style={styles.ecole}>{a.etablissement?.nom || '—'}{a.classe ? ` · ${a.classe}` : ''}</Text>
                  </View>
                  <View style={[styles.pill, { backgroundColor: s.bg }]}>
                    <Text style={[styles.pillTxt, { color: s.fg }]}>{s.label}</Text>
                  </View>
                </View>
                <View style={styles.cardBottom}>
                  <Text style={styles.solde}>Reste dû : <Text style={{ fontWeight: '700' }}>{(a.solde_du ?? 0).toLocaleString('fr-FR')} FCFA</Text></Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => handleTelechargerCertificat(a)} style={styles.trashBtn} disabled={certificatEnCoursId === a.id}>
                      {certificatEnCoursId === a.id ? <ActivityIndicator size="small" color="#0D9E75" /> : <Award size={16} color="#0D9E75" />}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSupprimer(a)} style={styles.trashBtn}>
                      <Trash2 size={16} color="#D94040" />
                    </TouchableOpacity>
                    <ChevronRight size={18} color="#AAAAAA" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <BottomNavParent actif="accueil" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  addBtn: { backgroundColor: '#0D9E75', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, padding: 16 },
  vide: { fontSize: 13, color: '#888888', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  nom: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  ecole: { fontSize: 11, color: '#888888', marginTop: 2 },
  pill: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  pillTxt: { fontSize: 10, fontWeight: '700' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  solde: { fontSize: 12, color: '#555555' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trashBtn: { padding: 4 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  formTitre: { fontSize: 14, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  formSousTitre: { fontSize: 11, color: '#888888', marginBottom: 4, lineHeight: 15 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F5F6F7', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnAnnuler: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  btnAnnulerTxt: { color: '#666666', fontSize: 12, fontWeight: '700' },
  btnEnvoyer: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#0D9E75' },
  btnEnvoyerTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
