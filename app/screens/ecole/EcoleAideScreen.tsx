import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { AlertCircle, ArrowLeft, FileBarChart2, HelpCircle, Layers3, Mail, MapPinned, Phone, RotateCcw, UserCog, Users } from 'lucide-react-native';

// Contenu repris tel quel de resources/lang/fr/etablissement.php +
// etablissement/aide.blade.php (vérifié le 26/09/2026). La FAQ web n'a
// que du texte de remplissage ("Réponse à la question fréquente 1") —
// non reproduite ici tant que le vrai contenu n'existe pas côté web.
const MODULES = [
  { Icone: Users, bg: '#E0F5EE', fg: '#0D9E75', titre: 'Apprenants', desc: "Gérez l'annuaire des apprenants : ajout, modification, import CSV" },
  { Icone: Layers3, bg: '#FEF3DC', fg: '#E8A020', titre: 'Frais & Échéanciers', desc: 'Configurez les catégories de frais et les échéanciers' },
  { Icone: FileBarChart2, bg: '#E8F1FC', fg: '#185FA5', titre: 'Paiements', desc: 'Suivez tous les paiements reçus par votre établissement' },
  { Icone: AlertCircle, bg: '#F3E8FF', fg: '#7C3AED', titre: 'Impayés', desc: 'Consultez les impayés et envoyez des relances par email' },
  { Icone: FileBarChart2, bg: '#E0F5EE', fg: '#0D9E75', titre: 'Rapports', desc: 'Téléchargez des rapports financiers en PDF ou Excel' },
  { Icone: RotateCcw, bg: '#FEF3DC', fg: '#E8A020', titre: 'Remboursements', desc: 'Créez et traitez les demandes de remboursement' },
  { Icone: MapPinned, bg: '#E8F1FC', fg: '#185FA5', titre: 'Multi-sites', desc: 'Gérez plusieurs sites rattachés à votre groupe scolaire' },
  { Icone: UserCog, bg: '#F3E8FF', fg: '#7C3AED', titre: 'Utilisateurs internes', desc: 'Invitez et gérez les collaborateurs de votre établissement' },
];

export default function EcoleAideScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.titreRow}>
          <HelpCircle size={18} color="#FFFFFF" />
          <Text style={styles.titre}>Guide & Support</Text>
        </View>
        <Text style={styles.sousTitre}>Guide par module</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {MODULES.map((m) => (
          <View key={m.titre} style={styles.moduleCard}>
            <View style={[styles.moduleIco, { backgroundColor: m.bg }]}>
              <m.Icone size={18} color={m.fg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.moduleTitre}>{m.titre}</Text>
              <Text style={styles.moduleDesc}>{m.desc}</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.secLabel, { marginTop: 24 }]}>BESOIN D'AIDE ?</Text>
        <View style={styles.contactRow}>
          <View style={styles.contactCard}>
            <View style={[styles.contactIco, { backgroundColor: '#0D9E75' }]}>
              <Mail size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitre}>Email</Text>
              <Text style={styles.contactTxt}>contact@mekontso.gsi2026.com</Text>
            </View>
          </View>
          <View style={styles.contactCard}>
            <View style={[styles.contactIco, { backgroundColor: '#185FA5' }]}>
              <Phone size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitre}>Téléphone</Text>
              <Text style={styles.contactTxt}>+237 654 862 989 · +237 688 462 229</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.btnContact} onPress={() => router.push('/screens/commun/ContactScreen')}>
          <Text style={styles.btnContactTxt}>Ouvrir le formulaire de contact</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  titreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  titre: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  sousTitre: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  content: { flex: 1, padding: 16 },
  moduleCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  moduleIco: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  moduleTitre: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', marginBottom: 3 },
  moduleDesc: { fontSize: 12, color: '#666666', lineHeight: 17 },
  secLabel: { fontSize: 10, fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  contactRow: { gap: 10 },
  contactCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  contactIco: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  contactTitre: { fontSize: 13, fontWeight: '700', color: '#0B2545' },
  contactTxt: { fontSize: 12, color: '#555555', marginTop: 3, lineHeight: 17 },
  btnContact: { backgroundColor: '#E8A020', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnContactTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
