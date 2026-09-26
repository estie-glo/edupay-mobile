import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, ChartPie, FileDown, FileSpreadsheet } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getRapports, getUrlExportRapportExcel, getUrlExportRapportPdf } from '../../../services/api';
import { telechargerEtPartager } from '../../../services/fichiers';

type RepartitionMoyen = { mode: string; pourcentage: number };
type RepartitionClasse = { nom: string; nb_apprenants: number; taux: number };

// Forme exacte de RapportController::index sur le backend (vérifiée le 26/09/2026).
type Rapport = {
  annee_scolaire?: string;
  total_encaisse_annee?: number;
  total_impaye_annee?: number;
  total_attendu?: number;
  taux_recouvrement?: number;
  nb_apprenants?: number;
  repartition_moyens?: RepartitionMoyen[];
  repartition_classes?: RepartitionClasse[];
};

export default function EcoleRapportsScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportEnCours, setExportEnCours] = useState<'pdf' | 'excel' | null>(null);

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
      const response = await getRapports();
      setRapport(response.data ?? response);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger le rapport');
    } finally {
      setLoading(false);
    }
  };

  const handleExporter = async (format: 'pdf' | 'excel') => {
    setExportEnCours(format);
    try {
      const extension = format === 'pdf' ? 'pdf' : 'csv';
      const nomFichier = `rapport-financier-${new Date().toISOString().slice(0, 10)}.${extension}`;
      const url = format === 'pdf' ? getUrlExportRapportPdf() : getUrlExportRapportExcel();
      await telechargerEtPartager(url, nomFichier);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || `Export impossible pour le moment`);
    } finally {
      setExportEnCours(null);
    }
  };

  if (loading || !rapport) {
    return <ActivityIndicator size="large" color="#E8A020" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.titre}>Rapports</Text>
        <View style={{ width: 32 }} />
      </View>
      {!!rapport.annee_scolaire && <Text style={styles.sousTitre}>Année scolaire {rapport.annee_scolaire}</Text>}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: '#0D9E75' }]}>{(rapport.total_encaisse_annee ?? 0).toLocaleString('fr-FR')}</Text>
            <Text style={styles.kpiLbl}>FCFA encaissés</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: '#D94040' }]}>{(rapport.total_impaye_annee ?? 0).toLocaleString('fr-FR')}</Text>
            <Text style={styles.kpiLbl}>FCFA impayés</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiVal}>{(rapport.total_attendu ?? 0).toLocaleString('fr-FR')}</Text>
            <Text style={styles.kpiLbl}>FCFA attendus</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiVal}>{rapport.taux_recouvrement != null ? `${rapport.taux_recouvrement}%` : '—'}</Text>
            <Text style={styles.kpiLbl}>Recouvrement</Text>
          </View>
        </View>
        <Text style={styles.apprenantsTxt}>{rapport.nb_apprenants ?? 0} apprenant(s) suivi(s)</Text>

        <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportBtn} onPress={() => handleExporter('pdf')} disabled={exportEnCours !== null}>
            {exportEnCours === 'pdf' ? <ActivityIndicator size="small" color="#0B2545" /> : <FileDown size={16} color="#0B2545" />}
            <Text style={styles.exportBtnTxt}>Export PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={() => handleExporter('excel')} disabled={exportEnCours !== null}>
            {exportEnCours === 'excel' ? <ActivityIndicator size="small" color="#0B2545" /> : <FileSpreadsheet size={16} color="#0B2545" />}
            <Text style={styles.exportBtnTxt}>Export Excel</Text>
          </TouchableOpacity>
        </View>

        {!!rapport.repartition_moyens?.length && (
          <>
            <View style={styles.secHeader}>
              <ChartPie size={14} color="#888888" />
              <Text style={styles.sec}>Par moyen de paiement</Text>
            </View>
            <View style={styles.card}>
              {rapport.repartition_moyens.map((r) => (
                <View key={r.mode} style={styles.row}>
                  <Text style={styles.rowTxt}>{r.mode}</Text>
                  <Text style={styles.rowMontant}>{r.pourcentage}%</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {!!rapport.repartition_classes?.length && (
          <>
            <View style={styles.secHeader}>
              <ChartPie size={14} color="#888888" />
              <Text style={styles.sec}>Recouvrement par classe</Text>
            </View>
            <View style={styles.card}>
              {rapport.repartition_classes.map((c) => (
                <View key={c.nom} style={styles.row}>
                  <Text style={styles.rowTxt}>{c.nom} · {c.nb_apprenants} apprenant(s)</Text>
                  <Text style={styles.rowMontant}>{c.taux}%</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  sousTitre: { backgroundColor: '#0B2545', color: 'rgba(255,255,255,0.6)', fontSize: 12, textAlign: 'center', paddingBottom: 16 },
  content: { flex: 1, padding: 16 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  kpiCard: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, alignItems: 'center' },
  kpiVal: { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },
  kpiLbl: { fontSize: 9, color: '#888888', marginTop: 2, textAlign: 'center' },
  apprenantsTxt: { fontSize: 11, color: '#888888', textAlign: 'center', marginBottom: 16 },
  exportRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  exportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 10, paddingVertical: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  exportBtnTxt: { fontSize: 12, fontWeight: '700', color: '#0B2545' },
  secHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, marginTop: 6 },
  sec: { fontSize: 10, fontWeight: '700', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: 0.8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  rowTxt: { fontSize: 12, color: '#333333', flex: 1 },
  rowMontant: { fontSize: 12, fontWeight: '700', color: '#1A1A2E' },
});
