import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { ArrowLeft, History, ShieldCheck, Smartphone } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getFraisApprenantDetail, initierPaiement } from '../../../services/api';
import Card from '../../../components/ui/Card';
import PrimaryButton from '../../../components/ui/PrimaryButton';

type ModePaiement = 'mtn_momo' | 'orange_money';

type PaiementPrecedent = { id: number; reference?: string; montant: number; statut?: string; mode_paiement?: string; date_paiement?: string };
type Echeancier = { id: number; numero_tranche?: number; montant: number; date_echeance?: string; libelle?: string };
type FraisDetail = { montant_total: number; montant_paye: number; reste: number; echeanciers?: Echeancier[]; paiements?: PaiementPrecedent[] };

export default function PaiementScreen() {
  usePreventScreenCapture(); // montant et MSISDN visibles à l'écran (audit point 10, 28/09/2026)
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  // Le seul paramètre financier fiable est fraisApprenantId — tout le reste
  // (montant, tranche) est recalculé depuis GET /frais-apprenants/{id}, jamais
  // fait confiance à une valeur passée par deep link (audit 27/09/2026).
  const params = useLocalSearchParams<{
    fraisApprenantId?: string;
    libelle?: string;
    apprenantNom?: string;
  }>();

  const [modePaiement, setModePaiement] = useState<ModePaiement>('mtn_momo');
  const [typePaiement, setTypePaiement] = useState<'integral' | 'tranche'>('integral');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [chargementDetail, setChargementDetail] = useState(true);
  const [detail, setDetail] = useState<FraisDetail | null>(null);
  // Distingue "jamais chargé faute de paramètre" d'un vrai échec réseau : dans
  // ce dernier cas on ne doit ni deviner un montant, ni masquer silencieusement
  // l'historique anti-double-paiement (audit point 6, 28/09/2026) — on bloque
  // le paiement et on propose de réessayer plutôt que de continuer à l'aveugle.
  const [erreurChargement, setErreurChargement] = useState(false);
  const enVolDePaiement = useRef(false);

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/parent/LoginParentScreen');
    }
  }, [token, authLoading]);

  // Équivalent web /paiement/{fraisApprenant} (Api\FraisController::show) :
  // seule source de vérité pour le montant, le reste dû, les échéances et
  // les paiements déjà tentés sur ce dossier. Sans ce chargement, impossible
  // d'afficher un montant de tranche fiable ni l'historique anti-doublon.
  const chargerDetail = () => {
    if (!params.fraisApprenantId) {
      setChargementDetail(false);
      return;
    }
    setChargementDetail(true);
    setErreurChargement(false);
    getFraisApprenantDetail(Number(params.fraisApprenantId))
      .then((r) => setDetail(r.data ?? r))
      .catch(() => { setDetail(null); setErreurChargement(true); })
      .finally(() => setChargementDetail(false));
  };

  useEffect(chargerDetail, [params.fraisApprenantId]);

  if (!token || authLoading || chargementDetail) {
    return <ActivityIndicator size="large" color="#0D9E75" style={{ flex: 1 }} />;
  }

  const donneesIncompletes = !params.fraisApprenantId || !detail;

  if (donneesIncompletes) {
    return (
      <View style={styles.videContainer}>
        <Text style={styles.videTitre}>{erreurChargement ? 'Historique indisponible' : "Choisissez d'abord une échéance"}</Text>
        <Text style={styles.videDesc}>
          {erreurChargement
            ? "Impossible de vérifier le montant exact et les paiements déjà effectués sur ce dossier. Vérifiez votre connexion avant de payer — ne réessayez pas sans être sûr·e de ne pas payer deux fois."
            : 'Sélectionnez un enfant puis le frais à payer depuis son échéancier.'}
        </Text>
        <PrimaryButton
          title={erreurChargement ? 'Réessayer' : 'Voir mes enfants →'}
          onPress={() => (erreurChargement ? chargerDetail() : router.push('/screens/parent/EnfantsScreen'))}
        />
      </View>
    );
  }

  const montantIntegral = detail.reste;
  const paiementsPrecedents = detail.paiements ?? [];

  // Reconstruit la même règle que App\Support\MontantPaiement côté serveur :
  // la prochaine échéance non couverte par le montant déjà payé, plafonnée au
  // reste dû. Approximation à partir de l'agrégat montant_paye (l'API ne
  // détaille pas le paiement par tranche individuelle côté payeur) — correcte
  // dès que les tranches sont réglées dans l'ordre, ce qui est le cas normal.
  const echeanciers = [...(detail.echeanciers ?? [])].sort((a, b) => (a.numero_tranche ?? 0) - (b.numero_tranche ?? 0));
  let montantDejaAffecte = detail.montant_paye;
  let prochaineEcheance: Echeancier | null = null;
  for (const e of echeanciers) {
    if (montantDejaAffecte >= e.montant) {
      montantDejaAffecte -= e.montant;
    } else {
      prochaineEcheance = e;
      break;
    }
  }
  const montantTranche = prochaineEcheance ? Math.min(prochaineEcheance.montant, detail.reste) : null;
  const montant = typePaiement === 'tranche' && montantTranche ? montantTranche : montantIntegral;

  const handlePayer = async () => {
    if (enVolDePaiement.current) return; // garde synchrone anti-double-tap, avant même le re-render de `loading`
    if (!telephone) {
      Alert.alert('Erreur', 'Veuillez saisir votre numéro Mobile Money');
      return;
    }
    enVolDePaiement.current = true;
    setLoading(true);
    try {
      const response = await initierPaiement({
        frais_apprenant_id: Number(params.fraisApprenantId),
        mode_paiement: modePaiement,
        type_paiement: typePaiement,
        echeancier_id: typePaiement === 'tranche' ? prochaineEcheance?.id : undefined,
        telephone,
      });
      // POST /paiements/{id}/verifier (le polling de PaiementSuccessScreen) ne
      // renvoie jamais apprenant/montant/mode/date/frais_service — seulement
      // {statut}. Le web s'en sort car sa page "en attente" les a déjà rendus
      // côté serveur au chargement ; le mobile n'a pas cet équivalent, donc on
      // transmet ici l'instantané renvoyé par /paiements/initier (audit 29/09/2026).
      const paiementInitial = response.paiement ?? response.data?.paiement;
      router.push({
        pathname: '/screens/parent/PaiementSuccessScreen',
        params: {
          paiementId: String(response.paiement_id ?? response.data?.paiement_id ?? ''),
          reference: paiementInitial?.reference,
          apprenantNom: paiementInitial?.apprenant ? `${paiementInitial.apprenant.prenom} ${paiementInitial.apprenant.nom}` : params.apprenantNom,
          montant: paiementInitial?.montant != null ? String(paiementInitial.montant) : undefined,
          fraisService: paiementInitial?.frais_service != null ? String(paiementInitial.frais_service) : undefined,
          montantTotalPaye: paiementInitial?.montant_total_paye != null ? String(paiementInitial.montant_total_paye) : undefined,
          modePaiement: paiementInitial?.mode_paiement,
          datePaiement: paiementInitial?.date_paiement,
        },
      });
    } catch (error: any) {
      Alert.alert('Erreur de paiement', error.response?.data?.message || "Le paiement n'a pas pu être initié");
    } finally {
      setLoading(false);
      enVolDePaiement.current = false;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.titre}>Effectuer un paiement</Text>
        <View style={styles.tlsRow}>
          <ShieldCheck size={13} color="rgba(255,255,255,0.6)" />
          <Text style={styles.tls}>TLS 1.3</Text>
        </View>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Card style={styles.resumeCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.resumeLabel}>Paiement pour</Text>
            <Text style={styles.resumeNom}>{params.apprenantNom || 'Apprenant'}</Text>
            <Text style={styles.resumeEcole}>{params.libelle || ''}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.resumeMontant}>{montant.toLocaleString('fr-FR')}</Text>
            <Text style={styles.resumeDevise}>FCFA</Text>
          </View>
        </Card>

        {paiementsPrecedents.length > 0 && (
          <View style={styles.precedentsBox}>
            <View style={styles.precedentsHeader}>
              <History size={13} color="#8B5E10" />
              <Text style={styles.precedentsTitre}>Paiements déjà effectués sur ce dossier</Text>
            </View>
            {paiementsPrecedents.map((p) => (
              <Text key={p.id} style={styles.precedentLigne}>
                • {(p.montant ?? 0).toLocaleString('fr-FR')} FCFA — {p.statut === 'valide' ? 'Validé' : p.statut === 'en_attente' ? 'En attente' : p.statut}
                {p.date_paiement ? ` (${p.date_paiement.slice(0, 10)})` : ''}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.sec}>Option de paiement</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[styles.optionCard, typePaiement === 'integral' && styles.optionCardActive]}
            onPress={() => setTypePaiement('integral')}
          >
            <Text style={styles.optionLabel}>Paiement intégral</Text>
            <Text style={styles.optionMontant}>{montantIntegral.toLocaleString('fr-FR')}</Text>
          </TouchableOpacity>
          {!!montantTranche && (
            <TouchableOpacity
              style={[styles.optionCard, typePaiement === 'tranche' && styles.optionCardActive]}
              onPress={() => setTypePaiement('tranche')}
            >
              <Text style={styles.optionLabel}>Tranche suivante</Text>
              <Text style={styles.optionMontant}>{montantTranche.toLocaleString('fr-FR')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sec}>Moyen de paiement</Text>
        <View style={styles.paiementRow}>
          <TouchableOpacity
            style={[styles.paiementCard, modePaiement === 'mtn_momo' && styles.paiementCardActive]}
            onPress={() => setModePaiement('mtn_momo')}
          >
            <Smartphone size={20} color="#996600" />
            <Text style={[styles.paiementNom, { color: '#996600' }]}>MTN</Text>
            <Text style={styles.paiementSub}>Mobile Money</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paiementCard, modePaiement === 'orange_money' && styles.paiementCardActive]}
            onPress={() => setModePaiement('orange_money')}
          >
            <Smartphone size={20} color="#FF6600" />
            <Text style={[styles.paiementNom, { color: '#FF6600' }]}>Orange</Text>
            <Text style={styles.paiementSub}>Money</Text>
          </TouchableOpacity>
        </View>
        {/* Carte bancaire retirée : InitierPaiementRequest n'accepte que
            mtn_momo/orange_money côté serveur (vérifié le 27/09/2026), toute
            tentative "carte" échoue en 422. À réintroduire quand le backend
            l'implémentera. */}

        <Text style={styles.sec}>Numéro {modePaiement === 'mtn_momo' ? 'MTN MoMo' : 'Orange Money'}</Text>
        <TextInput
          style={styles.input}
          placeholder={modePaiement === 'mtn_momo' ? '6XX XXX XXX (MTN)' : '6XX XXX XXX (Orange)'}
          placeholderTextColor="#AAAAAA"
          value={telephone}
          onChangeText={(t) => setTelephone(t.replace(/\D/g, '').slice(0, 9))}
          keyboardType="number-pad"
          maxLength={9}
        />

        <View style={styles.warnBox}>
          <Text style={styles.warnTxt}>
            Vous recevrez une notification USSD sur votre téléphone pour confirmer. Des frais
            de service seront ajoutés à ce montant : vérifiez le total exact affiché dans la
            notification avant de confirmer.
          </Text>
        </View>

        <Card style={styles.totalBox}>
          <View style={[styles.totalRow, { borderTopWidth: 0, paddingTop: 0 }]}>
            <Text style={[styles.totalLbl, { fontWeight: '700', fontSize: 15 }]}>Frais scolaires (hors frais de service)</Text>
            <Text style={[styles.totalVal, { color: '#0D9E75', fontSize: 20, fontWeight: '800' }]}>{montant.toLocaleString('fr-FR')} FCFA</Text>
          </View>
        </Card>

        <PrimaryButton title="Confirmer et payer →" onPress={handlePayer} loading={loading} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  videContainer: { flex: 1, backgroundColor: '#F5F6F7', alignItems: 'center', justifyContent: 'center', padding: 24 },
  videTitre: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 8, textAlign: 'center' },
  videDesc: { fontSize: 13, color: '#888888', textAlign: 'center', marginBottom: 20 },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  tlsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tls: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  content: { flex: 1, padding: 16 },
  resumeCard: { backgroundColor: '#E0F5EE', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  resumeLabel: { fontSize: 10, color: '#0F6E56', marginBottom: 4 },
  resumeNom: { fontSize: 16, fontWeight: '700', color: '#085041' },
  resumeEcole: { fontSize: 11, color: '#1B9E75', marginTop: 2 },
  resumeMontant: { fontSize: 28, fontWeight: '800', color: '#085041' },
  resumeDevise: { fontSize: 11, color: '#0F6E56', textAlign: 'right' },
  sec: { fontSize: 10, fontWeight: '700', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  precedentsBox: { backgroundColor: '#FEF3DC', borderRadius: 10, padding: 12, marginBottom: 20, gap: 4 },
  precedentsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  precedentsTitre: { fontSize: 11, fontWeight: '700', color: '#8B5E10' },
  precedentLigne: { fontSize: 11, color: '#8B5E10' },
  optionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  optionCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  optionCardActive: { borderColor: '#0D9E75', backgroundColor: '#E0F5EE' },
  optionLabel: { fontSize: 11, fontWeight: '700', color: '#888888', marginBottom: 4 },
  optionMontant: { fontSize: 16, fontWeight: '800', color: '#1A1A2E' },
  paiementRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  paiementCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', gap: 4 },
  paiementCardActive: { borderWidth: 2, borderColor: '#0D9E75' },
  paiementNom: { fontSize: 12, fontWeight: '800' },
  paiementSub: { fontSize: 10, color: '#888888' },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1A1A2E', marginBottom: 12 },
  warnBox: { backgroundColor: '#FEF3DC', borderRadius: 10, padding: 12, marginBottom: 16 },
  warnTxt: { fontSize: 11, color: '#8B5E10', textAlign: 'center' },
  totalBox: { padding: 14, marginBottom: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  totalLbl: { fontSize: 13, color: '#888888' },
  totalVal: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
});
