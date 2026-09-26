import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, FileCheck2, Save, Settings, Upload } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getParametresEcole, updateParametresEcole } from '../../../services/api';

// Champs et règles identiques à ParametreController::update (vérifiés le 26/09/2026).
const TYPES = [
  { valeur: 'maternelle', label: 'Maternelle' },
  { valeur: 'primaire', label: 'Primaire' },
  { valeur: 'college', label: 'Collège' },
  { valeur: 'lycee_general', label: 'Lycée général' },
  { valeur: 'lycee_technique', label: 'Lycée technique' },
  { valeur: 'universite', label: 'Université' },
  { valeur: 'institut_prive', label: 'Institut privé' },
  { valeur: 'groupe_scolaire', label: 'Groupe scolaire' },
];

const NB_ELEVES = [
  { valeur: 'moins_100', label: '< 100' },
  { valeur: '100_300', label: '100-300' },
  { valeur: '300_500', label: '300-500' },
  { valeur: '500_1000', label: '500-1000' },
  { valeur: 'plus_1000', label: '> 1000' },
];

type Fichier = { name: string; uri: string; mimeType?: string } | null;

function ChipSelector({ options, valeur, onChange }: { options: { valeur: string; label: string }[]; valeur: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.chipsRow}>
      {options.map((o) => (
        <TouchableOpacity key={o.valeur} style={[styles.chip, valeur === o.valeur && styles.chipActive]} onPress={() => onChange(o.valeur)}>
          <Text style={[styles.chipTxt, valeur === o.valeur && styles.chipTxtActive]}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function EcoleParametresScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);

  const [nom, setNom] = useState('');
  const [type, setType] = useState('');
  const [statutJuridique, setStatutJuridique] = useState('');
  const [numeroAgrement, setNumeroAgrement] = useState('');
  const [nbEleves, setNbEleves] = useState('');
  const [region, setRegion] = useState('');
  const [ville, setVille] = useState('');
  const [quartier, setQuartier] = useState('');
  const [boitePostale, setBoitePostale] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [siteWeb, setSiteWeb] = useState('');
  const [description, setDescription] = useState('');
  const [mobileMoneyPrincipal, setMobileMoneyPrincipal] = useState<'mtn' | 'orange' | 'les_deux' | ''>('');
  const [numeroMomoReversement, setNumeroMomoReversement] = useState('');
  const [operateurMomoReversement, setOperateurMomoReversement] = useState<'mtn' | 'orange' | ''>('');
  const [anneeScolaireActive, setAnneeScolaireActive] = useState('');
  const [anneesScolaires, setAnneesScolaires] = useState<string[]>([]);

  const [logoActuel, setLogoActuel] = useState<string | null>(null);
  const [documentActuel, setDocumentActuel] = useState<string | null>(null);
  const [nouveauLogo, setNouveauLogo] = useState<Fichier>(null);
  const [nouveauDocument, setNouveauDocument] = useState<Fichier>(null);

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/ecole/LoginEcoleScreen');
      return;
    }
    if (token) charger();
  }, [token, authLoading]);

  const choisirFichier = async (accept: string[], setter: (f: Fichier) => void) => {
    const resultat = await DocumentPicker.getDocumentAsync({ type: accept, copyToCacheDirectory: true });
    if (!resultat.canceled && resultat.assets?.[0]) {
      setter({ name: resultat.assets[0].name, uri: resultat.assets[0].uri, mimeType: resultat.assets[0].mimeType });
    }
  };

  const charger = async () => {
    setLoading(true);
    try {
      const reponse = await getParametresEcole();
      const d = reponse.data ?? reponse;
      const e = d.etablissement || {};
      setNom(e.nom || '');
      setType(e.type || '');
      setStatutJuridique(e.statut_juridique || '');
      setNumeroAgrement(e.numero_agrement || '');
      setNbEleves(e.nb_eleves || '');
      setRegion(e.region || '');
      setVille(e.ville || '');
      setQuartier(e.quartier || '');
      setBoitePostale(e.boite_postale || '');
      setTelephone(e.telephone || '');
      setEmail(e.email || '');
      setSiteWeb(e.site_web || '');
      setDescription(e.description || '');
      setMobileMoneyPrincipal(e.mobile_money_principal || '');
      setNumeroMomoReversement(e.numero_momo_reversement || '');
      setLogoActuel(e.logo || null);
      setDocumentActuel(e.document_agrement || null);
      setAnneeScolaireActive(d.annee_scolaire_active || '');
      setAnneesScolaires(d.annees_scolaires || []);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger les paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleEnregistrer = async () => {
    if (!nom || !type || !ville || !/^[236]\d{8}$/.test(telephone) || !email || !mobileMoneyPrincipal) {
      Alert.alert('Erreur', 'Nom, type, ville, téléphone (6/2/3XXXXXXXX), email et Mobile Money principal sont obligatoires');
      return;
    }
    setEnregistrement(true);
    try {
      await updateParametresEcole({
        nom, type, statut_juridique: statutJuridique || undefined, numero_agrement: numeroAgrement || undefined,
        nb_eleves: nbEleves || undefined, region: region || undefined, ville, quartier: quartier || undefined,
        boite_postale: boitePostale || undefined, telephone, email, site_web: siteWeb || undefined,
        description: description || undefined, mobile_money_principal: mobileMoneyPrincipal,
        numero_momo_reversement: numeroMomoReversement || undefined,
        operateur_momo_reversement: operateurMomoReversement || undefined,
        annee_scolaire_active: anneeScolaireActive || undefined,
        logo: nouveauLogo || undefined,
        document_agrement: nouveauDocument || undefined,
      });
      Alert.alert('Paramètres mis à jour', 'Les informations de votre établissement ont été enregistrées.');
      setNouveauLogo(null);
      setNouveauDocument(null);
      charger();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Mise à jour impossible');
    } finally {
      setEnregistrement(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#E8A020" style={{ flex: 1 }} />;
  }

  const typesDisponibles = TYPES.some((t) => t.valeur === type) || !type ? TYPES : [...TYPES, { valeur: type, label: type }];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.titreRow}>
          <Settings size={18} color="#FFFFFF" />
          <Text style={styles.titre}>Paramètres de l'établissement</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.secLabel}>INFORMATIONS GÉNÉRALES</Text>
        <Text style={styles.lbl}>Nom de l'établissement *</Text>
        <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Type *</Text>
        <ChipSelector options={typesDisponibles} valeur={type} onChange={setType} />
        <Text style={styles.lbl}>Statut juridique</Text>
        <TextInput style={styles.input} value={statutJuridique} onChangeText={setStatutJuridique} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Numéro d'agrément</Text>
        <TextInput style={styles.input} value={numeroAgrement} onChangeText={setNumeroAgrement} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Nombre d'élèves</Text>
        <ChipSelector options={NB_ELEVES} valeur={nbEleves} onChange={setNbEleves} />

        <Text style={[styles.secLabel, { marginTop: 20 }]}>ADRESSE</Text>
        <Text style={styles.lbl}>Région</Text>
        <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Ville *</Text>
        <TextInput style={styles.input} value={ville} onChangeText={setVille} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Quartier</Text>
        <TextInput style={styles.input} value={quartier} onChangeText={setQuartier} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Boîte postale</Text>
        <TextInput style={styles.input} value={boitePostale} onChangeText={setBoitePostale} placeholderTextColor="#AAAAAA" />

        <Text style={[styles.secLabel, { marginTop: 20 }]}>CONTACT</Text>
        <Text style={styles.lbl}>Téléphone *</Text>
        <TextInput style={styles.input} value={telephone} onChangeText={(t) => setTelephone(t.replace(/\D/g, '').slice(0, 9))} keyboardType="phone-pad" maxLength={9} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Email *</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Site web</Text>
        <TextInput style={styles.input} value={siteWeb} onChangeText={setSiteWeb} autoCapitalize="none" placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Description</Text>
        <TextInput style={styles.textarea} value={description} onChangeText={setDescription} multiline numberOfLines={4} placeholderTextColor="#AAAAAA" />

        <Text style={[styles.secLabel, { marginTop: 20 }]}>ENCAISSEMENT MOBILE MONEY</Text>
        <Text style={styles.lbl}>Opérateur principal *</Text>
        <ChipSelector
          options={[{ valeur: 'mtn', label: 'MTN Mobile Money' }, { valeur: 'orange', label: 'Orange Money' }, { valeur: 'les_deux', label: 'Les deux' }]}
          valeur={mobileMoneyPrincipal}
          onChange={(v) => setMobileMoneyPrincipal(v as 'mtn' | 'orange' | 'les_deux')}
        />
        <Text style={styles.lbl}>Numéro de reversement</Text>
        <TextInput style={styles.input} value={numeroMomoReversement} onChangeText={(t) => setNumeroMomoReversement(t.replace(/\D/g, '').slice(0, 9))} keyboardType="phone-pad" maxLength={9} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Opérateur de reversement</Text>
        <ChipSelector
          options={[{ valeur: 'mtn', label: 'MTN' }, { valeur: 'orange', label: 'Orange' }]}
          valeur={operateurMomoReversement}
          onChange={(v) => setOperateurMomoReversement(v as 'mtn' | 'orange')}
        />

        {anneesScolaires.length > 0 && (
          <>
            <Text style={[styles.secLabel, { marginTop: 20 }]}>ANNÉE SCOLAIRE ACTIVE</Text>
            <ChipSelector
              options={anneesScolaires.map((a) => ({ valeur: a, label: a }))}
              valeur={anneeScolaireActive}
              onChange={setAnneeScolaireActive}
            />
          </>
        )}

        <Text style={[styles.secLabel, { marginTop: 20 }]}>LOGO ET AGRÉMENT</Text>
        <Text style={styles.lbl}>Logo</Text>
        {!!logoActuel && !nouveauLogo && <Image source={{ uri: logoActuel }} style={styles.logoPreview} />}
        <TouchableOpacity style={styles.uploadBox} onPress={() => choisirFichier(['image/png', 'image/jpeg', 'image/svg+xml'], setNouveauLogo)}>
          {nouveauLogo ? <FileCheck2 size={18} color="#0D9E75" /> : <Upload size={18} color="#E8A020" />}
          <Text style={styles.uploadTxt} numberOfLines={1}>{nouveauLogo ? nouveauLogo.name : 'Remplacer le logo'}</Text>
        </TouchableOpacity>

        <Text style={styles.lbl}>Document d'agrément</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={() => choisirFichier(['application/pdf', 'image/jpeg', 'image/png'], setNouveauDocument)}>
          {nouveauDocument ? <FileCheck2 size={18} color="#0D9E75" /> : <Upload size={18} color="#E8A020" />}
          <Text style={styles.uploadTxt} numberOfLines={1}>
            {nouveauDocument ? nouveauDocument.name : documentActuel ? "Remplacer le document d'agrément" : 'Ajouter le document d\'agrément'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btnEnregistrer, enregistrement && { opacity: 0.7 }]} onPress={handleEnregistrer} disabled={enregistrement}>
          {enregistrement ? <ActivityIndicator color="#FFFFFF" /> : <><Save size={16} color="#FFFFFF" /><Text style={styles.btnEnregistrerTxt}>Enregistrer</Text></>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  titre: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', flexShrink: 1 },
  content: { flex: 1, padding: 16 },
  secLabel: { fontSize: 10, fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  textarea: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 13, color: '#1A1A2E', textAlignVertical: 'top', minHeight: 90 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  chipActive: { backgroundColor: '#E8A020', borderColor: '#E8A020' },
  chipTxt: { fontSize: 11, fontWeight: '600', color: '#1A1A2E' },
  chipTxtActive: { color: '#FFFFFF' },
  logoPreview: { width: 56, height: 56, borderRadius: 10, marginBottom: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  uploadBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FEF3DC', borderWidth: 1.5, borderColor: '#E8A020', borderStyle: 'dashed', borderRadius: 10, padding: 14, marginBottom: 4 },
  uploadTxt: { flex: 1, fontSize: 11, color: '#8B5E10', fontWeight: '600' },
  btnEnregistrer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#E8A020', paddingVertical: 14, borderRadius: 12, marginTop: 24 },
  btnEnregistrerTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
