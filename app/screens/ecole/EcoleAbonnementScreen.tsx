import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, CheckCircle2, Crown, MessageCircle } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getAbonnement } from '../../../services/api';

// Forme exacte de DashboardController::abonnement (vérifiée le 26/09/2026).
// Aucune route de changement de plan côté API : le CTA renvoie vers le
// formulaire de contact, il n'existe pas de souscription en self-service.
type Abonnement = {
  statut?: string;
  plan?: string;
  plan_nom?: string;
  date_fin?: string;
  grace_period_fin?: string;
  est_actif?: boolean;
  en_grace_period?: boolean;
  jours_restants?: number;
};

type Plan = {
  slug: string;
  nom: string;
  montant: number;
  max_apprenants: number | null;
  sms_mensuel: number | null;
  multi_sites: boolean;
  exports_cobac: boolean;
  actuel: boolean;
};

export default function EcoleAbonnementScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [abonnement, setAbonnement] = useState<Abonnement | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

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
      const reponse = await getAbonnement();
      const d = reponse.data ?? reponse;
      setAbonnement(d.abonnement || null);
      setPlans(d.plans || []);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || "Impossible de charger l'abonnement");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#E8A020" style={{ flex: 1 }} />;
  }

  const enGrace = !!abonnement?.en_grace_period;
  const actif = !!abonnement?.est_actif && !enGrace;
  const expireOuAbsent = !abonnement || (!abonnement.est_actif && !enGrace);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Crown size={18} color="#FFFFFF" />
        <Text style={styles.titre}>Abonnement</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {actif && (
          <View style={styles.statutCardActif}>
            <CheckCircle2 size={22} color="#0D9E75" />
            <View style={{ flex: 1 }}>
              <Text style={styles.statutTitreActif}>Formule {abonnement?.plan_nom} active</Text>
              <Text style={styles.statutSousTitre}>
                {abonnement?.jours_restants != null ? `${abonnement.jours_restants} jour(s) restants` : ''}{abonnement?.date_fin ? ` · renouvellement le ${abonnement.date_fin}` : ''}
              </Text>
            </View>
          </View>
        )}

        {enGrace && (
          <View style={styles.statutCardGrace}>
            <AlertTriangle size={22} color="#8B5E10" />
            <View style={{ flex: 1 }}>
              <Text style={styles.statutTitreGrace}>Période de grâce — Formule {abonnement?.plan_nom}</Text>
              <Text style={styles.statutSousTitre}>Votre abonnement a expiré. Accès maintenu jusqu'au {abonnement?.grace_period_fin || '—'}.</Text>
            </View>
          </View>
        )}

        {expireOuAbsent && !enGrace && (
          <View style={styles.statutCardExpire}>
            <AlertTriangle size={22} color="#9B2C2C" />
            <View style={{ flex: 1 }}>
              <Text style={styles.statutTitreExpire}>Aucun abonnement actif</Text>
              <Text style={styles.statutSousTitre}>Choisissez une formule ci-dessous pour continuer à utiliser EduPay sans interruption.</Text>
            </View>
          </View>
        )}

        <Text style={styles.secLabel}>FORMULES DISPONIBLES</Text>
        {plans.map((p) => (
          <View key={p.slug} style={[styles.planCard, p.actuel && styles.planCardActuel]}>
            <View style={styles.planTop}>
              <Text style={styles.planNom}>{p.nom}</Text>
              {p.actuel && (
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeTxt}>Formule actuelle</Text>
                </View>
              )}
            </View>
            <Text style={styles.planPrix}>{p.montant.toLocaleString('fr-FR')} FCFA<Text style={styles.planPeriode}>/an</Text></Text>
            <View style={styles.planFeatures}>
              <Text style={styles.planFeature}>• {p.max_apprenants ? `${p.max_apprenants} apprenants max` : 'Apprenants illimités'}</Text>
              {!!p.sms_mensuel && <Text style={styles.planFeature}>• {p.sms_mensuel} SMS/mois inclus</Text>}
              <Text style={styles.planFeature}>• Multi-sites {p.multi_sites ? 'inclus' : 'non inclus'}</Text>
              <Text style={styles.planFeature}>• Exports COBAC {p.exports_cobac ? 'inclus' : 'non inclus'}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.btnContact} onPress={() => router.push('/screens/commun/ContactScreen')}>
          <MessageCircle size={16} color="#FFFFFF" />
          <Text style={styles.btnContactTxt}>Contacter EduPay pour changer de formule</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10 },
  titre: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  statutCardActif: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#E0F5EE', borderRadius: 12, padding: 16, marginBottom: 20 },
  statutTitreActif: { fontSize: 14, fontWeight: '800', color: '#085041' },
  statutCardGrace: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FEF3DC', borderRadius: 12, padding: 16, marginBottom: 20 },
  statutTitreGrace: { fontSize: 14, fontWeight: '800', color: '#8B5E10' },
  statutCardExpire: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FBEAEA', borderRadius: 12, padding: 16, marginBottom: 20 },
  statutTitreExpire: { fontSize: 14, fontWeight: '800', color: '#9B2C2C' },
  statutSousTitre: { fontSize: 12, color: '#555555', marginTop: 4, lineHeight: 16 },
  secLabel: { fontSize: 10, fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  planCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#E2E8F0' },
  planCardActuel: { borderColor: '#E8A020' },
  planTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  planNom: { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },
  planBadge: { backgroundColor: '#FEF3DC', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  planBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#8B5E10' },
  planPrix: { fontSize: 18, fontWeight: '800', color: '#E8A020', marginBottom: 10 },
  planPeriode: { fontSize: 12, fontWeight: '600', color: '#AAAAAA' },
  planFeatures: { gap: 4 },
  planFeature: { fontSize: 12, color: '#555555' },
  btnContact: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0B2545', paddingVertical: 14, borderRadius: 12, marginTop: 12 },
  btnContactTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
