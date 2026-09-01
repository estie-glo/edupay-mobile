import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, CircleCheck, CircleX, Plus, RotateCcw } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { approuverRemboursement, demanderRemboursement, getPaiementsEcole, getRemboursements, refuserRemboursement } from '../../../services/api';

type Remboursement = {
  id: number;
  paiement?: { id: number; apprenant?: { prenom?: string; nom?: string }; montant: number };
  motif: string;
  montant?: number;
  statut?: string; // en_attente | approuve | refuse
  motif_refus?: string;
};

type Paiement = { id: number; apprenant?: { prenom?: string; nom?: string }; montant: number };

const STATUT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  en_attente: { bg: '#FEF3DC', fg: '#8B5E10', label: 'En attente' },
  approuve: { bg: '#E0F5EE', fg: '#085041', label: 'Approuvé' },
  refuse: { bg: '#FBEAEA', fg: '#9B2C2C', label: 'Refusé' },
};

function styleStatut(statut?: string) {
  return STATUT_STYLE[(statut || 'en_attente').toLowerCase()] || STATUT_STYLE.en_attente;
}

export default function EcoleRemboursementsScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading, user } = useAuth();
  const [remboursements, setRemboursements] = useState<Remboursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOuvert, setFormOuvert] = useState(false);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [paiementId, setPaiementId] = useState<number | null>(null);
  const [motif, setMotif] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [traitementId, setTraitementId] = useState<number | null>(null);

  const peutApprouver = user?.role === 'directeur' || user?.role === 'comptable';

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
      const response = await getRemboursements();
      const data = response.data ?? response;
      setRemboursements(Array.isArray(data) ? data : data.remboursements ?? []);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger les remboursements');
    } finally {
      setLoading(false);
    }
  };

  const ouvrirFormulaire = async () => {
    setFormOuvert(true);
    try {
      const response = await getPaiementsEcole(1);
      const pagination = response.data ?? response;
      const items = Array.isArray(pagination) ? pagination : pagination.data ?? [];
      setPaiements(items.filter((p: any) => (p.statut || '').toLowerCase() === 'valide'));
    } catch {
      setPaiements([]);
    }
  };

  const handleDemander = async () => {
    if (!paiementId || !motif) {
      Alert.alert('Erreur', 'Sélectionnez un paiement et indiquez un motif');
      return;
    }
    setEnvoi(true);
    try {
      await demanderRemboursement({ paiement_id: paiementId, motif });
      setFormOuvert(false);
      setPaiementId(null);
      setMotif('');
      charger();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Demande impossible');
    } finally {
      setEnvoi(false);
    }
  };

  const handleApprouver = async (r: Remboursement) => {
    setTraitementId(r.id);
    try {
      await approuverRemboursement(r.id);
      charger();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Approbation impossible');
    } finally {
      setTraitementId(null);
    }
  };

  const handleRefuser = (r: Remboursement) => {
    Alert.alert('Refuser ce remboursement ?', '', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Refuser',
        style: 'destructive',
        onPress: async () => {
          setTraitementId(r.id);
          try {
            await refuserRemboursement(r.id);
            charger();
          } catch (error: any) {
            Alert.alert('Erreur', error.response?.data?.message || 'Refus impossible');
          } finally {
            setTraitementId(null);
          }
        },
      },
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
        <Text style={styles.titre}>Remboursements</Text>
        <TouchableOpacity style={styles.addBtn} onPress={ouvrirFormulaire}>
          <Plus size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {formOuvert && (
          <View style={styles.formCard}>
            <Text style={styles.formTitre}>Nouvelle demande</Text>
            <Text style={styles.lbl}>Paiement concerné *</Text>
            {paiements.length === 0 ? (
              <Text style={styles.vide}>Aucun paiement validé disponible.</Text>
            ) : (
              <View style={styles.chipsRow}>
                {paiements.map((p) => (
                  <TouchableOpacity key={p.id} style={[styles.chip, paiementId === p.id && styles.chipActive]} onPress={() => setPaiementId(p.id)}>
                    <Text style={[styles.chipTxt, paiementId === p.id && styles.chipTxtActive]}>
                      {p.apprenant ? `${p.apprenant.prenom} ${p.apprenant.nom}` : `Paiement #${p.id}`} · {p.montant.toLocaleString('fr-FR')} F
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text style={styles.lbl}>Motif *</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Expliquez la raison du remboursement..."
              placeholderTextColor="#AAAAAA"
              value={motif}
              onChangeText={setMotif}
              multiline
              numberOfLines={3}
            />
            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.btnAnnuler} onPress={() => setFormOuvert(false)}>
                <Text style={styles.btnAnnulerTxt}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnEnvoyer, envoi && { opacity: 0.7 }]} onPress={handleDemander} disabled={envoi}>
                {envoi ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnEnvoyerTxt}>Envoyer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {remboursements.length === 0 ? (
          <Text style={styles.vide}>Aucune demande de remboursement.</Text>
        ) : (
          remboursements.map((r) => {
            const s = styleStatut(r.statut);
            const enAttente = (r.statut || '').toLowerCase() === 'en_attente';
            return (
              <View key={r.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitre}>
                    {r.paiement?.apprenant ? `${r.paiement.apprenant.prenom} ${r.paiement.apprenant.nom}` : `Paiement #${r.paiement?.id ?? ''}`}
                  </Text>
                  <View style={[styles.pill, { backgroundColor: s.bg }]}>
                    <Text style={[styles.pillTxt, { color: s.fg }]}>{s.label}</Text>
                  </View>
                </View>
                <Text style={styles.cardMotif}>{r.motif}</Text>
                <Text style={styles.cardMontant}>{(r.montant ?? r.paiement?.montant ?? 0).toLocaleString('fr-FR')} FCFA</Text>
                {enAttente && peutApprouver && (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.btnApprouver} onPress={() => handleApprouver(r)} disabled={traitementId === r.id}>
                      {traitementId === r.id ? <ActivityIndicator size="small" color="#FFFFFF" /> : <><CircleCheck size={14} color="#FFFFFF" /><Text style={styles.btnApprouverTxt}>Approuver</Text></>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnRefuser} onPress={() => handleRefuser(r)} disabled={traitementId === r.id}>
                      <CircleX size={14} color="#D94040" />
                      <Text style={styles.btnRefuserTxt}>Refuser</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {!!r.motif_refus && (
                  <View style={styles.refusBox}>
                    <RotateCcw size={12} color="#9B2C2C" />
                    <Text style={styles.refusTxt}>{r.motif_refus}</Text>
                  </View>
                )}
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
  titre: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  addBtn: { backgroundColor: '#E8A020', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, padding: 16 },
  vide: { fontSize: 12, color: '#888888', textAlign: 'center', marginVertical: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardTitre: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', flex: 1, marginRight: 8 },
  cardMotif: { fontSize: 11, color: '#555555', marginBottom: 6, lineHeight: 16 },
  cardMontant: { fontSize: 13, fontWeight: '800', color: '#D94040', marginBottom: 8 },
  pill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  pillTxt: { fontSize: 10, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 8 },
  btnApprouver: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#0D9E75', borderRadius: 8, paddingVertical: 9 },
  btnApprouverTxt: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  btnRefuser: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: '#FBEAEA', borderRadius: 8, paddingVertical: 9 },
  btnRefuserTxt: { color: '#D94040', fontSize: 11, fontWeight: '700' },
  refusBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FBEAEA', borderRadius: 8, padding: 8, marginTop: 4 },
  refusTxt: { fontSize: 11, color: '#9B2C2C', flex: 1 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  formTitre: { fontSize: 14, fontWeight: '800', color: '#1A1A2E', marginBottom: 12 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#F5F6F7', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  chipActive: { backgroundColor: '#E8A020', borderColor: '#E8A020' },
  chipTxt: { fontSize: 10, fontWeight: '600', color: '#1A1A2E' },
  chipTxtActive: { color: '#FFFFFF' },
  textarea: { backgroundColor: '#F5F6F7', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 12, color: '#1A1A2E', textAlignVertical: 'top', minHeight: 70 },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnAnnuler: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  btnAnnulerTxt: { color: '#666666', fontSize: 12, fontWeight: '700' },
  btnEnvoyer: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#E8A020' },
  btnEnvoyerTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
