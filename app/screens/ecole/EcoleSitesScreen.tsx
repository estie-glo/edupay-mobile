import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Building2, Lock, MapPinned, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { creerSite, getSites, supprimerSite, updateSite } from '../../../services/api';
import Card from '../../../components/ui/Card';
import PrimaryButton from '../../../components/ui/PrimaryButton';

// Champs alignés sur SiteController::formaterSite (vérifiés le 27/09/2026).
type Site = { id: number; nom: string; ville: string; quartier?: string; telephone?: string; email?: string };

export default function EcoleSitesScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [nonEligible, setNonEligible] = useState(false);
  const [formOuvert, setFormOuvert] = useState(false);
  const [siteEnEdition, setSiteEnEdition] = useState<number | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const [nom, setNom] = useState('');
  const [ville, setVille] = useState('');
  const [quartier, setQuartier] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [directeurPrenom, setDirecteurPrenom] = useState('');
  const [directeurNom, setDirecteurNom] = useState('');
  const [directeurEmail, setDirecteurEmail] = useState('');

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
    setSiteEnEdition(null);
    setNom('');
    setVille('');
    setQuartier('');
    setTelephone('');
    setEmail('');
    setDirecteurPrenom('');
    setDirecteurNom('');
    setDirecteurEmail('');
  };

  const ouvrirEdition = (s: Site) => {
    setSiteEnEdition(s.id);
    setNom(s.nom);
    setVille(s.ville);
    setQuartier(s.quartier || '');
    setTelephone(s.telephone || '');
    setEmail(s.email || '');
    setFormOuvert(true);
  };

  const handleCreer = async () => {
    if (!nom || !ville || !telephone || !email) {
      Alert.alert('Erreur', 'Veuillez renseigner le nom, la ville, le téléphone et l\'email du site');
      return;
    }
    if (!siteEnEdition && (!directeurPrenom || !directeurNom || !directeurEmail)) {
      Alert.alert('Erreur', 'Un nouveau site crée un compte directeur : prénom, nom et email sont obligatoires');
      return;
    }
    setEnvoi(true);
    try {
      if (siteEnEdition) {
        await updateSite(siteEnEdition, { nom, ville, quartier: quartier || undefined, telephone, email });
      } else {
        await creerSite({
          nom, ville, quartier: quartier || undefined, telephone, email,
          directeur_prenom: directeurPrenom, directeur_nom: directeurNom, directeur_email: directeurEmail,
        });
      }
      resetFormulaire();
      charger();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible d\'enregistrer ce site');
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
          <Card style={styles.upsellCard}>
            <View style={styles.upsellIco}>
              <Lock size={22} color="#E8A020" />
            </View>
            <Text style={styles.upsellTitre}>Fonctionnalité Standard / Premium</Text>
            <Text style={styles.upsellDesc}>La gestion multi-sites permet de piloter plusieurs campus depuis un seul compte. Passez à la formule Standard ou Premium pour l'activer.</Text>
            <PrimaryButton title="Voir les formules →" onPress={() => router.push('/screens/ecole/EcoleAbonnementScreen')} style={{ marginTop: 8, alignSelf: 'stretch' }} />
          </Card>
        ) : (
          <>
            {formOuvert && (
              <Card style={styles.formCard}>
                <Text style={styles.formTitre}>{siteEnEdition ? 'Modifier le site' : 'Nouveau site'}</Text>
                <Text style={styles.lbl}>Nom du site *</Text>
                <TextInput style={styles.input} placeholder="ex : Campus Bastos" placeholderTextColor="#AAAAAA" value={nom} onChangeText={setNom} />
                <Text style={styles.lbl}>Ville *</Text>
                <TextInput style={styles.input} placeholder="ex : Yaoundé" placeholderTextColor="#AAAAAA" value={ville} onChangeText={setVille} />
                <Text style={styles.lbl}>Quartier (optionnel)</Text>
                <TextInput style={styles.input} placeholder="ex : Bastos" placeholderTextColor="#AAAAAA" value={quartier} onChangeText={setQuartier} />
                <Text style={styles.lbl}>Téléphone *</Text>
                <TextInput style={styles.input} placeholder="6XXXXXXXX" placeholderTextColor="#AAAAAA" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" />
                <Text style={styles.lbl}>Email du site *</Text>
                <TextInput style={styles.input} placeholder="site@ecole.cm" placeholderTextColor="#AAAAAA" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

                {!siteEnEdition && (
                  <>
                    <Text style={[styles.lbl, { marginTop: 16 }]}>DIRECTEUR DU SITE (nouveau compte créé)</Text>
                    <Text style={styles.lbl}>Prénom *</Text>
                    <TextInput style={styles.input} placeholder="ex : Paul" placeholderTextColor="#AAAAAA" value={directeurPrenom} onChangeText={setDirecteurPrenom} />
                    <Text style={styles.lbl}>Nom *</Text>
                    <TextInput style={styles.input} placeholder="ex : ATEBA" placeholderTextColor="#AAAAAA" value={directeurNom} onChangeText={setDirecteurNom} />
                    <Text style={styles.lbl}>Email du directeur *</Text>
                    <TextInput style={styles.input} placeholder="directeur@ecole.cm" placeholderTextColor="#AAAAAA" value={directeurEmail} onChangeText={setDirecteurEmail} keyboardType="email-address" autoCapitalize="none" />
                  </>
                )}

                <View style={styles.formBtns}>
                  <TouchableOpacity style={styles.btnAnnuler} onPress={resetFormulaire}>
                    <Text style={styles.btnAnnulerTxt}>Annuler</Text>
                  </TouchableOpacity>
                  <PrimaryButton title={siteEnEdition ? 'Enregistrer' : 'Créer'} onPress={handleCreer} loading={envoi} style={{ flex: 1 }} />
                </View>
              </Card>
            )}

            {sites.length === 0 ? (
              <Text style={styles.vide}>Aucun site secondaire pour le moment.</Text>
            ) : (
              sites.map((s) => (
                <Card key={s.id} style={styles.card}>
                  <View style={styles.cardIco}>
                    <Building2 size={18} color="#E8A020" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nom}>{s.nom}</Text>
                    <View style={styles.villeRow}>
                      <MapPinned size={11} color="#888888" />
                      <Text style={styles.ville}>{s.ville}{s.quartier ? ` · ${s.quartier}` : ''}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => ouvrirEdition(s)} style={{ marginRight: 4 }}>
                    <Pencil size={15} color="#666666" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleSupprimer(s)}>
                    <Trash2 size={16} color="#D94040" />
                  </TouchableOpacity>
                </Card>
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
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 10 },
  cardIco: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF3DC', alignItems: 'center', justifyContent: 'center' },
  nom: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  villeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  ville: { fontSize: 11, color: '#888888' },
  upsellCard: { padding: 24, alignItems: 'center', marginTop: 20 },
  upsellIco: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FEF3DC', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  upsellTitre: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', marginBottom: 8, textAlign: 'center' },
  upsellDesc: { fontSize: 12, color: '#666666', textAlign: 'center', lineHeight: 18, marginBottom: 18 },
  formCard: { padding: 16, marginBottom: 16 },
  formTitre: { fontSize: 14, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F5F6F7', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnAnnuler: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  btnAnnulerTxt: { color: '#666666', fontSize: 12, fontWeight: '700' },
});
