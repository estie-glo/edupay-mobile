import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Building2, Lock, MapPinned, Plus, Trash2 } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { creerSite, getSites, supprimerSite } from '../../../services/api';

type Site = { id: number; nom: string; ville: string; adresse?: string; telephone?: string };

export default function EcoleSitesScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [nonEligible, setNonEligible] = useState(false);
  const [formOuvert, setFormOuvert] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  const [nom, setNom] = useState('');
  const [ville, setVille] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');

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
      const response = await getSites();
      const data = response.data ?? response;
      setSites(Array.isArray(data) ? data : data.sites ?? []);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setNonEligible(true);
      } else {
        Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger les sites');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetFormulaire = () => {
    setFormOuvert(false);
    setNom('');
    setVille('');
    setAdresse('');
    setTelephone('');
  };

  const handleCreer = async () => {
    if (!nom || !ville) {
      Alert.alert('Erreur', 'Veuillez renseigner le nom et la ville');
      return;
    }
    setEnvoi(true);
    try {
      await creerSite({ nom, ville, adresse: adresse || undefined, telephone: telephone || undefined });
      resetFormulaire();
      charger();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de créer ce site');
    } finally {
      setEnvoi(false);
    }
  };

  const handleSupprimer = (s: Site) => {
    Alert.alert('Supprimer ce site ?', `« ${s.nom} » sera retiré.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await supprimerSite(s.id);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.titre}>Sites (multi-établissements)</Text>
        {!nonEligible && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setFormOuvert(true)}>
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {nonEligible ? (
          <View style={styles.upsellCard}>
            <View style={styles.upsellIco}>
              <Lock size={22} color="#E8A020" />
            </View>
            <Text style={styles.upsellTitre}>Fonctionnalité Standard / Premium</Text>
            <Text style={styles.upsellDesc}>La gestion multi-sites permet de piloter plusieurs campus depuis un seul compte. Passez à la formule Standard ou Premium pour l'activer.</Text>
            <TouchableOpacity style={styles.upsellBtn} onPress={() => router.push('/screens/commun/TarifsScreen')}>
              <Text style={styles.upsellBtnTxt}>Voir les formules →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {formOuvert && (
              <View style={styles.formCard}>
                <Text style={styles.formTitre}>Nouveau site</Text>
                <Text style={styles.lbl}>Nom du site *</Text>
                <TextInput style={styles.input} placeholder="ex : Campus Bastos" placeholderTextColor="#AAAAAA" value={nom} onChangeText={setNom} />
                <Text style={styles.lbl}>Ville *</Text>
                <TextInput style={styles.input} placeholder="ex : Yaoundé" placeholderTextColor="#AAAAAA" value={ville} onChangeText={setVille} />
                <Text style={styles.lbl}>Adresse (optionnel)</Text>
                <TextInput style={styles.input} placeholder="Quartier, rue..." placeholderTextColor="#AAAAAA" value={adresse} onChangeText={setAdresse} />
                <Text style={styles.lbl}>Téléphone (optionnel)</Text>
                <TextInput style={styles.input} placeholder="6XXXXXXXX" placeholderTextColor="#AAAAAA" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" />
                <View style={styles.formBtns}>
                  <TouchableOpacity style={styles.btnAnnuler} onPress={resetFormulaire}>
                    <Text style={styles.btnAnnulerTxt}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btnEnvoyer, envoi && { opacity: 0.7 }]} onPress={handleCreer} disabled={envoi}>
                    {envoi ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnEnvoyerTxt}>Créer</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {sites.length === 0 ? (
              <Text style={styles.vide}>Aucun site secondaire pour le moment.</Text>
            ) : (
              sites.map((s) => (
                <View key={s.id} style={styles.card}>
                  <View style={styles.cardIco}>
                    <Building2 size={18} color="#E8A020" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nom}>{s.nom}</Text>
                    <View style={styles.villeRow}>
                      <MapPinned size={11} color="#888888" />
                      <Text style={styles.ville}>{s.ville}{s.adresse ? ` · ${s.adresse}` : ''}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleSupprimer(s)}>
                    <Trash2 size={16} color="#D94040" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', flex: 1, marginHorizontal: 10 },
  addBtn: { backgroundColor: '#E8A020', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, padding: 16 },
  vide: { fontSize: 13, color: '#888888', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardIco: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF3DC', alignItems: 'center', justifyContent: 'center' },
  nom: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  villeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  ville: { fontSize: 11, color: '#888888' },
  upsellCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  upsellIco: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FEF3DC', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  upsellTitre: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', marginBottom: 8, textAlign: 'center' },
  upsellDesc: { fontSize: 12, color: '#666666', textAlign: 'center', lineHeight: 18, marginBottom: 18 },
  upsellBtn: { backgroundColor: '#E8A020', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  upsellBtnTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  formTitre: { fontSize: 14, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F5F6F7', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnAnnuler: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  btnAnnulerTxt: { color: '#666666', fontSize: 12, fontWeight: '700' },
  btnEnvoyer: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#E8A020' },
  btnEnvoyerTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
