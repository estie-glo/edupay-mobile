import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function AccueilInviteScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

    {/* Bandeau invité */}
<View style={styles.guestBanner}>
  <View style={styles.guestLeft}>
    <Text style={styles.guestDot}>🧭</Text>
    <Text style={styles.guestTxt}>Mode invité — accès limité</Text>
  </View>
  <TouchableOpacity
    style={styles.guestBtn}
    onPress={() => router.push('/screens/parent/LoginParentScreen')}
  >
    <Text style={styles.guestBtnTxt}>Se connecter →</Text>
  </TouchableOpacity>
</View>

      {/* Header navy */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          Edu<Text style={styles.logoAccent}>Pay</Text>
        </Text>
        <Text style={styles.sousTitre}>
          La plateforme de paiement scolaire au Cameroun
        </Text>
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.btnConnexion}
            onPress={() => router.push('/screens/parent/LoginParentScreen')}
          >
            <Text style={styles.btnConnexionTxt}>Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnInscription}
            onPress={() => router.push('/screens/commun/ChoixProfilScreen')}
          >
            <Text style={styles.btnInscriptionTxt}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >

        {/* Section À découvrir */}
        <Text style={styles.sec}>À découvrir sans compte</Text>

        {/* Carte Écoles partenaires */}
        <TouchableOpacity
          style={styles.choixCard}
          onPress={() => router.push('/screens/commun/EcolesScreen')}
        >
          <View style={[styles.choixIco, { backgroundColor: '#FEF3DC' }]}>
            <Text style={styles.choixIcoTxt}>🏫</Text>
          </View>
          <View style={styles.choixTexts}>
            <Text style={styles.choixTitre}>Écoles partenaires</Text>
            <Text style={styles.choixSub}>127 établissements affiliés</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* Carte Simulateur */}
        <TouchableOpacity
          style={styles.choixCard}
          onPress={() => router.push('/screens/commun/SimulateurScreen')}
        >
          <View style={[styles.choixIco, { backgroundColor: '#E0F5EE' }]}>
            <Text style={styles.choixIcoTxt}>🧮</Text>
          </View>
          <View style={styles.choixTexts}>
            <Text style={styles.choixTitre}>Simuler mes frais</Text>
            <Text style={styles.choixSub}>Estimez le montant à payer</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* Carte Comment ça marche */}
        <TouchableOpacity
          style={styles.choixCard}
          onPress={() => router.push('/screens/commun/CommentScreen')}
        >
          <View style={[styles.choixIco, { backgroundColor: '#E6F0FB' }]}>
            <Text style={styles.choixIcoTxt}>❓</Text>
          </View>
          <View style={styles.choixTexts}>
            <Text style={styles.choixTitre}>Comment ça marche</Text>
            <Text style={styles.choixSub}>Le parcours en 4 étapes</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* Carte Dashboard — bloquée */}
        <TouchableOpacity
          style={[styles.choixCard, { opacity: 0.7 }]}
          onPress={() => router.push('/screens/parent/LoginParentScreen')}
        >
          <View style={[styles.choixIco, { backgroundColor: '#EDE9FE' }]}>
            <Text style={styles.choixIcoTxt}>📊</Text>
          </View>
          <View style={styles.choixTexts}>
            <Text style={styles.choixTitre}>Mon tableau de bord</Text>
            <Text style={styles.choixSub}>Nécessite un compte parent</Text>
          </View>
          <Text style={styles.arrow}>🔒</Text>
        </TouchableOpacity>

        {/* Stats box */}
        <View style={styles.statsBox}>
          <Text style={styles.statsSub}>Déjà sur EduPay</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>127</Text>
              <Text style={styles.statLbl}>Écoles</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>3 847</Text>
              <Text style={styles.statLbl}>Transactions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>99,5%</Text>
              <Text style={styles.statLbl}>Uptime</Text>
            </View>
          </View>
        </View>

        {/* FAQ link */}
        <Text style={styles.faqTxt}>
          Besoin d'aide ?{' '}
          <Text
            style={styles.faqLnk}
            onPress={() => router.push('/screens/commun/AideScreen')}
          >
            Consulter la FAQ
          </Text>
        </Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Bandeau invité
  guestBanner: {
  backgroundColor: '#0B2545',
  paddingHorizontal: 16,
  paddingVertical: 10,
   paddingTop: 44, 
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(255,255,255,0.1)',
},
guestLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},
guestDot: {
  fontSize: 12,
},
guestTxt: {
  fontSize: 11,
  fontWeight: '600',
  color: 'rgba(255,255,255,0.7)',
},
guestBtn: {
  backgroundColor: '#0D9E75',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
},
guestBtnTxt: {
  fontSize: 11,
  fontWeight: '700',
  color: '#FFFFFF',
},
  // Header
  header: {
    backgroundColor: '#0B2545',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  logoAccent: {
    color: '#5DCAA5',
  },
  sousTitre: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 20,
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnConnexion: {
    flex: 1,
    backgroundColor: '#0D9E75',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnConnexionTxt: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  btnInscription: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  btnInscriptionTxt: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },

  // Contenu scrollable
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -20,
  },
  sec: {
    fontSize: 10,
    fontWeight: '700',
    color: '#AAAAAA',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 10,
  },

  // Cartes de choix
  choixCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  choixIco: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  choixIcoTxt: {
    fontSize: 18,
  },
  choixTexts: {
    flex: 1,
  },
  choixTitre: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  choixSub: {
    fontSize: 11,
    color: '#888888',
  },
  arrow: {
    fontSize: 16,
    color: '#AAAAAA',
    flexShrink: 0,
  },

  // Stats
  statsBox: {
    backgroundColor: '#0B2545',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 14,
  },
  statsSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5DCAA5',
  },
  statLbl: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },

  // FAQ
  faqTxt: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888888',
  },
  faqLnk: {
    color: '#0D9E75',
    fontWeight: '700',
  },
});