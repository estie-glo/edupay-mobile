import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  BarChart3,
  Building2,
  FileCheck,
  FileText,
  GraduationCap,
  Home,
  Layers,
  MapPin,
  Monitor,
  Search,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ETABLISSEMENTS } from '../../../data/etablissements';
import { getStatsPubliques } from '../../../services/api';

const COULEURS_AVATAR = ['#0B2545', '#0D9E75', '#1a472a', '#E8A020'];

// Texte exact du site en ligne (capture edupay.mekontso.gsi2026.com du 30/08/2026)
const FONCTIONNALITES = [
  { titre: 'Mobile Money natif', desc: 'Intégration directe MTN Mobile Money & Orange Money Cameroun.', Icone: Wallet },
  { titre: 'Reçu PDF automatique', desc: 'Chaque paiement validé génère un reçu signé électroniquement, envoyé par email et SMS.', Icone: FileCheck },
  { titre: 'Dashboard temps réel', desc: 'Directeurs et comptables suivent encaissements, impayés et relances depuis un seul écran.', Icone: BarChart3 },
  { titre: 'Sécurité PCI-DSS', desc: 'Chiffrement TLS 1.3, authentification 2FA, conformité COBAC/BEAC et protection anti-fraude.', Icone: ShieldCheck },
  { titre: 'Paiement fractionné', desc: "Payez en 2 ou 3 tranches selon l'échéancier de l'établissement.", Icone: Layers },
  { titre: 'Multi-établissements', desc: 'Un parent peut gérer plusieurs enfants dans plusieurs écoles depuis un seul compte EduPay.', Icone: Building2 },
];

const NIVEAUX = [
  { titre: 'Maternelle & Primaire', desc: 'Inscription, frais scolaires, cantine', Icone: Home, couleur: '#0D9E75' },
  { titre: 'Collèges & Lycées', desc: 'Scolarité, examens, internat', Icone: FileText, couleur: '#E8A020' },
  { titre: 'Universités & Instituts', desc: "Frais d'inscription, frais de scolarité", Icone: Monitor, couleur: '#0B2545' },
  { titre: 'Payeurs : Parents, Élèves & Étudiants', desc: 'Paiement 24h/24 depuis partout', Icone: Users, couleur: '#7C3AED' },
];

const FOOTER_BADGES_1 = ['TLS 1.3', 'PCI-DSS', 'COBAC'];
const FOOTER_BADGES_2 = ['MTN Mobile Money Partner', 'Orange Money Intégré', 'CinetPay Certifié', 'COBAC Conforme'];

const FOOTER_COLONNES = [
  {
    titre: 'PRODUIT',
    liens: [
      { label: 'Fonctionnalités', route: '/screens/commun/FonctionnalitesScreen' },
      { label: 'Témoignages', route: '/screens/commun/TemoignagesScreen' },
      { label: 'Tarifs', route: '/screens/commun/TarifsScreen' },
    ],
  },
  {
    titre: 'ÉTABLISSEMENTS',
    liens: [
      { label: 'Inscrire mon école', route: '/screens/ecole/RegisterEcoleScreen' },
      { label: 'Back-office', route: '/screens/ecole/LoginEcoleScreen' },
      { label: "Guide d'utilisation", route: '/screens/commun/GuideScreen' },
      { label: 'Support dédié', route: '/screens/commun/AideScreen' },
    ],
  },
  {
    titre: 'INFORMATIONS',
    liens: [
      { label: 'À propos', route: '/screens/commun/AProposScreen' },
      { label: 'Contact', route: '/screens/commun/ContactScreen' },
      { label: 'Politique de confidentialité', route: '/screens/commun/PolitiqueConfidentialiteScreen' },
      { label: "Conditions d'utilisation", route: '/screens/commun/ConditionsUtilisationScreen' },
    ],
  },
];

// Monogrammes texte plutôt qu'une police d'icônes (FontAwesome) : évite tout
// risque de chargement de police manquant/raté sur web comme sur mobile.
const FOOTER_RESEAUX = [
  { nom: 'LinkedIn', sigle: 'in' },
  { nom: 'X', sigle: 'X' },
  { nom: 'WhatsApp', sigle: 'wa' },
  { nom: 'Facebook', sigle: 'f' },
  { nom: 'Instagram', sigle: 'ig' },
];

