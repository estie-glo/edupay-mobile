import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { creerReclamation, getHistorique, getReclamations } from '../../../services/api';
import BottomNavParent from '../../../components/BottomNavParent';

type Reclamation = {
  id: number;
  titre?: string;
  type?: string;
  description: string;
  statut?: string;
  reponse?: string;
  motif_rejet?: string;
  created_at?: string;
  reference?: string;
};

type Paiement = { id: number; libelle?: string; description?: string; montant: number };

const STATUT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  en_cours: { bg: '#FEF3DC', fg: '#8B5E10', label: 'En cours' },
  resolu: { bg: '#E0F5EE', fg: '#085041', label: 'Résolu' },
  rejete: { bg: '#FBEAEA', fg: '#9B2C2C', label: 'Rejeté' },
};

function styleStatut(statut?: string) {
  return STATUT_STYLE[(statut || 'en_cours').toLowerCase()] || { bg: '#F0F2F5', fg: '#666666', label: statut || '—' };
}

const TYPES = ['Erreur sur montant', 'Paiement non comptabilisé', 'Reçu PDF non reçu', 'Autre'];

export default function ReclamationsScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOuvert, setFormOuvert] = useState(false);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [paiementId, setPaiementId] = useState<number | null>(null);
  const [type, setType] = useState(TYPES[0]);
  const [description, setDescription] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/parent/LoginParentScreen');
      return;
    }
    if (token) chargerReclamations();
  }, [token, authLoading]);

  const chargerReclamations = async () => {
    setLoading(true);
    try {
      const response = await getReclamations();
      setReclamations(response.data || response || []);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger les réclamations');
    } finally {
      setLoading(false);
    }
  };

  const ouvrirFormulaire = async () => {
    setFormOuvert(true);
    try {
      const response = await getHistorique(1);
      const pagination = response.data ?? response;
      setPaiements(Array.isArray(pagination) ? pagination : pagination.data ?? []);
    } catch {
      setPaiements([]);
    }
  };

  const soumettre = async () => {
    if (!paiementId || !description) {
      Alert.alert('Erreur', 'Veuillez sélectionner un paiement et décrire le problème');
      return;
    }
    setEnvoi(true);
    try {
      await creerReclamation({ paiement_id: paiementId, type, description });
      setFormOuvert(false);
      setDescription('');
      setPaiementId(null);
      chargerReclamations();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de soumettre la réclamation');
    } finally {
      setEnvoi(false);
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
        <Text style={styles.titre}>Réclamations</Text>
        <TouchableOpacity style={styles.newBtn} onPress={ouvrirFormulaire}>
          <Plus size={14} color="#FFFFFF" />
          <Text style={styles.newBtnTxt}>Nouvelle</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {formOuvert && (
          <View style={styles.formCard}>
            <Text style={styles.formTitre}>Nouvelle réclamation</Text>

            <Text style={styles.lbl}>Paiement concerné *</Text>
            {paiements.length === 0 ? (
              <Text style={styles.vide}>Aucun paiement disponible.</Text>
            ) : (
              <View style={styles.chipsRow}>
                {paiements.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.chip, paiementId === p.id && styles.chipActive]}
                    onPress={() => setPaiementId(p.id)}
                  >
                    <Text style={[styles.chipTxt, paiementId === p.id && styles.chipTxtActive]}>
                      {(p.libelle || p.description || `Paiement #${p.id}`)} · {p.montant.toLocaleString('fr-FR')} F
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.lbl}>Type de problème *</Text>
            <View style={styles.chipsRow}>
              {TYPES.map((t) => (
                <TouchableOpacity key={t} style={[styles.chip, type === t && styles.chipActive]} onPress={() => setType(t)}>
                  <Text style={[styles.chipTxt, type === t && styles.chipTxtActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.lbl}>Description *</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Décrivez le problème rencontré..."
              placeholderTextColor="#AAAAAA"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.btnAnnuler} onPress={() => setFormOuvert(false)}>
                <Text style={styles.btnAnnulerTxt}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnEnvoyer, envoi && { opacity: 0.7 }]} onPress={soumettre} disabled={envoi}>
                {envoi ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnEnvoyerTxt}>Envoyer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {reclamations.length === 0 ? (
          <Text style={styles.vide}>Aucune réclamation pour le moment.</Text>
        ) : (
          reclamations.map((r) => {
            const s = styleStatut(r.statut);
            return (
              <View key={r.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitre}>{r.titre || r.type || 'Réclamation'}</Text>
                  <View style={[styles.pill, { backgroundColor: s.bg }]}>
                    <Text style={[styles.pillTxt, { color: s.fg }]}>{s.label}</Text>
                  </View>
                </View>
                <Text style={styles.cardDesc}>{r.description}</Text>
                <Text style={styles.cardDate}>
                  Soumis le {(r.created_at || '').slice(0, 10)}{r.reference ? ` · Réf. #${r.reference}` : ''}
                </Text>
                {r.reponse && (
                  <View style={styles.reponseBox}>
                    <Text style={styles.reponseTxt}>Réponse : {r.reponse}</Text>
                  </View>
                )}
                {r.motif_rejet && (
                  <View style={styles.rejetBox}>
                    <Text style={styles.rejetTxt}>Motif : {r.motif_rejet}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}

      </ScrollView>

      <BottomNavParent actif="reclamations" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#0D9E75', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  newBtnTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  vide: { fontSize: 12, color: '#888888', textAlign: 'center', marginVertical: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardTitre: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', flex: 1, marginRight: 8 },
  cardDesc: { fontSize: 11, color: '#555555', marginBottom: 6, lineHeight: 16 },
  cardDate: { fontSize: 10, color: '#AAAAAA', marginBottom: 6 },
  pill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  pillTxt: { fontSize: 10, fontWeight: '700' },
  reponseBox: { backgroundColor: '#E0F5EE', borderRadius: 8, padding: 8 },
  reponseTxt: { fontSize: 11, color: '#085041' },
  rejetBox: { backgroundColor: '#FBEAEA', borderRadius: 8, padding: 8 },
  rejetTxt: { fontSize: 11, color: '#9B2C2C' },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  formTitre: { fontSize: 14, fontWeight: '800', color: '#1A1A2E', marginBottom: 12 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#F5F6F7', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  chipActive: { backgroundColor: '#0D9E75', borderColor: '#0D9E75' },
  chipTxt: { fontSize: 10, fontWeight: '600', color: '#1A1A2E' },
  chipTxtActive: { color: '#FFFFFF' },
  textarea: { backgroundColor: '#F5F6F7', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 12, color: '#1A1A2E', textAlignVertical: 'top', minHeight: 80 },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnAnnuler: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  btnAnnulerTxt: { color: '#666666', fontSize: 12, fontWeight: '700' },
  btnEnvoyer: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#0D9E75' },
  btnEnvoyerTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
