import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calculator } from 'lucide-react-native';
import PageHeader from '../../../components/PageHeader';

// Simulateur générique de fractionnement — EduPay ne publie pas de barème de
// frais par établissement via l'API ; ce calcul se base uniquement sur ce que
// l'utilisateur saisit et sur la règle réelle "2 ou 3 tranches maximum".
export default function SimulateurScreen() {
  const [montant, setMontant] = useState('');

  const total = Number(montant.replace(/\D/g, '')) || 0;

  const options = useMemo(() => [
    { label: 'Paiement intégral', tranches: 1 },
    { label: '2 tranches', tranches: 2 },
    { label: '3 tranches (maximum)', tranches: 3 },
  ], []);

  return (
    <View style={styles.container}>
      <PageHeader
        tag="Simulateur"
        titre="Simulez votre paiement fractionné"
        sousTitre="EduPay permet de régler vos frais en une fois ou en 2 à 3 tranches."
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.lbl}>Montant total des frais (FCFA)</Text>
        <View style={styles.inputRow}>
          <Calculator size={16} color="#0D9E75" />
          <TextInput
            style={styles.input}
            placeholder="ex : 150000"
            placeholderTextColor="#AAAAAA"
            value={montant}
            onChangeText={setMontant}
            keyboardType="number-pad"
          />
        </View>

        {total > 0 && (
          <>
            <Text style={styles.secLabel}>RÉPARTITION POSSIBLE</Text>
            {options.map((opt) => (
              <View key={opt.label} style={styles.card}>
                <Text style={styles.cardTitre}>{opt.label}</Text>
                <Text style={styles.cardMontant}>
                  {Math.ceil(total / opt.tranches).toLocaleString('fr-FR')} FCFA
                  {opt.tranches > 1 ? ` × ${opt.tranches}` : ''}
                </Text>
              </View>
            ))}
            <Text style={styles.note}>
              Simulation indicative. Les frais réels et le nombre de tranches disponibles dépendent de l'échéancier fixé par chaque établissement.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  content: { flex: 1, padding: 16 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, gap: 10, marginBottom: 24 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1A1A2E' },
  secLabel: { fontSize: 10, fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitre: { fontSize: 12, fontWeight: '700', color: '#888888', marginBottom: 6 },
  cardMontant: { fontSize: 18, fontWeight: '800', color: '#0D9E75' },
  note: { fontSize: 11, color: '#AAAAAA', textAlign: 'center', marginTop: 12, lineHeight: 15 },
});