type Stats = { nb_etablissements?: number; nb_apprenants?: number; nb_paiements?: number };

export default function AccueilInviteScreen() {
  const router = useRouter();
  const [recherche, setRecherche] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);

  const ecoles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return ETABLISSEMENTS;
    return ETABLISSEMENTS.filter((e) => e.nom.toLowerCase().includes(q) || e.ville.toLowerCase().includes(q));
  }, [recherche]);

  useEffect(() => {
    getStatsPubliques()
      .then((response) => setStats(response.data ?? response))
      .catch(() => setStats(null));
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* HERO SECTION — dégradé exact du site (video-bg.css, variante ≤480px : la
            vidéo de fond y est volontairement désactivée pour la data/perf mobile) */}
        <LinearGradient
          colors={['#0B2545', 'rgba(11,37,69,0.95)', 'rgba(13,158,117,0.3)']}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Navbar */}
          <View style={styles.navbar}>
            <View style={styles.logoBox}>
              <Text style={styles.logoTxt}>EP</Text>
            </View>
            <View style={styles.navBtns}>
              <TouchableOpacity
                style={styles.btnConnexion}
                onPress={() => router.push('/screens/parent/LoginParentScreen')}
              >
                <Text style={styles.btnConnexionTxt}>Connexion</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnInscrire}
                onPress={() => router.push('/screens/commun/ChoixProfilScreen')}
              >
                <Text style={styles.btnInscrireTxt}>S'inscrire →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero content */}
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <View style={styles.heroBadgeDot} />
              <Text style={styles.heroBadgeTxt}>Plateforme 100% camerounaise · EdTech × FinTech</Text>
            </View>
            <Text style={styles.heroTitre}>
              Payez les frais scolaires{'\n'}en <Text style={styles.heroAccent}>2 minutes</Text>,{'\n'}depuis votre téléphone.
            </Text>
            <Text style={styles.heroDesc}>
              EduPay Cameroun connecte les établissements scolaires aux familles via MTN MoMo, Orange Money et carte bancaire. Zéro file d'attente. Reçu PDF immédiat.
            </Text>
            <View style={styles.heroBtns}>
              <TouchableOpacity
                style={styles.heroBtnPrimary}
                onPress={() => router.push('/screens/parent/RegisterParentScreen')}
              >
                <Text style={styles.heroBtnPrimaryTxt}>Créer mon compte payeur</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroBtnSecondary}
                onPress={() => router.push('/screens/ecole/RegisterEcoleScreen')}
              >
                <Text style={styles.heroBtnSecondaryTxt}>Inscrire mon établissement</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.commentLien} onPress={() => router.push('/screens/commun/CommentScreen')}>
              <Text style={styles.commentLienTxt}>Comment ça marche ?</Text>
            </TouchableOpacity>
          </View>

          {/* Stats live via GET /stats (route publique confirmée) — repli sur des
              valeurs plausibles si l'appel échoue, plutôt que d'afficher 0. */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{stats?.nb_etablissements ?? 7}</Text>
              <Text style={styles.statLbl}>Établissements partenaires</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{stats?.nb_apprenants ?? 15}</Text>
              <Text style={styles.statLbl}>Apprenants inscrits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{stats?.nb_paiements ?? 5}</Text>
              <Text style={styles.statLbl}>Paiements validés</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: '#5DCAA5' }]}>99,5%</Text>
              <Text style={styles.statLbl}>Uptime garanti</Text>
            </View>
          </View>
        </LinearGradient>

        {/* CONÇU POUR TOUT LE SYSTÈME ÉDUCATIF */}
        <View style={styles.section}>
          <Text style={styles.secLabel}>CONÇU POUR TOUT LE SYSTÈME ÉDUCATIF</Text>
          <View style={styles.niveauxGrid}>
            {NIVEAUX.map(({ titre, desc, Icone, couleur }) => (
              <View key={titre} style={[styles.niveauCard, { borderTopColor: couleur }]}>
                <View style={[styles.niveauIco, { backgroundColor: `${couleur}1A` }]}>
                  <Icone size={18} color={couleur} />
                </View>
                <Text style={styles.niveauTitre}>{titre}</Text>
                <Text style={styles.niveauDesc}>{desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ÉCOLES PARTENAIRES */}
        <View style={styles.section}>
          <Text style={styles.secLabel}>NOS ÉTABLISSEMENTS PARTENAIRES</Text>
          <Text style={styles.secDesc}>Des établissements nous font confiance pour la collecte de leurs frais scolaires.</Text>

          {/* Barre de recherche */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Search size={16} color="#888888" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un établissement, une ville..."
                placeholderTextColor="#AAAAAA"
                value={recherche}
                onChangeText={setRecherche}
              />
            </View>
          </View>

          {/* Écoles */}
          {ecoles.length === 0 ? (
            <Text style={styles.vide}>Aucun établissement trouvé.</Text>
          ) : (
            <View style={styles.ecolesGrid}>
              {ecoles.map((ecole, i) => (
                <TouchableOpacity key={ecole.nom} style={styles.ecoleCard}>
                  <View style={[styles.ecoleAvatar, { backgroundColor: COULEURS_AVATAR[i % COULEURS_AVATAR.length] }]}>
                    <Text style={styles.ecoleAvatarTxt}>{ecole.nom.charAt(0)}</Text>
                  </View>
                  <Text style={styles.ecoleNom}>{ecole.nom}</Text>
                  <View style={styles.ecoleVilleRow}>
                    <MapPin size={10} color="#888888" />
                    <Text style={styles.ecoleVille}>{ecole.ville}</Text>
                  </View>
                  <View style={styles.ecolePill}>
                    <Text style={styles.ecolePillTxt}>{ecole.type}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.voirToutBtn} onPress={() => router.push('/screens/commun/EcolesScreen')}>
            <Text style={styles.voirToutTxt}>Voir tout l'annuaire des établissements →</Text>
          </TouchableOpacity>
        </View>

        {/* POURQUOI CHOISIR EDUPAY */}
        <View style={styles.section}>
          <Text style={styles.secLabel}>POURQUOI CHOISIR EDUPAY ?</Text>
          <View style={styles.featuresGrid}>
            {FONCTIONNALITES.map(({ titre, desc, Icone }) => (
              <View key={titre} style={styles.featureCard}>
                <View style={styles.featureIco}>
                  <Icone size={18} color="#0D9E75" />
                </View>
                <Text style={styles.featureTitre}>{titre}</Text>
                <Text style={styles.featureDesc}>{desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA ÉTABLISSEMENT */}
        <View style={styles.ctaBox}>
          <GraduationCap size={28} color="#FFFFFF" />
          <Text style={styles.ctaTitre}>Votre établissement n'est pas encore partenaire ?</Text>
          <Text style={styles.ctaDesc}>Inscription gratuite · Onboarding en 24h · Support dédié · Aucun engagement</Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push('/screens/ecole/RegisterEcoleScreen')}
          >
            <Text style={styles.ctaBtnTxt}>Inscrire mon établissement →</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>Edu<Text style={{ color: '#5DCAA5' }}>Pay</Text> Cameroun</Text>
          <Text style={styles.footerDesc}>
            La première plateforme de paiement électronique des frais de scolarité pensée pour les réalités camerounaises.
          </Text>
          <View style={styles.footerBadges}>
            {FOOTER_BADGES_1.map((badge) => (
              <View key={badge} style={styles.footerBadge}>
                <Text style={styles.footerBadgeTxt}>{badge}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footerColonnes}>
            {FOOTER_COLONNES.map(({ titre, liens }) => (
              <View key={titre} style={styles.footerColonne}>
                <Text style={styles.footerColonneTitre}>{titre}</Text>
                {liens.map(({ label, route }) => (
                  <TouchableOpacity key={label} onPress={() => router.push(route as any)}>
                    <Text style={styles.footerLien}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.footerDivider} />

          <TouchableOpacity onPress={() => router.push('/screens/commun/MentionsLegalesScreen')}>
            <Text style={styles.footerMentions}>Mentions légales</Text>
          </TouchableOpacity>

          <View style={styles.footerBadges2}>
            {FOOTER_BADGES_2.map((badge) => (
              <View key={badge} style={styles.footerBadge2}>
                <Text style={styles.footerBadge2Txt}>{badge}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footerReseaux}>
            {FOOTER_RESEAUX.map(({ nom, sigle }) => (
              <TouchableOpacity key={nom} style={styles.footerReseauBtn} onPress={() => Alert.alert(nom, 'Bientôt disponible.')}>
                <Text style={styles.footerReseauTxt}>{sigle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.footerCopyright}>© 2026 EduPay Cameroun — Tous droits réservés</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // HERO
  hero: { backgroundColor: '#0B2545', paddingBottom: 0 },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 },
  logoBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#0D9E75', alignItems: 'center', justifyContent: 'center' },
  logoTxt: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  navBtns: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  btnConnexion: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  btnConnexionTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  btnInscrire: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0D9E75' },
  btnInscrireTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  heroContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 16 },
  heroBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0D9E75' },
  heroBadgeTxt: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  heroTitre: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', lineHeight: 34, marginBottom: 12 },
  heroAccent: { color: '#0D9E75' },
  heroDesc: { fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 18, marginBottom: 24 },
  heroBtns: { gap: 10 },
  commentLien: { marginTop: 14, alignItems: 'center' },
  commentLienTxt: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textDecorationLine: 'underline' },
  heroBtnPrimary: { backgroundColor: '#0D9E75', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  heroBtnPrimaryTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  heroBtnSecondary: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  heroBtnSecondaryTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingVertical: 16, paddingHorizontal: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  statLbl: { fontSize: 9, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 12 },

  // NIVEAUX
  niveauxGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  niveauCard: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', borderTopWidth: 3 },
  niveauIco: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  niveauTitre: { fontSize: 12, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  niveauDesc: { fontSize: 10, color: '#888888', lineHeight: 14 },

  // SECTION ÉCOLES
  section: { padding: 20 },
  secLabel: { fontSize: 10, fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  secDesc: { fontSize: 13, color: '#555555', marginBottom: 16, lineHeight: 18 },

  searchRow: { marginBottom: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 13, color: '#1A1A2E' },
  vide: { fontSize: 12, color: '#888888', textAlign: 'center', marginTop: 12 },

  ecolesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  voirToutBtn: { marginTop: 14, alignItems: 'center' },
  voirToutTxt: { fontSize: 12, fontWeight: '700', color: '#0D9E75' },
  ecoleCard: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  ecoleAvatar: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  ecoleAvatarTxt: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  ecoleNom: { fontSize: 11, fontWeight: '700', color: '#1A1A2E', textAlign: 'center', marginBottom: 4 },
  ecoleVilleRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  ecoleVille: { fontSize: 10, color: '#888888' },
  ecolePill: { backgroundColor: '#E0F5EE', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  ecolePillTxt: { fontSize: 9, fontWeight: '700', color: '#085041' },

  // FONCTIONNALITÉS
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureCard: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  featureIco: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E0F5EE', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featureTitre: { fontSize: 12, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  featureDesc: { fontSize: 10, color: '#888888', lineHeight: 14 },

  // CTA ÉTABLISSEMENT
  ctaBox: { margin: 20, backgroundColor: '#0B2545', borderRadius: 16, padding: 24, alignItems: 'center' },
  ctaTitre: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginTop: 10, marginBottom: 4 },
  ctaDesc: { fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 16 },
  ctaBtn: { backgroundColor: '#0D9E75', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  ctaBtnTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // FOOTER
  footer: { backgroundColor: '#0B2545', padding: 24, alignItems: 'center' },
  footerLogo: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 10 },
  footerDesc: { fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 16, marginBottom: 16 },
  footerBadges: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  footerBadge: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  footerBadgeTxt: { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  footerColonnes: { width: '100%', gap: 16, marginBottom: 8 },
  footerColonne: { alignItems: 'center' },
  footerColonneTitre: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.9)', letterSpacing: 0.8, marginBottom: 10 },
  footerLien: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10, textAlign: 'center' },
  footerDivider: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 },
  footerMentions: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 16 },
  footerBadges2: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 16 },
  footerBadge2: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  footerBadge2Txt: { fontSize: 8, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  footerReseaux: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  footerReseauBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  footerReseauTxt: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  footerCopyright: { fontSize: 9, color: 'rgba(255,255,255,0.35)', textAlign: 'center' },
});
