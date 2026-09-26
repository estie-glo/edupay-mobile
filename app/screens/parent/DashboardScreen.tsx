import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, CreditCard, TriangleAlert } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getDashboard } from '../../../services/api';
import BottomNavParent from '../../../components/BottomNavParent';

// Forme exacte de GET /dashboard (DashboardController::index, vérifiée le 26/09/2026).
type Apprenant = {
  id: number;
  prenom: string;
  nom: string;
  classe?: string;
  etablissement?: { nom?: string };
  statut_paiement?: string;
  total_du: number;
  total_paye: number;
  a_impayes: boolean;
};

type Paiement = {
  id: number;
  montant: number;
  mode_paiement?: string;
  statut?: string;
  date_paiement?: string;
  apprenant?: { prenom?: string; nom?: string };
  frais?: { nom?: string };
};

type Dashboard = {
  apprenants: Apprenant[];
  total_du: number;
  total_paye: number;
  nb_enfants_dus: number;
  nb_recus: number;
  derniers_paiements: Paiement[];
  notifications_non_lues: { id: number }[];
};

const STATUT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  a_jour: { bg: '#E0F5EE', fg: '#085041', label: 'À jour' },
  regle: { bg: '#E0F5EE', fg: '#085041', label: 'À jour' },
  partiel: { bg: '#FEF3DC', fg: '#8B5E10', label: 'Partiel' },
  impaye: { bg: '#FBEAEA', fg: '#9B2C2C', label: 'Impayé' },
};

