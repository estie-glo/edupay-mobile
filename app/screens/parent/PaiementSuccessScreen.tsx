import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { CircleCheck, Clock, XCircle } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { verifierPaiement } from '../../../services/api';

type Statut = {
  reference?: string;
  statut?: string;
};

// AangaraaPay confirme le paiement de façon asynchrone (prompt USSD sur le
// téléphone du payeur) : on interroge /paiements/{id}/verifier toutes les 5s,
// jusqu'à 24 fois (2 minutes), comme le fait la page web d'attente.
const INTERVALLE_MS = 5000;
const MAX_TENTATIVES = 24;

export default function PaiementSuccessScreen() {
  usePreventScreenCapture(); // montant et MSISDN visibles à l'écran (audit point 10, 28/09/2026)
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  // Instantané transmis par PaiementScreen juste après /paiements/initier :
  // le polling ci-dessous (verifierPaiement) ne renvoie jamais ces champs,
  // seulement {statut} — cf. Api\PaiementController::verifier (vérifié le
  // 29/09/2026). `montantTotalPaye`/`fraisService` : seule façon actuelle de
  // montrer au payeur ce qui a réellement été débité (frais de service inclus,
  // absents de l'écran de paiement lui-même en attendant une route de
  // simulation côté backend — audit 29/09/2026).
  const { paiementId, reference, apprenantNom, montant, fraisService, montantTotalPaye, modePaiement, datePaiement } = useLocalSearchParams<{
    paiementId?: string;
    reference?: string;
    apprenantNom?: string;
    montant?: string;
    fraisService?: string;
    montantTotalPaye?: string;
    modePaiement?: string;
    datePaiement?: string;
  }>();
  const [statut, setStatut] = useState<Statut | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeout_, setTimeoutAtteint] = useState(false);
  const tentatives = useRef(0);

  // Seul écran (avec PaiementScreen) sans ce garde jusqu'ici : un lien
  // externe (scheme edupaymobile://) ouvrait directement l'écran de succès,
  // brandé et affichant potentiellement un vrai statut (audit point 4, 28/09/2026).
  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/parent/LoginParentScreen');
    }
  }, [token, authLoading]);

  useEffect(() => {
    if (!paiementId) {
      setLoading(false);
      return;
    }
    let annule = false;

    const verifier = async () => {
      try {
        const response = await verifierPaiement(Number(paiementId));
        const data = response.data ?? response;
        if (annule) return;
        setStatut(data);
        setLoading(false);

        const s = (data.statut || '').toLowerCase();
        if (s === 'en_attente' && tentatives.current < MAX_TENTATIVES) {
          tentatives.current += 1;
          setTimeout(verifier, INTERVALLE_MS);
        } else if (s === 'en_attente') {
          setTimeoutAtteint(true);
        }
      } catch {
        if (!annule) setLoading(false);
      }
    };

    verifier();
    return () => { annule = true; };
  }, [paiementId]);

  if (!token || authLoading || loading) {
    return <ActivityIndicator size="large" color="#0D9E75" style={{ flex: 1 }} />;
  }

  // Un statut ne doit JAMAIS être présumé "validé" par défaut : ni l'absence
  // de paiementId, ni une erreur réseau dans verifier(), ni un timeout en
  // attente ne mettent statut.statut à 'valide' — seul le serveur peut
  // l'affirmer. Miroir de la distinction que le backend fait déjà lui-même
  // (App\Services\AangaraaPayService::verifierStatut → 'INCONNU', jamais
  // 'FAILED', sur une erreur technique) : un statut inconnu a son propre
  // écran neutre, jamais le vert ni le rouge.
  const s = (statut?.statut || '').toLowerCase();
  const valide = s === 'valide';
  const echoue = s === 'echoue';
  const enAttente = s === 'en_attente' && !timeout_;
  const inconnu = !valide && !echoue && !enAttente;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[
          styles.checkCircle,
          enAttente && { backgroundColor: '#E8A020' },
          echoue && { backgroundColor: '#D94040' },
          inconnu && { backgroundColor: '#888888' },
        ]}>
          {echoue ? <XCircle size={40} color="#FFFFFF" /> : (enAttente || inconnu) ? <Clock size={40} color="#FFFFFF" /> : <CircleCheck size={40} color="#FFFFFF" />}
        </View>
        <Text style={styles.titre}>
          {echoue ? 'Paiement échoué' : enAttente ? 'En attente de confirmation' : inconnu ? 'Statut à vérifier' : 'Paiement validé !'}
        </Text>
        {!!reference && <Text style={styles.ref}>Réf. {reference}</Text>}
        <Text style={styles.desc}>
          {echoue
            ? "Le paiement n'a pas abouti. Vous pouvez réessayer depuis l'échéancier."
            : enAttente
              ? 'Confirmez le paiement avec votre code PIN Mobile Money sur votre téléphone.'
              : inconnu
                ? "Nous n'avons pas pu confirmer ce paiement pour le moment. Vérifiez son statut dans votre historique avant de réessayer — ne payez pas une seconde fois sans vérifier."
                : 'Reçu PDF envoyé par SMS et email'}
        </Text>
        <View style={styles.detailBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLbl}>Apprenant</Text>
            <Text style={styles.detailVal}>{apprenantNom || '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLbl}>Frais scolaires</Text>
            <Text style={styles.detailVal}>{montant ? `${Number(montant).toLocaleString('fr-FR')} FCFA` : '—'}</Text>
          </View>
          {!!fraisService && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLbl}>Frais de service</Text>
              <Text style={styles.detailVal}>{Number(fraisService).toLocaleString('fr-FR')} FCFA</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLbl, { fontWeight: '700' }]}>Total débité</Text>
            <Text style={[styles.detailVal, { color: '#0D9E75' }]}>
              {montantTotalPaye ? `${Number(montantTotalPaye).toLocaleString('fr-FR')} FCFA` : montant ? `${Number(montant).toLocaleString('fr-FR')} FCFA` : '—'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLbl}>Mode</Text>
            <Text style={styles.detailVal}>{modePaiement || '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLbl}>Date</Text>
            <Text style={styles.detailVal}>{datePaiement ? datePaiement.slice(0, 10) : '—'}</Text>
          </View>
        </View>
        {valide && (
          <TouchableOpacity style={styles.btnRecu} onPress={() => router.push('/screens/parent/HistoriqueScreen')}>
            <Text style={styles.btnRecuTxt}>Voir le reçu PDF</Text>
          </TouchableOpacity>
        )}
        {inconnu && (
          <TouchableOpacity style={styles.btnRecu} onPress={() => router.push('/screens/parent/HistoriqueScreen')}>
            <Text style={styles.btnRecuTxt}>Vérifier dans l'historique</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.btnDashboard} onPress={() => router.push('/screens/parent/DashboardScreen')}>
          <Text style={styles.btnDashboardTxt}>Retour au tableau de bord</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7', justifyContent: 'center', padding: 24 },
  content: { alignItems: 'center' },
  checkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0D9E75', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  titre: { fontSize: 22, fontWeight: '800', color: '#085041', marginBottom: 6, textAlign: 'center' },
  ref: { fontSize: 13, color: '#0D9E75', marginBottom: 6 },
  desc: { fontSize: 12, color: '#888888', marginBottom: 24, textAlign: 'center' },
  detailBox: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, width: '100%', marginBottom: 24 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  detailLbl: { fontSize: 12, color: '#888888' },
  detailVal: { fontSize: 12, fontWeight: '700', color: '#1A1A2E' },
  btnDashboard: { backgroundColor: '#0D9E75', paddingVertical: 14, borderRadius: 12, alignItems: 'center', width: '100%', marginBottom: 10 },
  btnDashboardTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  btnRecu: { backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 12, alignItems: 'center', width: '100%', borderWidth: 2, borderColor: '#0D9E75', marginBottom: 10 },
  btnRecuTxt: { color: '#0D9E75', fontSize: 14, fontWeight: '700' },
});
