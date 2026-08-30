import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CircleCheck, Clock } from 'lucide-react-native';
import { getStatutPaiement } from '../../../services/api';

type Statut = {
  reference?: string;
  apprenant?: { prenom?: string; nom?: string };
  montant?: number;
  mode_paiement?: string;
  date?: string;
  created_at?: string;
  statut?: string;
};

export default function PaiementSuccessScreen() {
  const router = useRouter();
  const { paiementId } = useLocalSearchParams<{ paiementId?: string }>();
  const [statut, setStatut] = useState<Statut | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paiementId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const response = await getStatutPaiement(Number(paiementId));
        setStatut(response.data ?? response);
      } catch {
        setStatut(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [paiementId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0D9E75" style={{ flex: 1 }} />;
  }

  const enCours = statut?.statut && !['valide', 'reussi'].includes(statut.statut.toLowerCase());

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.checkCircle, enCours && { backgroundColor: '#E8A020' }]}>
          {enCours ? <Clock size={40} color="#FFFFFF" /> : <CircleCheck size={40} color="#FFFFFF" />}
        </View>
        <Text style={styles.titre}>{enCours ? 'Paiement en cours de confirmation' : 'Paiement validé !'}</Text>
        {!!statut?.reference && <Text style={styles.ref}>Réf. {statut.reference}</Text>}
        <Text style={styles.desc}>
          {enCours ? 'Confirmez sur votre téléphone pour finaliser le paiement.' : 'Reçu PDF envoyé par SMS et email'}
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
            <Text style={styles.detailVal}>{statut?.mode_paiement || '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLbl}>Date</Text>
            <Text style={styles.detailVal}>{(statut?.date || statut?.created_at || '').slice(0, 10) || '—'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnDashboard} onPress={() => router.push('/screens/parent/DashboardScreen')}>
          <Text style={styles.btnDashboardTxt}>Retour au tableau de bord</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnRecu} onPress={() => router.push('/screens/parent/HistoriqueScreen')}>
          <Text style={styles.btnRecuTxt}>Voir le reçu PDF</Text>
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
  btnRecu: { backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 12, alignItems: 'center', width: '100%', borderWidth: 2, borderColor: '#0D9E75' },
  btnRecuTxt: { color: '#0D9E75', fontSize: 14, fontWeight: '700' },
});
