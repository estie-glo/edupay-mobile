import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PageHeader from '../../../components/PageHeader';

const SECTIONS = [
  { titre: '1. Données collectées', texte: 'Nous collectons uniquement les données nécessaires au fonctionnement du service : nom, téléphone, email, et informations de paiement.' },
  { titre: '2. Utilisation des données', texte: 'Vos données sont utilisées pour traiter vos paiements, envoyer des notifications et améliorer nos services.' },
  { titre: '3. Sécurité', texte: 'Vos données sont chiffrées (TLS 1.3) et stockées sur des serveurs sécurisés. Nous ne vendons jamais vos données.' },
  { titre: '4. Partage des données', texte: 'Vos données peuvent être partagées avec nos partenaires de paiement (MTN, Orange, CinetPay) dans le cadre de l\'exécution du service.' },
  { titre: '5. Vos droits', texte: 'Vous pouvez accéder, corriger ou supprimer vos données à tout moment depuis votre espace personnel.' },
  { titre: '6. Contact', texte: 'Pour toute question relative à la protection de vos données personnelles, veuillez nous contacter.' },
];

export default function PolitiqueConfidentialiteScreen() {
  return (
    <View style={styles.container}>
      <PageHeader
        tag="Vie privée"
        titre="Politique de confidentialité"
        sousTitre="Chez EduPay, la protection de vos données personnelles est une priorité absolue."
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.majTxt}>Dernière mise à jour : juin 2026</Text>
        {SECTIONS.map((s) => (
          <View key={s.titre} style={styles.section}>
            <Text style={styles.sectionTitre}>{s.titre}</Text>
            <Text style={styles.sectionTexte}>{s.texte}</Text>
          </View>
        ))}
        <Text style={styles.note}>Cette politique peut être mise à jour. Vérifiez régulièrement.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  content: { flex: 1, padding: 16 },
  majTxt: { fontSize: 11, color: '#AAAAAA', marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitre: { fontSize: 13, fontWeight: '800', color: '#1A1A2E', marginBottom: 6 },
  sectionTexte: { fontSize: 12, color: '#555555', lineHeight: 18 },
  note: { fontSize: 11, color: '#AAAAAA', textAlign: 'center', marginTop: 8, fontStyle: 'italic' },
});
