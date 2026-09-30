import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Bell, BellRing, CheckCheck } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getNotifications, marquerNotificationLue, marquerNotificationsLues } from '../../../services/api';
import Card from '../../../components/ui/Card';

// Forme exacte de NotificationResource (vérifiée le 26/09/2026) :
// {id, titre, message, type, lu, lu_at, created_at}.
type Notif = {
  id: number;
  titre?: string;
  message?: string;
  type?: string;
  lu: boolean;
  created_at?: string;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [toutMarquerEnCours, setToutMarquerEnCours] = useState(false);

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/parent/LoginParentScreen');
      return;
    }
    if (token) charger();
  }, [token, authLoading]);

  const charger = async () => {
    setLoading(true);
    try {
      const reponse = await getNotifications();
      setNotifs(reponse.data ?? []);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarquerUne = async (n: Notif) => {
    if (n.lu) return;
    setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, lu: true } : x)));
    try {
      await marquerNotificationLue(n.id);
    } catch {
      charger();
    }
  };

  const handleToutMarquer = async () => {
    setToutMarquerEnCours(true);
    try {
      await marquerNotificationsLues();
      setNotifs((prev) => prev.map((n) => ({ ...n, lu: true })));
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de marquer les notifications comme lues');
    } finally {
      setToutMarquerEnCours(false);
    }
  };

  const nbNonLues = notifs.filter((n) => !n.lu).length;

  if (loading) {
    return <ActivityIndicator size="large" color="#0D9E75" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.titre}>Notifications</Text>
        {nbNonLues > 0 ? (
          <TouchableOpacity style={styles.toutBtn} onPress={handleToutMarquer} disabled={toutMarquerEnCours}>
            {toutMarquerEnCours ? <ActivityIndicator size="small" color="#FFFFFF" /> : <CheckCheck size={18} color="#FFFFFF" />}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {notifs.length === 0 ? (
          <View style={styles.videBox}>
            <Bell size={32} color="#CCCCCC" />
            <Text style={styles.vide}>Aucune notification pour le moment.</Text>
          </View>
        ) : (
          notifs.map((n) => (
            <Card
              key={n.id}
              style={[styles.card, !n.lu && styles.cardNonLue]}
              onPress={() => handleMarquerUne(n)}
            >
              <View style={styles.cardIco}>
                {n.lu ? <Bell size={16} color="#AAAAAA" /> : <BellRing size={16} color="#0D9E75" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitre, !n.lu && styles.cardTitreNonLue]}>{n.titre || 'Notification'}</Text>
                <Text style={styles.cardMessage}>{n.message}</Text>
                {!!n.created_at && <Text style={styles.cardDate}>{new Date(n.created_at).toLocaleDateString('fr-FR')}</Text>}
              </View>
              {!n.lu && <View style={styles.pointNonLu} />}
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  toutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, padding: 16 },
  videBox: { alignItems: 'center', marginTop: 60, gap: 10 },
  vide: { fontSize: 13, color: '#888888' },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, marginBottom: 8 },
  cardNonLue: { borderWidth: 1.5, borderColor: '#0D9E75', backgroundColor: '#F3FBF8' },
  cardIco: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F0F2F5', alignItems: 'center', justifyContent: 'center' },
  cardTitre: { fontSize: 13, fontWeight: '600', color: '#555555' },
  cardTitreNonLue: { fontWeight: '800', color: '#1A1A2E' },
  cardMessage: { fontSize: 12, color: '#666666', marginTop: 3, lineHeight: 17 },
  cardDate: { fontSize: 10, color: '#AAAAAA', marginTop: 6 },
  pointNonLu: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0D9E75', marginTop: 4 },
});
