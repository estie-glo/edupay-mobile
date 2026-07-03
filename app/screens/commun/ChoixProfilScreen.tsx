import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ChoixProfilScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titre}>Bienvenue 👋</Text>
        <Text style={styles.sousTitre}>
          Comment souhaitez-vous continuer sur EduPay ?
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >

        {/* Parent */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/screens/parent/LoginParentScreen')}
        >
          <View style={[styles.ico, { backgroundColor: '#E0F5EE' }]}>
            <Text style={styles.icoTxt}>👨‍👩‍👧</Text>
          </View>
          <View style={styles.texts}>
            <Text style={styles.cardTitre}>Parent / Élève</Text>
            <Text style={styles.cardSub}>
              Payez les frais scolaires, suivez vos paiements et vos enfants.
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* Établissement */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/screens/ecole/LoginEcoleScreen')}
        >
          <View style={[styles.ico, { backgroundColor: '#FEF3DC' }]}>
            <Text style={styles.icoTxt}>🏫</Text>
          </View>
          <View style={styles.texts}>
            <Text style={styles.cardTitre}>Établissement</Text>
            <Text style={styles.cardSub}>
              Gérez les encaissements, apprenants et réclamations de votre école.
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* Invité */}
        <TouchableOpacity
          style={[styles.card, { borderColor: '#E6F0FB' }]}
          onPress={() => router.back()}
        >
          <View style={[styles.ico, { backgroundColor: '#E6F0FB' }]}>
            <Text style={styles.icoTxt}>🧭</Text>
          </View>
          <View style={styles.texts}>
            <Text style={styles.cardTitre}>Continuer en invité</Text>
            <Text style={styles.cardSub}>
              Découvrez l'app, les écoles partenaires et simulez vos frais.
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Vous pourrez créer un compte ou vous connecter à tout moment.
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
  header: {
    backgroundColor: '#0B2545',
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  backTxt: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  titre: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  sousTitre: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 18,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  ico: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icoTxt: {
    fontSize: 24,
  },
  texts: {
    flex: 1,
  },
  cardTitre: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 11,
    color: '#888888',
    lineHeight: 15,
  },
  arrow: {
    fontSize: 18,
    color: '#AAAAAA',
    flexShrink: 0,
  },
  note: {
    textAlign: 'center',
    fontSize: 11,
    color: '#AAAAAA',
    marginTop: 8,
  },
});