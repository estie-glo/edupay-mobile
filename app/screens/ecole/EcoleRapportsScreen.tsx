import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, ChartPie, FileDown, FileSpreadsheet } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getRapports } from '../../../services/api';
import { telechargerEtPartager } from '../../../services/fichiers';

type Repartition = { libelle: string; montant: number };

type Rapport = {
  total_encaisse?: number;
  total_impaye?: number;
  nb_paiements?: number;
  taux_recouvrement?: number;
  par_categorie?: Repartition[];
  par_mode_paiement?: Repartition[];
};

// Chemins d'export non confirmés par le backend (la doc mentionne "export PDF"
// et "export CSV" sans donner la route exacte) : on réutilise /etablissement/rapports
// avec un paramètre format, à ajuster si le backend expose une route dédiée.
export default function EcoleRapportsScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportEnCours, setExportEnCours] = useState<'pdf' | 'csv' | null>(null);

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

  const handleExporter = async (format: 'pdf' | 'csv') => {
    setExportEnCours(format);
    try {
      const nomFichier = `rapport-edupay-${new Date().toISOString().slice(0, 10)}.${format}`;
      await telechargerEtPartager(`/etablissement/rapports?format=${format}`, nomFichier);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || `Export ${format.toUpperCase()} impossible pour le moment`);
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: '#0D9E75' }]}>{(rapport.total_encaisse ?? 0).toLocaleString('fr-FR')}</Text>
            <Text style={styles.kpiLbl}>FCFA encaissés</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: '#D94040' }]}>{(rapport.total_impaye ?? 0).toLocaleString('fr-FR')}</Text>
            <Text style={styles.kpiLbl}>FCFA impayés</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiVal}>{rapport.nb_paiements ?? 0}</Text>
            <Text style={styles.kpiLbl}>Paiements</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiVal}>{rapport.taux_recouvrement != null ? `${rapport.taux_recouvrement}%` : '—'}</Text>
            <Text style={styles.kpiLbl}>Recouvrement</Text>
          </View>
        </View>

        <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportBtn} onPress={() => handleExporter('pdf')} disabled={exportEnCours !== null}>
            {exportEnCours === 'pdf' ? <ActivityIndicator size="small" color="#0B2545" /> : <FileDown size={16} color="#0B2545" />}
            <Text style={styles.exportBtnTxt}>Export PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={() => handleExporter('csv')} disabled={exportEnCours !== null}>
            {exportEnCours === 'csv' ? <ActivityIndicator size="small" color="#0B2545" /> : <FileSpreadsheet size={16} color="#0B2545" />}
            <Text style={styles.exportBtnTxt}>Export CSV</Text>
          </TouchableOpacity>
        </View>

        {!!rapport.par_categorie?.length && (
          <>
            <View style={styles.secHeader}>
              <ChartPie size={14} color="#888888" />
              <Text style={styles.sec}>Par catégorie de frais</Text>
            </View>
            <View style={styles.card}>
              {rapport.par_categorie.map((r) => (
                <View key={r.libelle} style={styles.row}>
                  <Text style={styles.rowTxt}>{r.libelle}</Text>
                  <Text style={styles.rowMontant}>{r.montant.toLocaleString('fr-FR')} F</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {!!rapport.par_mode_paiement?.length && (
          <>
            <View style={styles.secHeader}>
              <ChartPie size={14} color="#888888" />
              <Text style={styles.sec}>Par moyen de paiement</Text>
            </View>
            <View style={styles.card}>
              {rapport.par_mode_paiement.map((r) => (
                <View key={r.libelle} style={styles.row}>
                  <Text style={styles.rowTxt}>{r.libelle}</Text>
                  <Text style={styles.rowMontant}>{r.montant.toLocaleString('fr-FR')} F</Text>
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
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  kpiCard: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, alignItems: 'center' },
  kpiVal: { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },
  kpiLbl: { fontSize: 9, color: '#888888', marginTop: 2, textAlign: 'center' },
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
