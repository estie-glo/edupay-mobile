import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check } from 'lucide-react-native';
import PageHeader from '../../../components/PageHeader';

const PLANS = [
  {
    nom: 'Basique', prix: '5 000', couleur: '#0D9E75',
    lignes: ['100 apprenants max', '10 SMS/mois', 'Multi-sites non inclus', 'Exports COBAC non inclus'],
  },
  {
    nom: 'Standard', prix: '10 000', couleur: '#185FA5',
    lignes: ['300 apprenants max', 'SMS illimités', 'Multi-sites inclus', 'Exports COBAC non inclus'],
  },
  {
    nom: 'Premium', prix: '20 000', couleur: '#E8A020',
    lignes: ['Apprenants illimités', 'SMS illimités', 'Multi-sites inclus', 'Exports COBAC inclus'],
  },
];

export default function TarifsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <PageHeader
        tag="Tarification transparente"
        titre="Un plan adapté à votre établissement"
        sousTitre="Pas d'abonnement. Juste une commission de 0,5% sur chaque paiement réussi."
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {PLANS.map((plan) => (
          <View key={plan.nom} style={[styles.card, { borderTopColor: plan.couleur }]}>
            <Text style={styles.planNom}>{plan.nom}</Text>
            <View style={styles.prixRow}>
              <Text style={[styles.prix, { color: plan.couleur }]}>{plan.prix}</Text>
              <Text style={styles.prixUnite}>FCFA/mois</Text>
            </View>
            {plan.lignes.map((ligne) => (
              <View key={ligne} style={styles.ligne}>
                <Check size={14} color={plan.couleur} />
                <Text style={styles.ligneTxt}>{ligne}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.btnChoisir, { backgroundColor: plan.couleur }]}
              onPress={() => router.push('/screens/ecole/RegisterEcoleScreen')}
            >
              <Text style={styles.btnChoisirTxt}>Choisir ce plan {plan.nom}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitre}>Une question sur les formules ?</Text>
          <Text style={styles.ctaDesc}>Des offres adaptées à chaque taille d'établissement</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/screens/commun/ContactScreen')}>
            <Text style={styles.ctaBtnTxt}>Contacter l'équipe</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', borderTopWidth: 4 },
  planNom: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', marginBottom: 6 },
  prixRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 14 },
  prix: { fontSize: 26, fontWeight: '800' },
  prixUnite: { fontSize: 12, color: '#888888' },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  ligneTxt: { fontSize: 12, color: '#333333' },
  btnChoisir: { marginTop: 12, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnChoisirTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  ctaBox: { backgroundColor: '#0B2545', borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 8 },
  ctaTitre: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', marginBottom: 4, textAlign: 'center' },
  ctaDesc: { fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 14 },
  ctaBtn: { backgroundColor: '#0D9E75', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  ctaBtnTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
