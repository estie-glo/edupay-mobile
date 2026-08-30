import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ArrowLeft, ArrowRight, Compass, School, Users } from 'lucide-react-native';

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
          <ArrowLeft size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.titre}>Bienvenue</Text>
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
            <Users size={22} color="#0D9E75" />
          </View>
          <View style={styles.texts}>
            <Text style={styles.cardTitre}>Parent / Élève</Text>
            <Text style={styles.cardSub}>
              Payez les frais scolaires, suivez vos paiements et vos enfants.
            </Text>
          </View>
          <ArrowRight size={18} color="#AAAAAA" />
        </TouchableOpacity>

        {/* Établissement */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/screens/ecole/LoginEcoleScreen')}
        >
          <View style={[styles.ico, { backgroundColor: '#FEF3DC' }]}>
            <School size={22} color="#E8A020" />
          </View>
          <View style={styles.texts}>
            <Text style={styles.cardTitre}>Établissement</Text>
            <Text style={styles.cardSub}>
              Gérez les encaissements, apprenants et réclamations de votre école.
            </Text>
          </View>
          <ArrowRight size={18} color="#AAAAAA" />
        </TouchableOpacity>

        {/* Invité */}
        <TouchableOpacity
          style={[styles.card, { borderColor: '#E6F0FB' }]}
          onPress={() => router.back()}
        >
          <View style={[styles.ico, { backgroundColor: '#E6F0FB' }]}>
            <Compass size={22} color="#1A4E8A" />
          </View>
          <View style={styles.texts}>
            <Text style={styles.cardTitre}>Continuer en invité</Text>
            <Text style={styles.cardSub}>
              Découvrez l'app, les écoles partenaires et simulez vos frais.
            </Text>
          </View>
          <ArrowRight size={18} color="#AAAAAA" />
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
  note: {
    textAlign: 'center',
    fontSize: 11,
    color: '#AAAAAA',
    marginTop: 8,
  },
});
