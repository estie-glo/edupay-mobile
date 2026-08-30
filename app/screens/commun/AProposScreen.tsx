import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Award, Heart, MapPin, Shield, Target, Users } from 'lucide-react-native';
import PageHeader from '../../../components/PageHeader';

const VALEURS = [
  { titre: 'Accessibilité', desc: 'EduPay est conçu pour être accessible à tous, quelle que soit la région ou le niveau de connectivité.', Icone: Users, couleur: '#0D9E75' },
  { titre: 'Sécurité', desc: 'La sécurité financière de vos transactions est notre priorité absolue.', Icone: Shield, couleur: '#185FA5' },
  { titre: 'Ancrage local', desc: 'Conçu au Cameroun, pour le Cameroun. Nous comprenons les réalités locales.', Icone: MapPin, couleur: '#E8A020' },
  { titre: 'Impact', desc: 'Chaque fonctionnalité est pensée pour créer un impact mesurable pour les familles et les établissements.', Icone: Award, couleur: '#7C3AED' },
];

const CONTEXTE = [
  { val: '30 000+', lbl: 'Établissements ciblés' },
  { val: '6 millions', lbl: "D'apprenants au Cameroun" },
  { val: '12M', lbl: 'Abonnés Mobile Money' },
  { val: '45%', lbl: 'Taux de pénétration smartphone' },
];

const EQUIPE = [
  { nom: 'MEKONTSO Olivier Steve', role: 'Chef de groupe · GSI', bio: 'Chef de projet et développeur principal — architecture technique globale (Laravel, base de données, intégrations Mobile Money), coordination de l\'équipe.' },
  { nom: 'Ze Melouni Marcelle Anais', role: 'Design · GSA', bio: 'Design UI/UX et conception des maquettes visuelles, identité de marque.' },
  { nom: 'Wandji Nguele Estelle', role: 'Backend · GSI', bio: 'Développeuse back-end — logique métier côté serveur et API des modules Paiement et Établissement.' },
  { nom: 'Ebode Bikoro', role: 'Frontend · GSI', bio: 'Développeur front-end — intégration des interfaces utilisateur et expérience visuelle.' },
  { nom: 'Makueta Ngamba', role: 'Dev École · GSI', bio: 'Module Back-office École — gestion des apprenants, des frais et de l\'annuaire.' },
  { nom: 'Maffo Djoumessi', role: 'QA/DevOps · GSI', bio: 'Assurance qualité et DevOps — tests fonctionnels, suivi des anomalies, fiabilité.' },
  { nom: 'Eyamo Maguy Leticia', role: 'Design · GSA', bio: 'Conception du logo EduPay Cameroun et éléments graphiques de la charte visuelle.' },
  { nom: "N'ko Bisso Jerome", role: 'QA/Support · GSI', bio: 'Support et assurance qualité — parcours utilisateurs et remontée des anomalies.' },
];

export default function AProposScreen() {
  return (
    <View style={styles.container}>
      <PageHeader
        tag="À propos d'EduPay"
        titre="Notre mission"
        sousTitre="Une équipe camerounaise qui révolutionne le paiement des frais scolaires."
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        <View style={styles.missionCard}>
          <Target size={22} color="#0D9E75" />
          <Text style={styles.missionTxt}>
            Digitaliser le paiement des frais scolaires au Cameroun pour réduire les fraudes, améliorer la traçabilité et faciliter la vie des familles et des établissements.
          </Text>
        </View>

        <Text style={styles.secLabel}>NOS VALEURS</Text>
        <View style={styles.grid}>
          {VALEURS.map(({ titre, desc, Icone, couleur }) => (
            <View key={titre} style={styles.card}>
              <View style={[styles.cardIco, { backgroundColor: `${couleur}1A` }]}>
                <Icone size={18} color={couleur} />
              </View>
              <Text style={styles.cardTitre}>{titre}</Text>
              <Text style={styles.cardDesc}>{desc}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.secLabel}>CONTEXTE CAMEROUNAIS</Text>
        <View style={styles.statsRow}>
          {CONTEXTE.map(({ val, lbl }) => (
            <View key={lbl} style={styles.statCard}>
              <Text style={styles.statVal}>{val}</Text>
              <Text style={styles.statLbl}>{lbl}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.secLabel}>ÉQUIPE PROJET</Text>
        {EQUIPE.map((m) => (
          <View key={m.nom} style={styles.membreCard}>
            <View style={styles.membreAvatar}>
              <Text style={styles.membreAvatarTxt}>{m.nom.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.membreNom}>{m.nom}</Text>
              <Text style={styles.membreRole}>{m.role}</Text>
              <Text style={styles.membreBio}>{m.bio}</Text>
            </View>
          </View>
        ))}

        <View style={styles.footerNote}>
          <Heart size={14} color="#888888" />
          <Text style={styles.footerNoteTxt}>Réf. projet CDC-EDUPAY-CM-2026-001</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  content: { flex: 1, padding: 16 },
  missionCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#E0F5EE', borderRadius: 12, padding: 16, marginBottom: 24 },
  missionTxt: { flex: 1, fontSize: 12, color: '#085041', lineHeight: 17 },
  secLabel: { fontSize: 10, fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  card: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  cardIco: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cardTitre: { fontSize: 12, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  cardDesc: { fontSize: 10, color: '#888888', lineHeight: 14 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  statVal: { fontSize: 16, fontWeight: '800', color: '#0D9E75', marginBottom: 2 },
  statLbl: { fontSize: 10, color: '#888888', textAlign: 'center' },
  membreCard: { flexDirection: 'row', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  membreAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0B2545', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  membreAvatarTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  membreNom: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  membreRole: { fontSize: 10, color: '#0D9E75', fontWeight: '700', marginTop: 1, marginBottom: 4 },
  membreBio: { fontSize: 11, color: '#666666', lineHeight: 15 },
  footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  footerNoteTxt: { fontSize: 10, color: '#AAAAAA' },
});
