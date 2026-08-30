import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, CalendarClock } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getFraisApprenant } from '../../../services/api';
import BottomNavParent from '../../../components/BottomNavParent';

// Un seul enregistrement FraisApprenant par (apprenant, catégorie) — pas de
// tranches pré-créées : le fractionnement est calculé côté serveur à partir
// de nb_tranches_max / numero_tranche_suivante. Cf. payeur/frais_apprenant.blade.php sur main.
type FraisApprenant = {
  id: number;
  categorieFrais?: { nom?: string };
  montant_total: number;
  montant_paye: number;
  statut?: string;
  annee_scolaire?: string;
  fractionnable?: boolean;
  nb_tranches_max?: number;
  numero_tranche_suivante?: number;
  prochaine_echeance?: string;
};

const STATUT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  a_jour: { bg: '#E0F5EE', fg: '#085041', label: 'À jour' },
  regle: { bg: '#E0F5EE', fg: '#085041', label: 'Réglé' },
  partiel: { bg: '#FEF3DC', fg: '#8B5E10', label: 'Partiel' },
  impaye: { bg: '#FBEAEA', fg: '#9B2C2C', label: 'Impayé' },
  aucun_frais: { bg: '#F0F2F5', fg: '#666666', label: 'Aucun frais' },
};

function styleStatut(statut?: string) {
  return STATUT_STYLE[(statut || 'a_jour').toLowerCase()] || { bg: '#F0F2F5', fg: '#666666', label: statut || '—' };
}

export default function EcheancierScreen() {
  const router = useRouter();
  const { apprenantId } = useLocalSearchParams<{ apprenantId?: string }>();
  const { token, isLoading: authLoading } = useAuth();
  const [frais, setFrais] = useState<FraisApprenant[]>([]);
  const [nomApprenant, setNomApprenant] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/parent/LoginParentScreen');
      return;
    }
    if (token && apprenantId) chargerFrais();
  }, [token, authLoading, apprenantId]);

  const chargerFrais = async () => {
    setLoading(true);
    try {
      const response = await getFraisApprenant(Number(apprenantId));
      const data = response.data ?? response;
      setFrais(data.frais ?? (Array.isArray(data) ? data : []));
      setNomApprenant(data.apprenant ? `${data.apprenant.prenom} ${data.apprenant.nom}` : '');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || "Impossible de charger l'échéancier");
    } finally {
      setLoading(false);
    }
  };

  const payer = (f: FraisApprenant) => {
    const reste = f.montant_total - f.montant_paye;
    router.push({
      pathname: '/screens/parent/PaiementScreen',
      params: {
        fraisApprenantId: String(f.id),
        montant: String(reste),
        montantTranche: f.fractionnable && f.nb_tranches_max ? String(Math.round(reste / f.nb_tranches_max)) : '',
        libelle: f.categorieFrais?.nom || 'Frais scolaires',
        apprenantNom: nomApprenant,
      },
    });
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
        <Text style={styles.titre}>Échéancier</Text>
        <View style={{ width: 32 }} />
      </View>
      {!!nomApprenant && <Text style={styles.sousTitre}>{nomApprenant}</Text>}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {frais.length === 0 ? (
          <Text style={styles.vide}>Aucun frais enregistré pour cet apprenant.</Text>
        ) : (
          frais.map((f) => {
            const s = styleStatut(f.statut);
            const reste = f.montant_total - f.montant_paye;
            const pourcent = f.montant_total > 0 ? Math.round((f.montant_paye / f.montant_total) * 100) : 0;
            const estRegle = reste <= 0;
            return (
              <View key={f.id} style={styles.catCard}>
                <View style={styles.catHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.catNom}>{f.categorieFrais?.nom || 'Frais scolaires'}</Text>
                    {!!f.annee_scolaire && <Text style={styles.catAnnee}>{f.annee_scolaire}</Text>}
                  </View>
                  <View style={[styles.pill, { backgroundColor: s.bg }]}>
                    <Text style={[styles.pillTxt, { color: s.fg }]}>{s.label}</Text>
                  </View>
                </View>
                <Text style={styles.catMontant}>
                  {f.montant_paye.toLocaleString('fr-FR')} F payés sur {f.montant_total.toLocaleString('fr-FR')} F
                </Text>
                <View style={styles.prog}>
                  <View style={[styles.progFill, { width: `${Math.min(100, Math.max(0, pourcent))}%` }]} />
                </View>
                {!estRegle && (
                  <>
                    {!!f.prochaine_echeance && (
                      <View style={styles.echeanceRow}>
                        <CalendarClock size={12} color="#8B5E10" />
                        <Text style={styles.echeanceTxt}>Prochaine échéance : {f.prochaine_echeance.slice(0, 10)}</Text>
                      </View>
                    )}
                    <TouchableOpacity style={styles.btnPayer} onPress={() => payer(f)}>
                      <Text style={styles.btnPayerTxt}>Payer {reste.toLocaleString('fr-FR')} F →</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <BottomNavParent actif="accueil" />
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
  vide: { fontSize: 13, color: '#888888', textAlign: 'center', marginTop: 40 },
  catCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  catNom: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  catAnnee: { fontSize: 10, color: '#888888', marginTop: 2 },
  catMontant: { fontSize: 12, color: '#555555', marginBottom: 6 },
  prog: { height: 4, backgroundColor: '#EEEEEE', borderRadius: 2, marginBottom: 10 },
  progFill: { height: '100%', backgroundColor: '#0D9E75', borderRadius: 2 },
  echeanceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  echeanceTxt: { fontSize: 10, color: '#8B5E10' },
  pill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  pillTxt: { fontSize: 9, fontWeight: '700' },
  btnPayer: { backgroundColor: '#0D9E75', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  btnPayerTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
