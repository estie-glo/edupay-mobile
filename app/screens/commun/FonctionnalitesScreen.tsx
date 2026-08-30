import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart3, Building2, ChevronRight, FileCheck, Layers, ShieldCheck, Wallet } from 'lucide-react-native';
import PageHeader from '../../../components/PageHeader';

const FONCTIONNALITES = [
  { titre: 'Mobile Money natif', desc: 'Intégration directe MTN Mobile Money & Orange Money Cameroun.', Icone: Wallet },
  { titre: 'Reçu PDF automatique', desc: 'Chaque paiement validé génère un reçu signé électroniquement, envoyé par email et SMS.', Icone: FileCheck },
  { titre: 'Dashboard temps réel', desc: 'Directeurs et comptables suivent encaissements, impayés et relances depuis un seul écran.', Icone: BarChart3 },
  { titre: 'Sécurité PCI-DSS', desc: 'Chiffrement TLS 1.3, authentification 2FA, conformité COBAC/BEAC et protection anti-fraude.', Icone: ShieldCheck },
  { titre: 'Paiement fractionné', desc: "Payez en 2 ou 3 tranches selon l'échéancier de l'établissement.", Icone: Layers, route: '/screens/commun/SimulateurScreen' },
  { titre: 'Multi-établissements', desc: 'Un parent peut gérer plusieurs enfants dans plusieurs écoles depuis un seul compte EduPay.', Icone: Building2 },
];

export default function FonctionnalitesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <PageHeader
        tag="Fonctionnalités"
        titre="Pourquoi choisir EduPay ?"
        sousTitre="Tout ce qu'il faut pour digitaliser la collecte des frais scolaires."
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {FONCTIONNALITES.map(({ titre, desc, Icone, route }) => (
          <TouchableOpacity
            key={titre}
            style={styles.card}
            disabled={!route}
            onPress={() => route && router.push(route as any)}
          >
            <View style={styles.cardIco}>
              <Icone size={20} color="#0D9E75" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitre}>{titre}</Text>
              <Text style={styles.cardDesc}>{desc}</Text>
              {!!route && <Text style={styles.essayer}>Essayer le simulateur →</Text>}
            </View>
            {!!route && <ChevronRight size={16} color="#AAAAAA" />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  content: { flex: 1, padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardIco: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#E0F5EE', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitre: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#888888', lineHeight: 17 },
  essayer: { fontSize: 11, fontWeight: '700', color: '#0D9E75', marginTop: 6 },
});
