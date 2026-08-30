import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CreditCard, Home, MessageSquareWarning, ScrollText, User } from 'lucide-react-native';

type Onglet = 'accueil' | 'paiement' | 'historique' | 'reclamations' | 'profil';

const ONGLETS: { cle: Onglet; label: string; Icone: typeof Home; route: string }[] = [
  { cle: 'accueil', label: 'Accueil', Icone: Home, route: '/screens/parent/DashboardScreen' },
  { cle: 'paiement', label: 'Paiement', Icone: CreditCard, route: '/screens/parent/PaiementScreen' },
  { cle: 'historique', label: 'Historique', Icone: ScrollText, route: '/screens/parent/HistoriqueScreen' },
  { cle: 'reclamations', label: 'Réclamations', Icone: MessageSquareWarning, route: '/screens/parent/ReclamationsScreen' },
  { cle: 'profil', label: 'Profil', Icone: User, route: '/screens/parent/DashboardScreen' },
];

export default function BottomNavParent({ actif }: { actif: Onglet }) {
  const router = useRouter();

  return (
    <View style={styles.bottomNav}>
      {ONGLETS.map(({ cle, label, Icone, route }) => {
        const estActif = cle === actif;
        return (
          <TouchableOpacity
            key={cle}
            style={styles.navItem}
            onPress={() => !estActif && router.push(route as any)}
          >
            <Icone size={20} color={estActif ? '#0D9E75' : '#AAAAAA'} />
            <Text style={[styles.navLbl, estActif && { color: '#0D9E75' }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingVertical: 8 },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navLbl: { fontSize: 9, color: '#AAAAAA', fontWeight: '600' },
});
