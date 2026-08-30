import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, ArrowLeftRight, CreditCard, SlidersHorizontal, XCircle } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getHistorique } from '../../../services/api';
import BottomNavParent from '../../../components/BottomNavParent';

type Paiement = {
  id: number;
  libelle?: string;
  description?: string;
  apprenant?: { prenom?: string; nom?: string };
  montant: number;
  mode_paiement?: string;
  statut?: string;
  date?: string;
  created_at?: string;
};

const STATUT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  valide: { bg: '#E0F5EE', fg: '#085041', label: 'Validé' },
  reussi: { bg: '#E0F5EE', fg: '#085041', label: 'Validé' },
  rembourse: { bg: '#FEF3DC', fg: '#8B5E10', label: 'Remboursé' },
  echoue: { bg: '#FBEAEA', fg: '#9B2C2C', label: 'Échoué' },
  en_attente: { bg: '#FEF3DC', fg: '#8B5E10', label: 'En attente' },
};

function styleStatut(statut?: string) {
  return STATUT_STYLE[(statut || '').toLowerCase()] || { bg: '#F0F2F5', fg: '#666666', label: statut || '—' };
}

export default function HistoriqueScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [page, setPage] = useState(1);
  const [dernierePage, setDernierePage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingPlus, setLoadingPlus] = useState(false);

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/parent/LoginParentScreen');
      return;
    }
    if (token) chargerHistorique(1);
  }, [token, authLoading]);

  const chargerHistorique = async (pageAcharger: number) => {
    if (pageAcharger === 1) setLoading(true);
    else setLoadingPlus(true);
    try {
      const response = await getHistorique(pageAcharger);
      const pagination = response.data ?? response;
      const items: Paiement[] = Array.isArray(pagination) ? pagination : pagination.data ?? [];
      setPaiements((prev) => (pageAcharger === 1 ? items : [...prev, ...items]));
      setDernierePage(pagination.last_page ?? pageAcharger);
      setPage(pageAcharger);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger l\'historique');
    } finally {
      setLoading(false);
      setLoadingPlus(false);
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
        <Text style={styles.titre}>Historique</Text>
        <TouchableOpacity>
          <SlidersHorizontal size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {paiements.length === 0 ? (
          <Text style={styles.vide}>Aucun paiement pour le moment.</Text>
        ) : (
          <View style={styles.card}>
            {paiements.map((p) => {
              const s = styleStatut(p.statut);
              const negatif = (p.montant ?? 0) < 0;
              return (
                <TouchableOpacity key={p.id} style={styles.row}>
                  <View style={[styles.ico, { backgroundColor: s.bg }]}>
                    {negatif ? <ArrowLeftRight size={18} color={s.fg} /> : p.statut === 'echoue' ? <XCircle size={18} color={s.fg} /> : <CreditCard size={18} color={s.fg} />}
                  </View>
                  <View style={styles.rowTexts}>
                    <Text style={styles.rowTitre}>
                      {p.libelle || p.description || 'Paiement'}
                      {p.apprenant?.prenom ? ` — ${p.apprenant.prenom}` : ''}
                    </Text>
                    <Text style={styles.rowSub}>
                      {(p.date || p.created_at || '').slice(0, 10)}{p.mode_paiement ? ` · ${p.mode_paiement}` : ''}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.rowMontant, { color: s.fg }]}>{Math.abs(p.montant ?? 0).toLocaleString('fr-FR')} F</Text>
                    <View style={[styles.pill, { backgroundColor: s.bg }]}>
                      <Text style={[styles.pillTxt, { color: s.fg }]}>{s.label}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {page < dernierePage && (
          <TouchableOpacity style={styles.loadMore} onPress={() => chargerHistorique(page + 1)} disabled={loadingPlus}>
            {loadingPlus ? <ActivityIndicator color="#0D9E75" /> : <Text style={styles.loadMoreTxt}>Charger plus</Text>}
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomNavParent actif="historique" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  vide: { fontSize: 13, color: '#888888', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', gap: 10 },
  ico: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowTexts: { flex: 1 },
  rowTitre: { fontSize: 12, fontWeight: '600', color: '#1A1A2E' },
  rowSub: { fontSize: 10, color: '#888888', marginTop: 2 },
  rowMontant: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  pill: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  pillTxt: { fontSize: 9, fontWeight: '700' },
  loadMore: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: '#0D9E75' },
  loadMoreTxt: { color: '#0D9E75', fontSize: 13, fontWeight: '700' },
});
