import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RefreshCw, WifiOff } from 'lucide-react-native';

export default function OfflineScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.iconeBox}>
        <WifiOff size={40} color="#D94040" />
      </View>
      <Text style={styles.titre}>Pas de connexion</Text>
      <Text style={styles.desc}>
        Impossible de joindre EduPay. Vérifiez votre connexion Internet ou vos données mobiles, puis réessayez.
      </Text>
      <TouchableOpacity style={styles.btnReessayer} onPress={() => router.back()}>
        <RefreshCw size={16} color="#FFFFFF" />
        <Text style={styles.btnReessayerTxt}>Réessayer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7', alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconeBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FBEAEA', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  titre: { fontSize: 20, fontWeight: '800', color: '#1A1A2E', marginBottom: 10 },
  desc: { fontSize: 13, color: '#666666', textAlign: 'center', lineHeight: 19, marginBottom: 28 },
  btnReessayer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0D9E75', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  btnReessayerTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
