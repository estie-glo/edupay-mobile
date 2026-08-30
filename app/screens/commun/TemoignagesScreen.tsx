import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Quote } from 'lucide-react-native';
import PageHeader from '../../../components/PageHeader';

const TEMOIGNAGES = [
  { citation: "Depuis EduPay, nous avons réduit les détournements de 90% et notre taux de recouvrement est passé à 94%. Les parents adorent recevoir leur reçu PDF immédiatement.", auteur: 'M. MVONDO Jean-Pierre', role: 'Directeur', etablissement: 'Lycée Bilingue de Melen' },
  { citation: "Je paye depuis mon téléphone en 2 minutes. Plus besoin de faire la queue et je reçois mon reçu instantanément. C'est révolutionnaire pour nous !", auteur: 'Mme FONO Marie', role: 'Parent', etablissement: "Parent d'élève, Yaoundé" },
  { citation: "Le dashboard me montre tous les impayés en temps réel et j'envoie des relances SMS en un clic. Mon travail a été divisé par trois.", auteur: 'Mme BIKORO Céleste', role: 'Comptable', etablissement: 'École Primaire NBC' },
  { citation: "Gérer 8000 étudiants nécessitait une solution robuste. EduPay a su répondre à nos exigences avec un onboarding rapide et un support réactif.", auteur: 'Dr NDJOUMESSI Samuel', role: 'Responsable financier', etablissement: 'Université de Douala' },
  { citation: "La fonctionnalité multi-sites nous permet de gérer nos 3 campus depuis un tableau de bord centralisé. Exactement ce dont nous avions besoin.", auteur: 'M. MAKUETA Pierre', role: 'Fondateur', etablissement: 'Groupe Scolaire Excellence' },
  { citation: "La transparence financière a restauré la confiance des parents dans notre établissement. EduPay est devenu indispensable à notre gestion.", auteur: 'Mme WANDJI Estelle', role: 'Directrice', etablissement: 'Collège Catholique St-Joseph' },
];

export default function TemoignagesScreen() {
  return (
    <View style={styles.container}>
      <PageHeader
        tag="Témoignages"
        titre="Ils nous font confiance"
        sousTitre="Des milliers de familles et d'établissements nous font confiance."
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {TEMOIGNAGES.map((t) => (
          <View key={t.auteur} style={styles.card}>
            <Quote size={18} color="#0D9E75" />
            <Text style={styles.citation}>{t.citation}</Text>
            <View style={styles.auteurRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>{t.auteur.replace(/^(M\.|Mme|Dr)\s*/, '').charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.auteurNom}>{t.auteur}</Text>
                <Text style={styles.auteurRole}>{t.role} · {t.etablissement}</Text>
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
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  citation: { fontSize: 12, color: '#333333', lineHeight: 18, marginTop: 10, marginBottom: 14, fontStyle: 'italic' },
  auteurRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#0D9E75', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  auteurNom: { fontSize: 12, fontWeight: '700', color: '#1A1A2E' },
  auteurRole: { fontSize: 10, color: '#888888', marginTop: 1 },
});
