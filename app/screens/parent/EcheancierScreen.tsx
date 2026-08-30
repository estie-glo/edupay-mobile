import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, CalendarClock, CircleCheck } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getFraisApprenant } from '../../../services/api';
import BottomNavParent from '../../../components/BottomNavParent';

type Tranche = {
  id: number;
  libelle?: string;
  montant: number;
  date_echeance?: string;
  statut?: string;
};

type CategorieFrais = {
  id: number;
  nom?: string;
  libelle?: string;
  montant_total?: number;
  tranches?: Tranche[];
};

const STATUT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  paye: { bg: '#E0F5EE', fg: '#085041', label: 'Payé' },
  du: { bg: '#FEF3DC', fg: '#8B5E10', label: 'À payer' },
  en_retard: { bg: '#FBEAEA', fg: '#9B2C2C', label: 'En retard' },
};

function styleStatut(statut?: string) {
  return STATUT_STYLE[(statut || 'du').toLowerCase()] || { bg: '#F0F2F5', fg: '#666666', label: statut || '—' };
}

export default function EcheancierScreen() {
  const router = useRouter();
  const { apprenantId } = useLocalSearchParams<{ apprenantId?: string }>();
  const { token, isLoading: authLoading } = useAuth();
  const [categories, setCategories] = useState<CategorieFrais[]>([]);
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
      setCategories(data.categories ?? data.frais ?? (Array.isArray(data) ? data : []));
      setNomApprenant(data.apprenant ? `${data.apprenant.prenom} ${data.apprenant.nom}` : '');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || "Impossible de charger l'échéancier");
    } finally {
      setLoading(false);
    }
  };

  const payerTranche = (categorie: CategorieFrais, tranche: Tranche) => {
    router.push({
      pathname: '/screens/parent/PaiementScreen',
      params: {
        apprenantId: String(apprenantId),
        categorieFraisId: String(categorie.id),
        echeancierId: String(tranche.id),
        montant: String(tranche.montant),
        typePaiement: 'tranche',
        libelle: `${categorie.nom || categorie.libelle || 'Frais'} — ${tranche.libelle || ''}`,
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
        {categories.length === 0 ? (
          <Text style={styles.vide}>Aucun frais enregistré pour cet apprenant.</Text>
        ) : (
          categories.map((cat) => (
            <View key={cat.id} style={styles.catCard}>
              <View style={styles.catHeader}>
                <Text style={styles.catNom}>{cat.nom || cat.libelle || 'Frais scolaires'}</Text>
                {cat.montant_total != null && (
                  <Text style={styles.catMontant}>{cat.montant_total.toLocaleString('fr-FR')} FCFA</Text>
                )}
              </View>
              {(cat.tranches ?? []).map((tranche) => {
                const s = styleStatut(tranche.statut);
                const estPaye = (tranche.statut || '').toLowerCase() === 'paye';
                return (
                  <View key={tranche.id} style={styles.trancheRow}>
                    <View style={styles.trancheIco}>
                      {estPaye ? <CircleCheck size={18} color="#0D9E75" /> : <CalendarClock size={18} color="#8B5E10" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.trancheLibelle}>{tranche.libelle || 'Tranche'}</Text>
                      {!!tranche.date_echeance && <Text style={styles.trancheDate}>Échéance : {tranche.date_echeance.slice(0, 10)}</Text>}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.trancheMontant}>{tranche.montant.toLocaleString('fr-FR')} F</Text>
                      {estPaye ? (
                        <View style={[styles.pill, { backgroundColor: s.bg }]}>
                          <Text style={[styles.pillTxt, { color: s.fg }]}>{s.label}</Text>
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.btnPayer} onPress={() => payerTranche(cat, tranche)}>
                          <Text style={styles.btnPayerTxt}>Payer</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ))
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
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catNom: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  catMontant: { fontSize: 12, color: '#888888' },
  trancheRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F0F2F5' },
  trancheIco: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F5F6F7', alignItems: 'center', justifyContent: 'center' },
  trancheLibelle: { fontSize: 12, fontWeight: '600', color: '#1A1A2E' },
  trancheDate: { fontSize: 10, color: '#888888', marginTop: 2 },
  trancheMontant: { fontSize: 12, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  pill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  pillTxt: { fontSize: 9, fontWeight: '700' },
  btnPayer: { backgroundColor: '#0D9E75', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  btnPayerTxt: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
});
