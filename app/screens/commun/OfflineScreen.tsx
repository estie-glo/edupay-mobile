import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { RefreshCw, WifiOff } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import PrimaryButton from '../../../components/ui/PrimaryButton';

export default function OfflineScreen() {
  const router = useRouter();
  const { token, user } = useAuth();

  // `router.back()` ne suffit pas : la connexion et l'inscription utilisent
  // `router.replace(...)`, donc l'écran authentifié (dashboard) est souvent
  // le SEUL élément de l'historique — après le replace vers cet écran hors
  // ligne, `canGoBack()` est faux et "Réessayer" ne faisait plus rien.
  // On revient plutôt vers le bon tableau de bord selon la session active.
  const reessayer = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (token) {
      router.replace(user?.role ? '/screens/ecole/BackOfficeScreen' : '/screens/parent/DashboardScreen');
    } else {
      router.replace('/screens/commun/AccueilInviteScreen');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconeBox}>
        <WifiOff size={40} color="#D94040" />
      </View>
      <Text style={styles.titre}>Pas de connexion</Text>
      <Text style={styles.desc}>
        Impossible de joindre EduPay. Vérifiez votre connexion Internet ou vos données mobiles, puis réessayez.
      </Text>
      <PrimaryButton title="Réessayer" onPress={reessayer} icon={<RefreshCw size={16} color="#FFFFFF" />} style={styles.btnReessayer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7', alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconeBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FBEAEA', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  titre: { fontSize: 20, fontWeight: '800', color: '#1A1A2E', marginBottom: 10 },
  desc: { fontSize: 13, color: '#666666', textAlign: 'center', lineHeight: 19, marginBottom: 28 },
  btnReessayer: { paddingHorizontal: 28 },
});
