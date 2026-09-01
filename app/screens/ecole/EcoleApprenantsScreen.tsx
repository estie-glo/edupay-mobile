import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Plus, Trash2, UserCheck, UserX } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { creerApprenantEcole, getApprenantsEcole, rejeterApprenant, removeApprenantEcole, validerApprenant } from '../../../services/api';

type Apprenant = {
  id: number;
  prenom: string;
  nom: string;
  matricule?: string;
  classe?: string;
  statut?: string; // valide | en_attente | rejete
};

const STATUT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  valide: { bg: '#E0F5EE', fg: '#085041', label: 'Validé' },
  en_attente: { bg: '#FEF3DC', fg: '#8B5E10', label: 'En attente' },
  rejete: { bg: '#FBEAEA', fg: '#9B2C2C', label: 'Rejeté' },
};

function styleStatut(statut?: string) {
  return STATUT_STYLE[(statut || 'valide').toLowerCase()] || { bg: '#F0F2F5', fg: '#666666', label: statut || '—' };
}

export default function EcoleApprenantsScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [formOuvert, setFormOuvert] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [enTraitement, setEnTraitement] = useState<number | null>(null);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [classe, setClasse] = useState('');

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
      const response = await getApprenantsEcole();
      const data = response.data ?? response;
      setApprenants(Array.isArray(data) ? data : data.apprenants ?? []);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger les apprenants');
    } finally {
      setLoading(false);
    }
  };

  const resetFormulaire = () => {
    setFormOuvert(false);
    setPrenom('');
    setNom('');
    setMatricule('');
    setClasse('');
  };

  const handleAjouter = async () => {
    if (!prenom || !nom || !matricule || !classe) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setEnvoi(true);
    try {
      await creerApprenantEcole({ prenom, nom, matricule, classe });
      resetFormulaire();
      charger();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || "Impossible d'ajouter cet apprenant");
    } finally {
      setEnvoi(false);
    }
  };

  const handleValider = async (a: Apprenant) => {
    setEnTraitement(a.id);
    try {
      await validerApprenant(a.id);
      charger();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Validation impossible');
    } finally {
      setEnTraitement(null);
    }
  };

  const handleRejeter = (a: Apprenant) => {
    Alert.alert('Rejeter ce rattachement ?', `${a.prenom} ${a.nom} ne sera pas rattaché à ce parent.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Rejeter',
        style: 'destructive',
        onPress: async () => {
          setEnTraitement(a.id);
          try {
            await rejeterApprenant(a.id);
            charger();
          } catch (error: any) {
            Alert.alert('Erreur', error.response?.data?.message || 'Rejet impossible');
          } finally {
            setEnTraitement(null);
          }
        },
      },
    ]);
  };

  const handleSupprimer = (a: Apprenant) => {
    Alert.alert('Supprimer cet apprenant ?', `${a.prenom} ${a.nom} sera retiré de l'annuaire.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeApprenantEcole(a.id);
            charger();
          } catch (error: any) {
            Alert.alert('Erreur', error.response?.data?.message || 'Suppression impossible');
          }
        },
      },
    ]);
  };

  const filtres = apprenants.filter((a) => {
    const q = recherche.trim().toLowerCase();
    if (!q) return true;
    return `${a.prenom} ${a.nom} ${a.matricule || ''}`.toLowerCase().includes(q);
  });

  if (loading) {
    return <ActivityIndicator size="large" color="#E8A020" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.titre}>Apprenants</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setFormOuvert(true)}>
          <Plus size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchZone}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un nom, un matricule..."
          placeholderTextColor="#AAAAAA"
          value={recherche}
          onChangeText={setRecherche}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {formOuvert && (
          <View style={styles.formCard}>
            <Text style={styles.formTitre}>Ajouter un apprenant</Text>
            <Text style={styles.lbl}>Prénom *</Text>
            <TextInput style={styles.input} placeholder="ex : Brice" placeholderTextColor="#AAAAAA" value={prenom} onChangeText={setPrenom} />
            <Text style={styles.lbl}>Nom *</Text>
            <TextInput style={styles.input} placeholder="ex : FONO" placeholderTextColor="#AAAAAA" value={nom} onChangeText={setNom} />
            <Text style={styles.lbl}>Matricule *</Text>
            <TextInput style={styles.input} placeholder="ex : 2026-0451" placeholderTextColor="#AAAAAA" value={matricule} onChangeText={setMatricule} />
            <Text style={styles.lbl}>Classe *</Text>
            <TextInput style={styles.input} placeholder="ex : 3eme A" placeholderTextColor="#AAAAAA" value={classe} onChangeText={setClasse} />
            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.btnAnnuler} onPress={resetFormulaire}>
                <Text style={styles.btnAnnulerTxt}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnEnvoyer, envoi && { opacity: 0.7 }]} onPress={handleAjouter} disabled={envoi}>
                {envoi ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnEnvoyerTxt}>Ajouter</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {filtres.length === 0 ? (
          <Text style={styles.vide}>Aucun apprenant trouvé.</Text>
        ) : (
          filtres.map((a) => {
            const s = styleStatut(a.statut);
            const enAttente = (a.statut || '').toLowerCase() === 'en_attente';
            return (
              <View key={a.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nom}>{a.prenom} {a.nom}</Text>
                    <Text style={styles.sousTitre}>{a.matricule || '—'}{a.classe ? ` · ${a.classe}` : ''}</Text>
                  </View>
                  <View style={[styles.pill, { backgroundColor: s.bg }]}>
                    <Text style={[styles.pillTxt, { color: s.fg }]}>{s.label}</Text>
                  </View>
                </View>
                <View style={styles.actionsRow}>
                  {enAttente ? (
                    <>
                      <TouchableOpacity style={styles.actionBtnValider} onPress={() => handleValider(a)} disabled={enTraitement === a.id}>
                        {enTraitement === a.id ? <ActivityIndicator size="small" color="#FFFFFF" /> : <><UserCheck size={14} color="#FFFFFF" /><Text style={styles.actionBtnTxt}>Valider</Text></>}
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtnRejeter} onPress={() => handleRejeter(a)} disabled={enTraitement === a.id}>
                        <UserX size={14} color="#D94040" />
                        <Text style={styles.actionBtnRejeterTxt}>Rejeter</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity style={styles.supprimerBtn} onPress={() => handleSupprimer(a)}>
                      <Trash2 size={14} color="#D94040" />
                      <Text style={styles.actionBtnRejeterTxt}>Retirer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  addBtn: { backgroundColor: '#E8A020', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  searchZone: { backgroundColor: '#0B2545', paddingHorizontal: 16, paddingBottom: 16 },
  searchInput: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: '#1A1A2E' },
  content: { flex: 1, padding: 16 },
  vide: { fontSize: 13, color: '#888888', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  nom: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  sousTitre: { fontSize: 11, color: '#888888', marginTop: 2 },
  pill: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  pillTxt: { fontSize: 10, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtnValider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#0D9E75', borderRadius: 8, paddingVertical: 9, flex: 1 },
  actionBtnTxt: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  actionBtnRejeter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: '#FBEAEA', borderRadius: 8, paddingVertical: 9, flex: 1 },
  actionBtnRejeterTxt: { color: '#D94040', fontSize: 11, fontWeight: '700' },
  supprimerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: '#FBEAEA', borderRadius: 8, paddingVertical: 9, flex: 1 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  formTitre: { fontSize: 14, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F5F6F7', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnAnnuler: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  btnAnnulerTxt: { color: '#666666', fontSize: 12, fontWeight: '700' },
  btnEnvoyer: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#E8A020' },
  btnEnvoyerTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
