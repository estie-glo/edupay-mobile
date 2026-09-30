import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, CreditCard, Search } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getPaiementsEcole } from '../../../services/api';
import Card from '../../../components/ui/Card';

// Filtres alignés sur Api/Etablissement/PaiementController::index (q, statut) —
// vérifiés le 26/09/2026. Pas de filtre mode_paiement ni de totaux côté API :
// à demander à Steve si la parité avec la page web (qui les affiche) est requise.
type Paiement = {
  id: number;
  reference?: string;
  montant: number;
  mode_paiement?: string;
  statut?: string;
  date_paiement?: string;
  apprenant?: { prenom?: string; nom?: string; classe?: string };
  frais?: { nom?: string };
};

const STATUTS = [
  { valeur: '', label: 'Tous' },
  { valeur: 'valide', label: 'Validé' },
  { valeur: 'en_attente', label: 'En attente' },
  { valeur: 'echoue', label: 'Échoué' },
  { valeur: 'rembourse', label: 'Remboursé' },
];

const STATUT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  valide: { bg: '#E0F5EE', fg: '#085041', label: 'Validé' },
  rembourse: { bg: '#FEF3DC', fg: '#8B5E10', label: 'Remboursé' },
  echoue: { bg: '#FBEAEA', fg: '#9B2C2C', label: 'Échoué' },
  en_attente: { bg: '#FEF3DC', fg: '#8B5E10', label: 'En attente' },
};

function styleStatut(statut?: string) {
  return STATUT_STYLE[(statut || '').toLowerCase()] || { bg: '#F0F2F5', fg: '#666666', label: statut || '—' };
}

export default function EcolePaiementsScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlus, setLoadingPlus] = useState(false);
  const [page, setPage] = useState(1);
  const [dernierePage, setDernierePage] = useState(1);
  const [recherche, setRecherche] = useState('');
  const [statut, setStatut] = useState('');

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/ecole/LoginEcoleScreen');
      return;
    }
    if (token) charger(1);
  }, [token, authLoading]);

  const charger = async (pageAcharger: number, recherecheActuelle = recherche, statutActuel = statut) => {
    if (pageAcharger === 1) setLoading(true);
    else setLoadingPlus(true);
    try {
      const response = await getPaiementsEcole(pageAcharger, { q: recherecheActuelle || undefined, statut: statutActuel || undefined });
      const items: Paiement[] = response.data ?? [];
      setPaiements((prev) => (pageAcharger === 1 ? items : [...prev, ...items]));
      setDernierePage(response.meta?.last_page ?? pageAcharger);
      setPage(pageAcharger);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger les paiements');
    } finally {
      setLoading(false);
      setLoadingPlus(false);
    }
  };

  const lancerRecherche = () => charger(1, recherche, statut);
  const changerStatut = (v: string) => {
    setStatut(v);
    charger(1, recherche, v);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.titreRow}>
          <CreditCard size={18} color="#FFFFFF" />
          <Text style={styles.titre}>Paiements</Text>
        </View>
      </View>

      <View style={styles.filtres}>
        <View style={styles.rechercheBox}>
          <Search size={14} color="#AAAAAA" />
          <TextInput
            style={styles.rechercheInput}
            placeholder="Référence, nom ou prénom..."
            placeholderTextColor="#AAAAAA"
            value={recherche}
            onChangeText={setRecherche}
            onSubmitEditing={lancerRecherche}
            returnKeyType="search"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statutsRow}>
          {STATUTS.map((s) => (
            <TouchableOpacity key={s.valeur} style={[styles.chip, statut === s.valeur && styles.chipActive]} onPress={() => changerStatut(s.valeur)}>
              <Text style={[styles.chipTxt, statut === s.valeur && styles.chipTxtActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E8A020" style={{ flex: 1 }} />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {paiements.length === 0 ? (
            <Text style={styles.vide}>Aucun paiement ne correspond à ces critères.</Text>
          ) : (
            paiements.map((p) => {
              const s = styleStatut(p.statut);
              return (
                <Card key={p.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nom}>{p.apprenant?.prenom} {p.apprenant?.nom}</Text>
                      <Text style={styles.sousTitre}>{p.frais?.nom || '—'}{p.apprenant?.classe ? ` · ${p.apprenant.classe}` : ''}</Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: s.bg }]}>
                      <Text style={[styles.pillTxt, { color: s.fg }]}>{s.label}</Text>
                    </View>
                  </View>
                  <View style={styles.cardBottom}>
                    <Text style={styles.montant}>{(p.montant ?? 0).toLocaleString('fr-FR')} FCFA</Text>
                    <Text style={styles.mode}>{p.mode_paiement || '—'} · {p.reference || '—'}</Text>
                  </View>
                </Card>
              );
            })
          )}

          {page < dernierePage && (
            <TouchableOpacity style={styles.btnPlus} onPress={() => charger(page + 1)} disabled={loadingPlus}>
              {loadingPlus ? <ActivityIndicator color="#E8A020" /> : <Text style={styles.btnPlusTxt}>Charger plus</Text>}
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titre: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  filtres: { backgroundColor: '#0B2545', paddingHorizontal: 20, paddingBottom: 16, gap: 10 },
  rechercheBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  rechercheInput: { flex: 1, fontSize: 13, color: '#1A1A2E' },
  statutsRow: { flexDirection: 'row' },
  chip: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6 },
  chipActive: { backgroundColor: '#E8A020' },
  chipTxt: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  chipTxtActive: { color: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  vide: { fontSize: 13, color: '#888888', textAlign: 'center', marginTop: 40 },
  card: { padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  nom: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  sousTitre: { fontSize: 11, color: '#888888', marginTop: 2 },
  pill: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  pillTxt: { fontSize: 10, fontWeight: '700' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  montant: { fontSize: 13, fontWeight: '800', color: '#1A1A2E' },
  mode: { fontSize: 11, color: '#888888' },
  btnPlus: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  btnPlusTxt: { color: '#E8A020', fontSize: 13, fontWeight: '700' },
});
