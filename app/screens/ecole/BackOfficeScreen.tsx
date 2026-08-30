import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertCircle, Building2, LogOut, Megaphone } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { envoyerRelanceGroupee, getDashboardEcole, getImpayes } from '../../../services/api';

type Impaye = {
  id: number;
  apprenant?: { prenom?: string; nom?: string };
  montant: number;
  classe?: string;
};

type DashboardEcole = {
  nom_etablissement?: string;
  total_encaisse?: number;
  total_impaye?: number;
  nb_apprenants?: number;
  nb_paiements_mois?: number;
};

export default function BackOfficeScreen() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, signOut } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardEcole | null>(null);
  const [impayes, setImpayes] = useState<Impaye[]>([]);
  const [loading, setLoading] = useState(true);
  const [envoiRelance, setEnvoiRelance] = useState(false);

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/ecole/LoginEcoleScreen');
      return;
    }
    if (token) chargerDonnees();
  }, [token, authLoading]);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const [dashRes, impRes] = await Promise.all([getDashboardEcole(), getImpayes()]);
      setDashboard(dashRes.data ?? dashRes);
      const impayesData = impRes.data ?? impRes;
      setImpayes((Array.isArray(impayesData) ? impayesData : impayesData.data ?? []).slice(0, 5));
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger le back-office');
    } finally {
      setLoading(false);
    }
  };

  const handleRelanceGroupee = () => {
    if (impayes.length === 0) return;
    Alert.alert(
      'Envoyer une relance groupée ?',
      `Un SMS sera envoyé aux familles des ${impayes.length} apprenants en impayé affichés.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer',
          onPress: async () => {
            setEnvoiRelance(true);
            try {
              await envoyerRelanceGroupee({ filtre: {}, message: 'Rappel : des frais scolaires restent impayés. Merci de régulariser votre situation sur EduPay.' });
              Alert.alert('Envoyé', 'La relance groupée a été envoyée.');
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.message || "Échec de l'envoi de la relance");
            } finally {
              setEnvoiRelance(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !dashboard) {
    return <ActivityIndicator size="large" color="#E8A020" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitreRow}>
            <Building2 size={18} color="#FFFFFF" />
            <Text style={styles.titre}>{dashboard.nom_etablissement || 'Back-office'}</Text>
          </View>
          <TouchableOpacity onPress={signOut}>
            <LogOut size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.sousTitre}>{user?.prenom} {user?.nom}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: '#0D9E75' }]}>{(dashboard.total_encaisse ?? 0).toLocaleString('fr-FR')}</Text>
            <Text style={styles.kpiLbl}>FCFA encaissés</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: '#D94040' }]}>{(dashboard.total_impaye ?? 0).toLocaleString('fr-FR')}</Text>
            <Text style={styles.kpiLbl}>FCFA impayés</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiVal}>{dashboard.nb_apprenants ?? 0}</Text>
            <Text style={styles.kpiLbl}>Apprenants</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiVal}>{dashboard.nb_paiements_mois ?? 0}</Text>
            <Text style={styles.kpiLbl}>Paiements/mois</Text>
          </View>
        </View>

        <View style={styles.secHeader}>
          <Text style={styles.sec}>Impayés récents</Text>
          {impayes.length > 0 && (
            <TouchableOpacity style={styles.relanceBtn} onPress={handleRelanceGroupee} disabled={envoiRelance}>
              {envoiRelance ? <ActivityIndicator size="small" color="#E8A020" /> : <Megaphone size={13} color="#E8A020" />}
              <Text style={styles.relanceTxt}>Relance groupée</Text>
            </TouchableOpacity>
          )}
        </View>

        {impayes.length === 0 ? (
          <Text style={styles.vide}>Aucun impayé pour le moment.</Text>
        ) : (
          <View style={styles.card}>
            {impayes.map((imp) => (
              <View key={imp.id} style={styles.row}>
                <View style={styles.rowIco}>
                  <AlertCircle size={16} color="#D94040" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitre}>{imp.apprenant ? `${imp.apprenant.prenom} ${imp.apprenant.nom}` : 'Apprenant'}</Text>
                  {!!imp.classe && <Text style={styles.rowSub}>{imp.classe}</Text>}
                </View>
                <Text style={styles.rowMontant}>{imp.montant.toLocaleString('fr-FR')} F</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  headerTitreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  titre: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', flexShrink: 1 },
  sousTitre: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  content: { flex: 1, padding: 16 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20, marginTop: 4 },
  kpiCard: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, alignItems: 'center' },
  kpiVal: { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },
  kpiLbl: { fontSize: 9, color: '#888888', marginTop: 2, textAlign: 'center' },
  secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sec: { fontSize: 10, fontWeight: '700', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: 0.8 },
  relanceBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEF3DC', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  relanceTxt: { fontSize: 10, fontWeight: '700', color: '#8B5E10' },
  vide: { fontSize: 12, color: '#888888', textAlign: 'center', marginTop: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  rowIco: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#FBEAEA', alignItems: 'center', justifyContent: 'center' },
  rowTitre: { fontSize: 12, fontWeight: '600', color: '#1A1A2E' },
  rowSub: { fontSize: 10, color: '#888888', marginTop: 2 },
  rowMontant: { fontSize: 13, fontWeight: '700', color: '#D94040' },
});
