import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Plus, Shield, Trash2, UserCog } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { changerRoleUtilisateur, getUtilisateursEcole, inviterUtilisateurEcole, supprimerUtilisateurEcole } from '../../../services/api';

type Utilisateur = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role?: string; // directeur | comptable | caissier
};

const ROLE_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  directeur: { bg: '#E6F0FB', fg: '#1A4E8A', label: 'Directeur' },
  comptable: { bg: '#E0F5EE', fg: '#085041', label: 'Comptable' },
  caissier: { bg: '#FEF3DC', fg: '#8B5E10', label: 'Caissier' },
};

const ROLES_ASSIGNABLES: { valeur: 'comptable' | 'caissier'; label: string }[] = [
  { valeur: 'comptable', label: 'Comptable' },
  { valeur: 'caissier', label: 'Caissier' },
];

export default function EcoleUtilisateursScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading, user } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOuvert, setFormOuvert] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'comptable' | 'caissier'>('comptable');

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/ecole/LoginEcoleScreen');
      return;
    }
    if (token) charger();
  }, [token, authLoading]);

  const charger = async () => {
    setLoading(true);
    try {
      const response = await getUtilisateursEcole();
      const data = response.data ?? response;
      setUtilisateurs(Array.isArray(data) ? data : data.utilisateurs ?? []);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const resetFormulaire = () => {
    setFormOuvert(false);
    setPrenom('');
    setNom('');
    setEmail('');
    setRole('comptable');
  };

  const handleInviter = async () => {
    if (!prenom || !nom || !email) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setEnvoi(true);
    try {
      await inviterUtilisateurEcole({ prenom, nom, email, role });
      Alert.alert('Invitation envoyée', `${prenom} ${nom} recevra un email avec un mot de passe temporaire.`);
      resetFormulaire();
      charger();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || "Impossible d'inviter cet utilisateur");
    } finally {
      setEnvoi(false);
    }
  };

  const handleChangerRole = (u: Utilisateur) => {
    const autreRole = u.role === 'comptable' ? 'caissier' : 'comptable';
    Alert.alert('Changer le rôle ?', `${u.prenom} ${u.nom} passera de ${u.role} à ${autreRole}.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Confirmer',
        onPress: async () => {
          try {
            await changerRoleUtilisateur(u.id, autreRole);
            charger();
          } catch (error: any) {
            Alert.alert('Erreur', error.response?.data?.message || 'Changement de rôle impossible');
          }
        },
      },
    ]);
  };

  const handleSupprimer = (u: Utilisateur) => {
    Alert.alert('Retirer cet accès ?', `${u.prenom} ${u.nom} n'aura plus accès au back-office.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          try {
            await supprimerUtilisateurEcole(u.id);
            charger();
          } catch (error: any) {
            Alert.alert('Erreur', error.response?.data?.message || 'Suppression impossible');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#E8A020" style={{ flex: 1 }} />;
  }

  const estDirecteur = user?.role === 'directeur';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.titre}>Utilisateurs internes</Text>
        {estDirecteur && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setFormOuvert(true)}>
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {!estDirecteur && (
          <View style={styles.infoBox}>
            <Shield size={14} color="#8B5E10" />
            <Text style={styles.infoTxt}>Seul le directeur peut inviter ou retirer des utilisateurs.</Text>
          </View>
        )}

        {formOuvert && (
          <View style={styles.formCard}>
            <Text style={styles.formTitre}>Inviter un utilisateur</Text>
            <Text style={styles.lbl}>Prénom *</Text>
            <TextInput style={styles.input} placeholder="ex : Marc" placeholderTextColor="#AAAAAA" value={prenom} onChangeText={setPrenom} />
            <Text style={styles.lbl}>Nom *</Text>
            <TextInput style={styles.input} placeholder="ex : DJOMO" placeholderTextColor="#AAAAAA" value={nom} onChangeText={setNom} />
            <Text style={styles.lbl}>Email *</Text>
            <TextInput style={styles.input} placeholder="email@ecole.cm" placeholderTextColor="#AAAAAA" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.lbl}>Rôle *</Text>
            <View style={styles.chipsRow}>
              {ROLES_ASSIGNABLES.map((r) => (
                <TouchableOpacity key={r.valeur} style={[styles.chip, role === r.valeur && styles.chipActive]} onPress={() => setRole(r.valeur)}>
                  <Text style={[styles.chipTxt, role === r.valeur && styles.chipTxtActive]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.note}>Un mot de passe temporaire sera envoyé par email.</Text>
            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.btnAnnuler} onPress={resetFormulaire}>
                <Text style={styles.btnAnnulerTxt}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnEnvoyer, envoi && { opacity: 0.7 }]} onPress={handleInviter} disabled={envoi}>
                {envoi ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnEnvoyerTxt}>Inviter</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {utilisateurs.length === 0 ? (
          <Text style={styles.vide}>Aucun utilisateur.</Text>
        ) : (
          utilisateurs.map((u) => {
            const r = ROLE_STYLE[(u.role || 'caissier').toLowerCase()] || ROLE_STYLE.caissier;
            return (
              <View key={u.id} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nom}>{u.prenom} {u.nom}</Text>
                  <Text style={styles.email}>{u.email}</Text>
                </View>
                <View style={[styles.pill, { backgroundColor: r.bg }]}>
                  <Text style={[styles.pillTxt, { color: r.fg }]}>{r.label}</Text>
                </View>
                {estDirecteur && u.role !== 'directeur' && (
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => handleChangerRole(u)}>
                      <UserCog size={16} color="#0B2545" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSupprimer(u)}>
                      <Trash2 size={16} color="#D94040" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  addBtn: { backgroundColor: '#E8A020', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, padding: 16 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF3DC', borderRadius: 10, padding: 12, marginBottom: 16 },
  infoTxt: { flex: 1, fontSize: 11, color: '#8B5E10' },
  vide: { fontSize: 13, color: '#888888', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  nom: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  email: { fontSize: 11, color: '#888888', marginTop: 2 },
  pill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0 },
  pillTxt: { fontSize: 10, fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: 12, marginLeft: 4 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  formTitre: { fontSize: 14, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F5F6F7', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1, backgroundColor: '#F5F6F7', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  chipActive: { backgroundColor: '#E8A020', borderColor: '#E8A020' },
  chipTxt: { fontSize: 12, fontWeight: '700', color: '#1A1A2E' },
  chipTxtActive: { color: '#FFFFFF' },
  note: { fontSize: 10, color: '#AAAAAA', marginTop: 10 },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnAnnuler: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  btnAnnulerTxt: { color: '#666666', fontSize: 12, fontWeight: '700' },
  btnEnvoyer: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#E8A020' },
  btnEnvoyerTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
