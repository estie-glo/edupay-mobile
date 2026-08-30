import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CalendarClock, LinkIcon, Receipt, Smartphone, UserPlus } from 'lucide-react-native';
import PageHeader from '../../../components/PageHeader';

const ETAPES = [
  { titre: 'Créez votre compte', desc: 'Inscrivez-vous en tant que parent, élève ou étudiant en quelques minutes.', Icone: UserPlus },
  { titre: 'Rattachez un enfant', desc: "Avec le code établissement et le matricule fournis par l'école.", Icone: LinkIcon },
  { titre: 'Consultez les frais', desc: "Visualisez l'échéancier et le solde de chaque catégorie de frais.", Icone: CalendarClock },
  { titre: 'Payez en Mobile Money', desc: 'MTN Mobile Money, Orange Money ou carte, en quelques secondes.', Icone: Smartphone },
  { titre: 'Recevez votre reçu', desc: 'Confirmation immédiate et reçu PDF envoyé par email.', Icone: Receipt },
];

export default function CommentScreen() {
  return (
    <View style={styles.container}>
      <PageHeader
        tag="Comment ça marche"
        titre="Payer en 5 étapes"
        sousTitre="Le parcours d'un parent sur EduPay, de l'inscription au reçu."
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {ETAPES.map((etape, i) => (
          <View key={etape.titre} style={styles.row}>
            <View style={styles.numeroCol}>
              <View style={styles.numero}>
                <Text style={styles.numeroTxt}>{i + 1}</Text>
              </View>
              {i < ETAPES.length - 1 && <View style={styles.trait} />}
            </View>
            <View style={styles.card}>
              <View style={styles.cardIco}>
                <etape.Icone size={18} color="#0D9E75" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitre}>{etape.titre}</Text>
                <Text style={styles.cardDesc}>{etape.desc}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  content: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', gap: 12 },
  numeroCol: { alignItems: 'center' },
  numero: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0D9E75', alignItems: 'center', justifyContent: 'center' },
  numeroTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  trait: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 4 },
  card: { flex: 1, flexDirection: 'row', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  cardIco: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E0F5EE', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitre: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  cardDesc: { fontSize: 11, color: '#888888', lineHeight: 16 },
});
