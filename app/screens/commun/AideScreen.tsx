import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp, Mail, MapPin, Phone } from 'lucide-react-native';
import PageHeader from '../../../components/PageHeader';

const FAQ = [
  { q: "L'inscription est-elle payante ?", r: "Non, l'inscription est totalement gratuite pour les établissements. EduPay perçoit une commission de 0,5% sur chaque transaction réussie." },
  { q: 'Quels moyens de paiement sont acceptés ?', r: 'Nous supportons MTN Mobile Money, Orange Money et les cartes bancaires via CinetPay.' },
  { q: 'Comment les reçus sont-ils générés ?', r: "Chaque paiement validé génère automatiquement un reçu PDF signé électroniquement, envoyé par email et disponible dans l'espace payeur." },
  { q: 'Quand les fonds sont-ils reversés à l\'établissement ?', r: 'Les fonds sont reversés sur votre numéro Mobile Money en 24 à 48h ouvrables après validation du paiement.' },
  { q: 'Peut-on payer en plusieurs fois ?', r: 'Oui, EduPay permet le paiement en 2 ou 3 tranches selon l\'échéancier configuré par l\'établissement.' },
  { q: 'La plateforme est-elle sécurisée ?', r: 'EduPay utilise un chiffrement TLS 1.3 et est conforme aux normes PCI-DSS et COBAC.' },
];

export default function AideScreen() {
  const router = useRouter();
  const [ouvert, setOuvert] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <PageHeader
        tag="Support EduPay"
        titre="Support & Assistance"
        sousTitre="Notre équipe est disponible du lundi au vendredi, 8h-18h."
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitre}>Pourquoi nous contacter ?</Text>
          <Text style={styles.infoDesc}>Pour toute question technique, partenariat, ou demande de support. Nous répondons à toutes vos questions dans les 24h ouvrables.</Text>
          <View style={styles.infoRow}>
            <MapPin size={14} color="#0D9E75" />
            <Text style={styles.infoTxt}>Yaoundé, Cameroun</Text>
          </View>
          <View style={styles.infoRow}>
            <Phone size={14} color="#0D9E75" />
            <Text style={styles.infoTxt}>+237 654 862 989 · +237 688 462 229</Text>
          </View>
          <View style={styles.infoRow}>
            <Mail size={14} color="#0D9E75" />
            <Text style={styles.infoTxt}>contact@edupay.cm</Text>
          </View>
          <TouchableOpacity style={styles.btnContact} onPress={() => router.push('/screens/commun/ContactScreen')}>
            <Text style={styles.btnContactTxt}>Nous écrire →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.secLabel}>QUESTIONS FRÉQUENTES</Text>
        {FAQ.map((item, i) => {
          const estOuvert = ouvert === i;
          return (
            <TouchableOpacity key={item.q} style={styles.faqCard} onPress={() => setOuvert(estOuvert ? null : i)}>
              <View style={styles.faqQRow}>
                <Text style={styles.faqQ}>{item.q}</Text>
                {estOuvert ? <ChevronUp size={16} color="#0D9E75" /> : <ChevronDown size={16} color="#888888" />}
              </View>
              {estOuvert && <Text style={styles.faqR}>{item.r}</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  content: { flex: 1, padding: 16 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24 },
  infoTitre: { fontSize: 14, fontWeight: '800', color: '#1A1A2E', marginBottom: 6 },
  infoDesc: { fontSize: 12, color: '#666666', lineHeight: 17, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoTxt: { fontSize: 12, color: '#333333', fontWeight: '600' },
  btnContact: { marginTop: 8, backgroundColor: '#E0F5EE', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  btnContactTxt: { fontSize: 12, fontWeight: '700', color: '#0D9E75' },
  secLabel: { fontSize: 10, fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  faqCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  faqQRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  faqQ: { flex: 1, fontSize: 12, fontWeight: '700', color: '#1A1A2E' },
  faqR: { fontSize: 12, color: '#666666', lineHeight: 17, marginTop: 10 },
});
