import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PageHeader from '../../../components/PageHeader';

const ETAPES = [
  { titre: 'Inscription', desc: 'Inscrivez votre établissement en quelques minutes' },
  { titre: 'Configuration', desc: 'Configurez vos frais et échéanciers' },
  { titre: 'Annuaire', desc: 'Importez votre annuaire d\'apprenants' },
  { titre: 'Activation', desc: 'Vos parents peuvent commencer à payer' },
  { titre: 'Suivi', desc: 'Suivez les paiements en temps réel' },
  { titre: 'Rapports', desc: 'Exportez vos rapports financiers' },
];

export default function GuideScreen() {
  return (
    <View style={styles.container}>
      <PageHeader
        tag="Documentation"
        titre="Guide d'utilisation EduPay"
        sousTitre="Tout ce qu'il faut savoir pour bien démarrer avec EduPay Cameroun."
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.secLabel}>6 ÉTAPES POUR DÉMARRER</Text>
        {ETAPES.map((etape, i) => (
          <View key={etape.titre} style={styles.etapeRow}>
            <View style={styles.numero}>
              <Text style={styles.numeroTxt}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.etapeTitre}>{etape.titre}</Text>
              <Text style={styles.etapeDesc}>{etape.desc}</Text>
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
  secLabel: { fontSize: 10, fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  etapeRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  numero: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0D9E75', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  numeroTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  etapeTitre: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  etapeDesc: { fontSize: 12, color: '#666666', lineHeight: 17 },
});
