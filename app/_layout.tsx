import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="screens/commun/AccueilInviteScreen" />
      <Stack.Screen name="screens/commun/ChoixProfilScreen" />
      <Stack.Screen name="screens/commun/AideScreen" />
      <Stack.Screen name="screens/commun/OfflineScreen" />
      <Stack.Screen name="screens/commun/EcolesScreen" />
      <Stack.Screen name="screens/commun/SimulateurScreen" />
      <Stack.Screen name="screens/commun/CommentScreen" />
      <Stack.Screen name="screens/parent/LoginParentScreen" />
      <Stack.Screen name="screens/parent/RegisterParentScreen" />
      <Stack.Screen name="screens/parent/DashboardScreen" />
      <Stack.Screen name="screens/parent/PaiementScreen" />
      <Stack.Screen name="screens/parent/HistoriqueScreen" />
      <Stack.Screen name="screens/parent/EcheancierScreen" />
      <Stack.Screen name="screens/parent/EnfantsScreen" />
      <Stack.Screen name="screens/parent/ReclamationsScreen" />
      <Stack.Screen name="screens/ecole/LoginEcoleScreen" />
      <Stack.Screen name="screens/ecole/RegisterEcoleScreen" />
      <Stack.Screen name="screens/ecole/EcoleKycScreen" />
      <Stack.Screen name="screens/ecole/BackOfficeScreen" />
      <Stack.Screen name="screens/admin/SuperAdminScreen" />
      <Stack.Screen name="screens/parent/PaiementSuccessScreen" />
    </Stack>
    </AuthProvider>
  );
}
