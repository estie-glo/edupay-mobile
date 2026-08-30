import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PageHeader from '../../../components/PageHeader';

export default function MentionsLegalesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <PageHeader tag="Cadre légal" titre="Mentions légales" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Éditeur</Text>
          <Text style={styles.sectionTexte}>EduPay Cameroun — Réf. projet CDC-EDUPAY-CM-2026-001</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Contact</Text>
          <Text style={styles.sectionTexte}>Yaoundé, Cameroun{'\n'}contact@edupay.cm{'\n'}+237 654 862 989 · +237 688 462 229</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Pour aller plus loin</Text>
          <Text style={styles.sectionTexte}>Le détail de nos engagements figure dans les Conditions Générales d'Utilisation et la Politique de confidentialité.</Text>
          <TouchableOpacity onPress={() => router.push('/screens/commun/ConditionsUtilisationScreen')}>
            <Text style={styles.lien}>Consulter les CGU →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/screens/commun/PolitiqueConfidentialiteScreen')}>
            <Text style={styles.lien}>Consulter la politique de confidentialité →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitre: { fontSize: 13, fontWeight: '800', color: '#1A1A2E', marginBottom: 6 },
  sectionTexte: { fontSize: 12, color: '#555555', lineHeight: 18, marginBottom: 8 },
  lien: { fontSize: 12, color: '#0D9E75', fontWeight: '700', marginTop: 6 },
});
