import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PageHeader from '../../../components/PageHeader';

const SECTIONS = [
  { titre: '1. Objet', texte: "EduPay Cameroun est une plateforme de paiement électronique des frais scolaires destinée aux établissements d'enseignement et aux familles camerounaises." },
  { titre: '2. Accès au service', texte: "L'accès à EduPay est réservé aux personnes majeures ou aux mineurs sous supervision parentale. L'inscription implique l'acceptation des présentes CGU." },
  { titre: '3. Données personnelles', texte: 'EduPay collecte les données personnelles nécessaires au fonctionnement du service, dans le respect de la réglementation camerounaise en vigueur.' },
  { titre: '4. Sécurité des transactions', texte: "EduPay s'engage à sécuriser toutes les transactions via un chiffrement TLS 1.3 et une conformité PCI-DSS." },
  { titre: '5. Vos droits', texte: 'Pour toute question relative à la protection de vos données, consultez notre politique de confidentialité.' },
  { titre: '6. Modification des CGU', texte: 'EduPay se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront notifiés des changements majeurs.' },
  { titre: '7. Droit applicable', texte: 'Le présent contrat est régi par le droit camerounais. Tout litige sera soumis aux tribunaux compétents de Yaoundé.' },
];

export default function ConditionsUtilisationScreen() {
  return (
    <View style={styles.container}>
      <PageHeader
        tag="Cadre légal"
        titre="Conditions Générales d'Utilisation"
        sousTitre="Les présentes conditions régissent l'utilisation de la plateforme EduPay Cameroun."
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.majTxt}>Dernière mise à jour : juin 2026</Text>
        {SECTIONS.map((s) => (
          <View key={s.titre} style={styles.section}>
            <Text style={styles.sectionTitre}>{s.titre}</Text>
            <Text style={styles.sectionTexte}>{s.texte}</Text>
          </View>
        ))}
        <Text style={styles.note}>Ces CGU sont susceptibles d'être modifiées. Consultez-les régulièrement.</Text>
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