function styleStatut(statut?: string) {
  return STATUT_STYLE[(statut || 'a_jour').toLowerCase()] || { bg: '#F0F2F5', fg: '#666666', label: statut || '—' };
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/parent/LoginParentScreen');
      return;
    }
    if (token) chargerDashboard();
  }, [token, authLoading]);

  const chargerDashboard = async () => {
    setLoading(true);
    try {
      const response = await getDashboard();
      setDashboard(response.data ?? response);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger le tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboard) {
    return <ActivityIndicator size="large" color="#0D9E75" style={{ flex: 1 }} />;
  }

  const initiales = `${user?.prenom?.charAt(0) || ''}${user?.nom?.charAt(0) || ''}`.toUpperCase() || 'U';
  const nbNotifs = dashboard.notifications_non_lues?.length ?? 0;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>Edu<Text style={styles.logoAccent}>Pay</Text></Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/screens/parent/NotificationsScreen')}>
              <Bell size={20} color="#FFFFFF" />
              {nbNotifs > 0 && <View style={styles.notifBadge} />}
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{initiales}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.bonjour}>Bonjour, {user?.prenom || ''}</Text>
        <Text style={styles.sousTitre}>
          {dashboard.nb_enfants_dus > 0 ? `${dashboard.nb_enfants_dus} enfant${dashboard.nb_enfants_dus > 1 ? 's' : ''} avec un solde dû` : 'Tout est à jour'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* KPIs */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: '#D94040' }]}>{dashboard.total_du.toLocaleString('fr-FR')}</Text>
            <Text style={styles.kpiLbl}>FCFA dus</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: '#0D9E75' }]}>{dashboard.total_paye.toLocaleString('fr-FR')}</Text>
            <Text style={styles.kpiLbl}>FCFA payés</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiVal}>{dashboard.apprenants.length}</Text>
            <Text style={styles.kpiLbl}>Enfants suivis</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiVal}>{dashboard.nb_recus}</Text>
            <Text style={styles.kpiLbl}>Reçus PDF</Text>
          </View>
        </View>

        {/* Bouton payer */}
        <TouchableOpacity style={styles.payBtn} onPress={() => router.push('/screens/parent/EnfantsScreen')}>
          <CreditCard size={16} color="#FFFFFF" />
          <Text style={styles.payBtnTxt}>Effectuer un paiement →</Text>
        </TouchableOpacity>

        {/* Mes enfants */}
        <Text style={styles.sec}>Mes enfants</Text>
        {dashboard.apprenants.length === 0 ? (
          <TouchableOpacity style={styles.videCard} onPress={() => router.push('/screens/parent/EnfantsScreen')}>
            <Text style={styles.videTxt}>Rattacher un enfant →</Text>
          </TouchableOpacity>
        ) : (
          dashboard.apprenants.map((a) => {
            const s = styleStatut(a.statut_paiement);
            const total = a.total_du + a.total_paye;
            const pourcentPaye = total > 0 ? Math.round((a.total_paye / total) * 100) : 0;
            return (
              <View key={a.id} style={[styles.enfantCard, { borderLeftColor: s.fg }]}>
                <View style={styles.enfantTop}>
                  <View>
                    <Text style={styles.enfantNom}>{a.prenom} {a.nom}</Text>
                    <Text style={styles.enfantEcole}>{a.etablissement?.nom || '—'}{a.classe ? ` · ${a.classe}` : ''}</Text>
                  </View>
                  <View style={[styles.pill, { backgroundColor: s.bg }]}>
                    <Text style={[styles.pillTxt, { color: s.fg }]}>{s.label}</Text>
                  </View>
                </View>
                {a.total_du > 0 && (
                  <>
                    <Text style={styles.enfantReste}>
                      Reste : <Text style={{ fontWeight: '700' }}>{a.total_du.toLocaleString('fr-FR')} FCFA</Text>
                      {total > 0 ? ` sur ${total.toLocaleString('fr-FR')} FCFA` : ''}
                    </Text>
                    <View style={styles.prog}>
                      <View style={[styles.progFill, { width: `${Math.min(100, Math.max(0, pourcentPaye))}%` }]} />
                    </View>
                    <View style={styles.echeanceRow}>
                      {a.a_impayes && <TriangleAlert size={11} color="#D94040" />}
                      <Text style={[styles.enfantEcheance, a.a_impayes && { color: '#D94040' }]}>{pourcentPaye}% réglé</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.payEnfantBtn, a.a_impayes && { backgroundColor: '#D94040' }]}
                      onPress={() => router.push({ pathname: '/screens/parent/EcheancierScreen', params: { apprenantId: String(a.id) } })}
                    >
                      <Text style={styles.payEnfantBtnTxt}>{a.a_impayes ? 'Payer maintenant →' : 'Voir l\'échéancier →'}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            );
          })
        )}

        {/* Derniers paiements */}
        <View style={styles.secHeaderRow}>
          <Text style={styles.sec}>Derniers paiements</Text>
          <TouchableOpacity onPress={() => router.push('/screens/parent/HistoriqueScreen')}>
            <Text style={styles.voirTout}>Voir l'historique →</Text>
          </TouchableOpacity>
        </View>
        {dashboard.derniers_paiements.length === 0 ? (
          <Text style={styles.videTxt}>Aucun paiement récent.</Text>
        ) : (
          <View style={styles.card}>
            {dashboard.derniers_paiements.map((p) => (
              <View key={p.id} style={styles.row}>
                <View>
                  <Text style={styles.rowTitre}>{p.frais?.nom || 'Paiement'}</Text>
                  <Text style={styles.rowSub}>{(p.date_paiement || '').slice(0, 10)}{p.mode_paiement ? ` · ${p.mode_paiement}` : ''}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.rowMontant, { color: '#0D9E75' }]}>{p.montant.toLocaleString('fr-FR')} F</Text>
                  <View style={[styles.pill, { backgroundColor: '#E0F5EE' }]}>
                    <Text style={[styles.pillTxt, { color: '#085041' }]}>Validé</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      <BottomNavParent actif="accueil" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 48, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  logo: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  logoAccent: { color: '#5DCAA5' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifBtn: { position: 'relative' },
  notifBadge: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#D94040' },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#0D9E75', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  bonjour: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  sousTitre: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  content: { flex: 1, padding: 16 },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 14, marginTop: 4 },
  kpiCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 10, alignItems: 'center' },
  kpiVal: { fontSize: 14, fontWeight: '800', color: '#1A1A2E' },
  kpiLbl: { fontSize: 9, color: '#888888', marginTop: 2 },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0D9E75', borderRadius: 12, padding: 14, marginBottom: 20 },
  payBtnTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  sec: { fontSize: 10, fontWeight: '700', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  secHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  voirTout: { fontSize: 11, fontWeight: '700', color: '#0D9E75', marginBottom: 10 },
  videCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
  videTxt: { fontSize: 12, color: '#0D9E75', fontWeight: '600' },
  enfantCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 3 },
  enfantTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  enfantNom: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  enfantEcole: { fontSize: 11, color: '#888888', marginTop: 2 },
  enfantReste: { fontSize: 12, color: '#555555', marginBottom: 6 },
  prog: { height: 4, backgroundColor: '#EEEEEE', borderRadius: 2, marginBottom: 4 },
  progFill: { height: '100%', backgroundColor: '#0D9E75', borderRadius: 2 },
  echeanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  enfantEcheance: { fontSize: 10, color: '#888888' },
  payEnfantBtn: { backgroundColor: '#0D9E75', borderRadius: 8, padding: 10, alignItems: 'center' },
  payEnfantBtnTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  pill: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  pillTxt: { fontSize: 10, fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  rowTitre: { fontSize: 12, fontWeight: '600', color: '#1A1A2E' },
  rowSub: { fontSize: 10, color: '#888888', marginTop: 2 },
  rowMontant: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
});
