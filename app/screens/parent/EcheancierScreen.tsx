import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, CalendarClock } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getFraisApprenant } from '../../../services/api';
import BottomNavParent from '../../../components/BottomNavParent';
import Card from '../../../components/ui/Card';

// Champs exacts de FraisResource (vérifié le 28/09/2026) : PAS de
// `fractionnable`, `nb_tranches_max` ni `prochaine_echeance` — ces champs
// n'existent pas côté serveur. Le fractionnement se déduit de la présence
// d'échéances dans `echeanciers`, et la prochaine échéance se recalcule
// côté client à partir de `montant_paye` (même logique que PaiementScreen).
type Echeancier = { id: number; numero_tranche?: number; montant: number; date_echeance?: string; libelle?: string };
type FraisApprenant = {
  id: number;
  categorieFrais?: { nom?: string };
  montant_total: number;
  montant_paye: number;
  statut?: string;
  annee_scolaire?: string;
  echeanciers?: Echeancier[];
};

function prochaineEcheance(f: FraisApprenant): Echeancier | null {
  const echeanciers = [...(f.echeanciers ?? [])].sort((a, b) => (a.numero_tranche ?? 0) - (b.numero_tranche ?? 0));
  let dejaAffecte = f.montant_paye;
  for (const e of echeanciers) {
    if (dejaAffecte >= e.montant) dejaAffecte -= e.montant;
    else return e;
  }
  return null;
}

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
  const { apprenantId, apprenantNom } = useLocalSearchParams<{ apprenantId?: string; apprenantNom?: string }>();
  const { token, isLoading: authLoading } = useAuth();
  const [frais, setFrais] = useState<FraisApprenant[]>([]);
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
      setFrais(Array.isArray(data) ? data : data.frais ?? []);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || "Impossible de charger l'échéancier");
    } finally {
      setLoading(false);
    }
  };

  // PaiementScreen recalcule lui-même le montant exact (intégral et tranche)
  // depuis GET /frais-apprenants/{id} — on ne transmet ici que l'identifiant
  // du dossier, jamais un montant deviné côté client (audit 28/09/2026).
  const payer = (f: FraisApprenant) => {
    router.push({
      pathname: '/screens/parent/PaiementScreen',
      params: {
        fraisApprenantId: String(f.id),
        libelle: f.categorieFrais?.nom || 'Frais scolaires',
        apprenantNom: apprenantNom,
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
      {!!apprenantNom && <Text style={styles.sousTitre}>{apprenantNom}</Text>}

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
              <Card key={f.id} style={styles.catCard}>
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
                    {!!prochaineEcheance(f)?.date_echeance && (
                      <View style={styles.echeanceRow}>
                        <CalendarClock size={12} color="#8B5E10" />
                        <Text style={styles.echeanceTxt}>Prochaine échéance : {prochaineEcheance(f)!.date_echeance!.slice(0, 10)}</Text>
                      </View>
                    )}
                    <TouchableOpacity style={styles.btnPayer} onPress={() => payer(f)}>
                      <Text style={styles.btnPayerTxt}>Payer {reste.toLocaleString('fr-FR')} F →</Text>
                    </TouchableOpacity>
                  </>
                )}
              </Card>
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
  catCard: { padding: 14, marginBottom: 12 },
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
