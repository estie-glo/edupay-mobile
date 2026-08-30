import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CircleCheck, Clock, XCircle } from 'lucide-react-native';
import { verifierPaiement } from '../../../services/api';

type Statut = {
  reference?: string;
  apprenant?: { prenom?: string; nom?: string };
  montant?: number;
  mode?: string;
  date?: string;
  created_at?: string;
  statut?: string;
};

// AangaraaPay confirme le paiement de façon asynchrone (prompt USSD sur le
// téléphone du payeur) : on interroge /paiements/{id}/verifier toutes les 5s,
// jusqu'à 24 fois (2 minutes), comme le fait la page web d'attente.
const INTERVALLE_MS = 5000;
const MAX_TENTATIVES = 24;

export default function PaiementSuccessScreen() {
  const router = useRouter();
  const { paiementId } = useLocalSearchParams<{ paiementId?: string }>();
  const [statut, setStatut] = useState<Statut | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeout_, setTimeoutAtteint] = useState(false);
  const tentatives = useRef(0);

  useEffect(() => {
    if (!paiementId) {
      setLoading(false);
      return;
    }
    let annule = false;

    const verifier = async () => {
      try {
        const response = await verifierPaiement(Number(paiementId));
        const data = response.data ?? response;
        if (annule) return;
        setStatut(data);
        setLoading(false);

        const s = (data.statut || '').toLowerCase();
        if (s === 'en_attente' && tentatives.current < MAX_TENTATIVES) {
          tentatives.current += 1;
          setTimeout(verifier, INTERVALLE_MS);
        } else if (s === 'en_attente') {
          setTimeoutAtteint(true);
        }
      } catch {
        if (!annule) setLoading(false);
      }
    };

    verifier();
    return () => { annule = true; };
  }, [paiementId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0D9E75" style={{ flex: 1 }} />;
  }

  const s = (statut?.statut || '').toLowerCase();
  const echoue = s === 'echoue' || timeout_;
  const enAttente = s === 'en_attente' && !timeout_;
  const valide = s === 'valide';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.checkCircle, enAttente && { backgroundColor: '#E8A020' }, echoue && { backgroundColor: '#D94040' }]}>
          {echoue ? <XCircle size={40} color="#FFFFFF" /> : enAttente ? <Clock size={40} color="#FFFFFF" /> : <CircleCheck size={40} color="#FFFFFF" />}
        </View>
        <Text style={styles.titre}>
          {echoue ? 'Paiement échoué' : enAttente ? 'En attente de confirmation' : 'Paiement validé !'}
        </Text>
        {!!statut?.reference && <Text style={styles.ref}>Réf. {statut.reference}</Text>}
        <Text style={styles.desc}>
          {echoue
            ? "Le paiement n'a pas abouti. Vous pouvez réessayer depuis l'échéancier."
            : enAttente
              ? 'Confirmez le paiement avec votre code PIN Mobile Money sur votre téléphone.'
              : 'Reçu PDF envoyé par SMS et email'}
        </Text>
        <View style={styles.detailBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLbl}>Apprenant</Text>
            <Text style={styles.detailVal}>
              {statut?.apprenant ? `${statut.apprenant.prenom} ${statut.apprenant.nom}` : '—'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLbl}>Montant</Text>
            <Text style={[styles.detailVal, { color: '#0D9E75' }]}>
              {statut?.montant != null ? `${statut.montant.toLocaleString('fr-FR')} FCFA` : '—'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLbl}>Mode</Text>
            <Text style={styles.detailVal}>{statut?.mode || '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLbl}>Date</Text>
            <Text style={styles.detailVal}>{(statut?.date || statut?.created_at || '').slice(0, 10) || '—'}</Text>
          </View>
        </View>
        {valide && (
          <TouchableOpacity style={styles.btnRecu} onPress={() => router.push('/screens/parent/HistoriqueScreen')}>
            <Text style={styles.btnRecuTxt}>Voir le reçu PDF</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.btnDashboard} onPress={() => router.push('/screens/parent/DashboardScreen')}>
          <Text style={styles.btnDashboardTxt}>Retour au tableau de bord</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7', justifyContent: 'center', padding: 24 },
  content: { alignItems: 'center' },
  checkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0D9E75', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  titre: { fontSize: 22, fontWeight: '800', color: '#085041', marginBottom: 6, textAlign: 'center' },
  ref: { fontSize: 13, color: '#0D9E75', marginBottom: 6 },
  desc: { fontSize: 12, color: '#888888', marginBottom: 24, textAlign: 'center' },
  detailBox: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, width: '100%', marginBottom: 24 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  detailLbl: { fontSize: 12, color: '#888888' },
  detailVal: { fontSize: 12, fontWeight: '700', color: '#1A1A2E' },
  btnDashboard: { backgroundColor: '#0D9E75', paddingVertical: 14, borderRadius: 12, alignItems: 'center', width: '100%', marginBottom: 10 },
  btnDashboardTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  btnRecu: { backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 12, alignItems: 'center', width: '100%', borderWidth: 2, borderColor: '#0D9E75', marginBottom: 10 },
  btnRecuTxt: { color: '#0D9E75', fontSize: 14, fontWeight: '700' },
});
