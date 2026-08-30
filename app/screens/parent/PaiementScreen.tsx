import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, CreditCard, ShieldCheck, Smartphone } from 'lucide-react-native';
import { initierPaiement } from '../../../services/api';

type ModePaiement = 'mtn_momo' | 'orange_money' | 'carte';

export default function PaiementScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    apprenantId?: string;
    categorieFraisId?: string;
    echeancierId?: string;
    montant?: string;
    typePaiement?: string;
    libelle?: string;
    apprenantNom?: string;
  }>();

  const [modePaiement, setModePaiement] = useState<ModePaiement>('mtn_momo');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);

  const montant = Number(params.montant || 0);
  const donneesIncompletes = !params.apprenantId || !params.categorieFraisId || !params.echeancierId || !montant;

  if (donneesIncompletes) {
    return (
      <View style={styles.videContainer}>
        <Text style={styles.videTitre}>Choisissez d'abord une échéance</Text>
        <Text style={styles.videDesc}>Sélectionnez un enfant puis la tranche à payer depuis son échéancier.</Text>
        <TouchableOpacity style={styles.btnPayer} onPress={() => router.push('/screens/parent/EnfantsScreen')}>
          <Text style={styles.btnPayerTxt}>Voir mes enfants →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePayer = async () => {
    if (modePaiement !== 'carte' && !telephone) {
      Alert.alert('Erreur', 'Veuillez saisir votre numéro Mobile Money');
      return;
    }
    setLoading(true);
    try {
      const response = await initierPaiement({
        apprenant_id: Number(params.apprenantId),
        categorie_frais_id: Number(params.categorieFraisId),
        echeancier_id: Number(params.echeancierId),
        mode_paiement: modePaiement,
        type_paiement: params.typePaiement || 'tranche',
        montant,
        telephone_momo: modePaiement === 'carte' ? undefined : telephone,
      });
      router.push({
        pathname: '/screens/parent/PaiementSuccessScreen',
        params: { paiementId: String(response.data?.id ?? response.id ?? '') },
      });
    } catch (error: any) {
      Alert.alert('Erreur de paiement', error.response?.data?.message || "Le paiement n'a pas pu être initié");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.titre}>Paiement sécurisé</Text>
        <View style={styles.tlsRow}>
          <ShieldCheck size={13} color="rgba(255,255,255,0.6)" />
          <Text style={styles.tls}>TLS 1.3</Text>
        </View>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.resumeCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.resumeLabel}>Paiement pour</Text>
            <Text style={styles.resumeNom}>{params.apprenantNom || 'Apprenant'}</Text>
            <Text style={styles.resumeEcole}>{params.libelle || ''}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.resumeMontant}>{montant.toLocaleString('fr-FR')}</Text>
            <Text style={styles.resumeDevise}>FCFA</Text>
          </View>
        </View>

        <Text style={styles.sec}>Moyen de paiement</Text>
        <View style={styles.paiementRow}>
          <TouchableOpacity
            style={[styles.paiementCard, modePaiement === 'mtn_momo' && styles.paiementCardActive]}
            onPress={() => setModePaiement('mtn_momo')}
          >
            <Smartphone size={20} color="#996600" />
            <Text style={[styles.paiementNom, { color: '#996600' }]}>MTN</Text>
            <Text style={styles.paiementSub}>MoMo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paiementCard, modePaiement === 'orange_money' && styles.paiementCardActive]}
            onPress={() => setModePaiement('orange_money')}
          >
            <Smartphone size={20} color="#FF6600" />
            <Text style={[styles.paiementNom, { color: '#FF6600' }]}>Orange</Text>
            <Text style={styles.paiementSub}>Money</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paiementCard, modePaiement === 'carte' && styles.paiementCardActive]}
            onPress={() => setModePaiement('carte')}
          >
            <CreditCard size={20} color="#185FA5" />
            <Text style={[styles.paiementNom, { color: '#185FA5' }]}>Carte</Text>
            <Text style={styles.paiementSub}>Visa/MC</Text>
          </TouchableOpacity>
        </View>

        {modePaiement !== 'carte' && (
          <>
            <Text style={styles.sec}>Numéro de téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="6XX XXX XXX"
              placeholderTextColor="#AAAAAA"
              value={telephone}
              onChangeText={setTelephone}
              keyboardType="number-pad"
            />
          </>
        )}

        <View style={styles.warnBox}>
          <Text style={styles.warnTxt}>
            Vous recevrez une notification sur votre téléphone pour confirmer.
          </Text>
        </View>

        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLbl}>Montant</Text>
            <Text style={styles.totalVal}>{montant.toLocaleString('fr-FR')} FCFA</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLbl}>Frais</Text>
            <Text style={[styles.totalVal, { color: '#0D9E75' }]}>Offerts</Text>
          </View>
          <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: 10, marginTop: 4 }]}>
            <Text style={[styles.totalLbl, { fontWeight: '700', fontSize: 15 }]}>Total</Text>
            <Text style={[styles.totalVal, { color: '#0D9E75', fontSize: 20, fontWeight: '800' }]}>{montant.toLocaleString('fr-FR')} FCFA</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.btnPayer, loading && { opacity: 0.7 }]} onPress={handlePayer} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnPayerTxt}>Confirmer et payer →</Text>}
        </TouchableOpacity>
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
  resumeCard: { backgroundColor: '#E0F5EE', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(13,158,117,0.2)' },
  resumeLabel: { fontSize: 10, color: '#0F6E56', marginBottom: 4 },
  resumeNom: { fontSize: 16, fontWeight: '700', color: '#085041' },
  resumeEcole: { fontSize: 11, color: '#1B9E75', marginTop: 2 },
  resumeMontant: { fontSize: 28, fontWeight: '800', color: '#085041' },
  resumeDevise: { fontSize: 11, color: '#0F6E56', textAlign: 'right' },
  sec: { fontSize: 10, fontWeight: '700', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  paiementRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  paiementCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', gap: 4 },
  paiementCardActive: { borderWidth: 2, borderColor: '#0D9E75' },
  paiementNom: { fontSize: 12, fontWeight: '800' },
  paiementSub: { fontSize: 10, color: '#888888' },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1A1A2E', marginBottom: 12 },
  warnBox: { backgroundColor: '#FEF3DC', borderRadius: 10, padding: 12, marginBottom: 16 },
  warnTxt: { fontSize: 11, color: '#8B5E10', textAlign: 'center' },
  totalBox: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  totalLbl: { fontSize: 13, color: '#888888' },
  totalVal: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  btnPayer: { backgroundColor: '#0D9E75', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnPayerTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
