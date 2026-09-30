import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Award, Download, Receipt } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getApprenants, getHistorique } from '../../../services/api';
import { telechargerEtPartager } from '../../../services/fichiers';
import BottomNavParent from '../../../components/BottomNavParent';
import Card from '../../../components/ui/Card';

// Écran dédié équivalent à /espace/recus côté web (Payeur/RecuController::index) :
// mêmes paiements validés que l'historique, filtrés côté client car GET /paiements
// (mobile) ne supporte pas de filtre par statut — plus les certificats de scolarité
// par apprenant, déjà exposés via GET /apprenants/{id}/certificat.
type Recu = {
  id: number;
  reference?: string;
  frais?: { nom?: string };
  apprenant?: { prenom?: string; nom?: string };
  montant: number;
  date_paiement?: string;
};

type Apprenant = { id: number; prenom: string; nom: string };

export default function RecusScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [recus, setRecus] = useState<Recu[]>([]);
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlus, setLoadingPlus] = useState(false);
  const [page, setPage] = useState(1);
  const [dernierePage, setDernierePage] = useState(1);
  const [telechargementEnCoursId, setTelechargementEnCoursId] = useState<string | null>(null);

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/parent/LoginParentScreen');
      return;
    }
    if (token) {
      charger(1);
      getApprenants().then((r) => setApprenants(r.data ?? r ?? [])).catch(() => setApprenants([]));
    }
  }, [token, authLoading]);

  const charger = async (pageAcharger: number) => {
    if (pageAcharger === 1) setLoading(true);
    else setLoadingPlus(true);
    try {
      const response = await getHistorique(pageAcharger);
      const items: (Recu & { statut?: string })[] = response.data ?? [];
      const valides = items.filter((p) => (p.statut || '').toLowerCase() === 'valide' || (p.statut || '').toLowerCase() === 'reussi');
      setRecus((prev) => (pageAcharger === 1 ? valides : [...prev, ...valides]));
      setDernierePage(response.meta?.last_page ?? pageAcharger);
      setPage(pageAcharger);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger les reçus');
    } finally {
      setLoading(false);
      setLoadingPlus(false);
    }
  };

  const handleTelechargerRecu = async (r: Recu) => {
    setTelechargementEnCoursId(`recu-${r.id}`);
    try {
      await telechargerEtPartager(`/paiements/${r.id}/recu`, `recu-edupay-${r.id}.pdf`);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Téléchargement du reçu impossible');
    } finally {
      setTelechargementEnCoursId(null);
    }
  };

  const handleTelechargerCertificat = async (a: Apprenant) => {
    setTelechargementEnCoursId(`cert-${a.id}`);
    try {
      await telechargerEtPartager(`/apprenants/${a.id}/certificat`, `certificat-edupay-${a.id}.pdf`);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Téléchargement du certificat impossible');
    } finally {
      setTelechargementEnCoursId(null);
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
        <View style={styles.titreRow}>
          <Receipt size={18} color="#FFFFFF" />
          <Text style={styles.titre}>Reçus & certificats</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {apprenants.length > 0 && (
          <>
            <Text style={styles.secLabel}>CERTIFICATS DE SCOLARITÉ</Text>
            {apprenants.map((a) => (
              <Card key={a.id} style={styles.card}>
                <Text style={styles.cardNom}>{a.prenom} {a.nom}</Text>
                <TouchableOpacity onPress={() => handleTelechargerCertificat(a)} disabled={telechargementEnCoursId === `cert-${a.id}`}>
                  {telechargementEnCoursId === `cert-${a.id}` ? <ActivityIndicator size="small" color="#0D9E75" /> : <Award size={18} color="#0D9E75" />}
                </TouchableOpacity>
              </Card>
            ))}
          </>
        )}

        <Text style={[styles.secLabel, { marginTop: 20 }]}>REÇUS DE PAIEMENT</Text>
        {recus.length === 0 ? (
          <Text style={styles.vide}>Aucun reçu disponible pour le moment.</Text>
        ) : (
          recus.map((r) => (
            <Card key={r.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardNom}>{r.apprenant?.prenom} {r.apprenant?.nom}</Text>
                <Text style={styles.cardSousTitre}>{r.frais?.nom || '—'} · {(r.montant ?? 0).toLocaleString('fr-FR')} FCFA</Text>
              </View>
              <TouchableOpacity onPress={() => handleTelechargerRecu(r)} disabled={telechargementEnCoursId === `recu-${r.id}`}>
                {telechargementEnCoursId === `recu-${r.id}` ? <ActivityIndicator size="small" color="#0D9E75" /> : <Download size={18} color="#0D9E75" />}
              </TouchableOpacity>
            </Card>
          ))
        )}

        {page < dernierePage && (
          <TouchableOpacity style={styles.btnPlus} onPress={() => charger(page + 1)} disabled={loadingPlus}>
            {loadingPlus ? <ActivityIndicator color="#0D9E75" /> : <Text style={styles.btnPlusTxt}>Charger plus</Text>}
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomNavParent actif="historique" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titre: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  secLabel: { fontSize: 10, fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  vide: { fontSize: 13, color: '#888888' },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 14, marginBottom: 8 },
  cardNom: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  cardSousTitre: { fontSize: 11, color: '#888888', marginTop: 2 },
  btnPlus: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  btnPlusTxt: { color: '#0D9E75', fontSize: 13, fontWeight: '700' },
});
