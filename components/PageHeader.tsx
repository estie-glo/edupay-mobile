import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

export default function PageHeader({ tag, titre, sousTitre }: { tag: string; titre: string; sousTitre?: string }) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <ArrowLeft size={18} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeTxt}>{tag}</Text>
      </View>
      <Text style={styles.titre}>{titre}</Text>
      {!!sousTitre && <Text style={styles.sousTitre}>{sousTitre}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 14 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0D9E75' },
  badgeTxt: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  titre: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  sousTitre: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 18 },
});
