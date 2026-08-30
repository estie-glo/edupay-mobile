import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, CheckSquare, FileCheck2, School, Square, Upload } from 'lucide-react-native';

// Wizard identique au flux réel du site (RegisterEcolController sur main) :
// 4 étapes en session côté serveur, une seule route de soumission finale.
// Le mobile n'a pas d'équivalent API pour l'instant (aucune route
// /etablissement/* annoncée, et /auth/register n'accepte que
// parent|eleve|etudiant) — les données sont donc capturées mais la
// soumission finale reste un TODO explicite tant que l'API n'existe pas.

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

const STATUTS_JURIDIQUES = [
  { valeur: 'public', label: 'Public' },
  { valeur: 'prive_laic', label: 'Privé laïc' },
  { valeur: 'prive_catholique', label: 'Privé catholique' },
  { valeur: 'prive_protestant', label: 'Privé protestant' },
  { valeur: 'prive_islamique', label: 'Privé islamique' },
];

const NB_ELEVES = [
  { valeur: 'moins_100', label: '< 100' },
  { valeur: '100_300', label: '100-300' },
  { valeur: '300_500', label: '300-500' },
  { valeur: '500_1000', label: '500-1000' },
  { valeur: 'plus_1000', label: '> 1000' },
];

const REGIONS = [
  { valeur: 'centre', label: 'Centre' },
  { valeur: 'littoral', label: 'Littoral' },
  { valeur: 'ouest', label: 'Ouest' },
  { valeur: 'nord', label: 'Nord' },
  { valeur: 'adamaoua', label: 'Adamaoua' },
  { valeur: 'est', label: 'Est' },
  { valeur: 'sud', label: 'Sud' },
  { valeur: 'sud_ouest', label: 'Sud-Ouest' },
  { valeur: 'nord_ouest', label: 'Nord-Ouest' },
  { valeur: 'extreme_nord', label: 'Extrême-Nord' },
];

const ETAPES = ['Établissement', 'Contact & responsable', 'Documents', 'Validation'] as const;

type Fichier = { name: string; uri: string } | null;

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

export default function RegisterEcoleScreen() {
  const router = useRouter();
  const [etapeIndex, setEtapeIndex] = useState(0);
  const [envoi, setEnvoi] = useState(false);

  // Étape 1 — Établissement
  const [nom, setNom] = useState('');
  const [type, setType] = useState('');
  const [statutJuridique, setStatutJuridique] = useState('');
  const [numeroAgrement, setNumeroAgrement] = useState('');
  const [nbEleves, setNbEleves] = useState('');
  const [region, setRegion] = useState('');
  const [ville, setVille] = useState('');
  const [quartier, setQuartier] = useState('');
  const [boitePostale, setBoitePostale] = useState('');

  // Étape 2 — Contact & responsable
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [siteWeb, setSiteWeb] = useState('');
  const [mobileMoneyPrincipal, setMobileMoneyPrincipal] = useState<'mtn' | 'orange' | ''>('');
  const [numeroMomoReversement, setNumeroMomoReversement] = useState('');
  const [respPrenom, setRespPrenom] = useState('');
  const [respNom, setRespNom] = useState('');
  const [respTelephone, setRespTelephone] = useState('');
  const [respEmail, setRespEmail] = useState('');
  const [respPassword, setRespPassword] = useState('');
  const [respPasswordConfirmation, setRespPasswordConfirmation] = useState('');

  // Étape 3 — Documents
  const [documentAgrement, setDocumentAgrement] = useState<Fichier>(null);
  const [logo, setLogo] = useState<Fichier>(null);
  const [description, setDescription] = useState('');

  // Étape 4 — Validation
  const [cguAccepted, setCguAccepted] = useState(false);
  const [certificationAccepted, setCertificationAccepted] = useState(false);

  const choisirFichier = async (accept: string[], setter: (f: Fichier) => void) => {
    const resultat = await DocumentPicker.getDocumentAsync({ type: accept, copyToCacheDirectory: true });
    if (!resultat.canceled && resultat.assets?.[0]) {
      setter({ name: resultat.assets[0].name, uri: resultat.assets[0].uri });
    }
  };

  const validerEtape1 = () => {
    if (!nom || !type || !statutJuridique || !numeroAgrement || !region || !ville) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return false;
    }
    return true;
  };

  const validerEtape2 = () => {
    if (!/^[236]\d{8}$/.test(telephone)) {
      Alert.alert('Erreur', "Téléphone établissement invalide : 6XXXXXXXX (mobile) ou 2XXXXXXXX/3XXXXXXXX (fixe)");
      return false;
    }
    if (!email || !mobileMoneyPrincipal || !/^6\d{8}$/.test(numeroMomoReversement)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires (numéro Mobile Money : 6XXXXXXXX)');
      return false;
    }
    if (!respPrenom || !respNom || !/^6\d{8}$/.test(respTelephone) || !respEmail) {
      Alert.alert('Erreur', 'Veuillez remplir les informations du responsable (téléphone : 6XXXXXXXX)');
      return false;
    }
    if (respPassword.length < 8 || respPassword !== respPasswordConfirmation) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères et être confirmé à l\'identique');
      return false;
    }
    return true;
  };

  const validerEtape3 = () => {
    if (!documentAgrement) {
      Alert.alert('Erreur', "Le document d'agrément est obligatoire (PDF, JPG ou PNG)");
      return false;
    }
    return true;
  };

  const suivant = () => {
    if (etapeIndex === 0 && !validerEtape1()) return;
    if (etapeIndex === 1 && !validerEtape2()) return;
    if (etapeIndex === 2 && !validerEtape3()) return;
    setEtapeIndex(etapeIndex + 1);
  };

  const soumettre = async () => {
    if (!cguAccepted || !certificationAccepted) {
      Alert.alert('Erreur', "Vous devez accepter les CGU et certifier l'exactitude des informations");
      return;
    }
    setEnvoi(true);
    // Aucune route API pour l'inscription établissement n'est encore annoncée
    // (register n'accepte que parent|eleve|etudiant, /etablissement/* renvoie 404).
    setTimeout(() => {
      setEnvoi(false);
      Alert.alert(
        'Dossier prêt, envoi indisponible',
        "Toutes les informations sont saisies, mais l'API ne propose pas encore de route d'inscription établissement. Contactez l'équipe backend pour finaliser cette étape.",
        [{ text: 'Retour à la connexion', onPress: () => router.replace('/screens/ecole/LoginEcoleScreen') }]
      );
    }, 600);
  };

  const renderEtape1 = () => (
    <View>
      <Text style={styles.lbl}>Nom de l'établissement *</Text>
      <TextInput style={styles.input} placeholder="ex : Lycée Bilingue de Melen" placeholderTextColor="#AAAAAA" value={nom} onChangeText={setNom} />
      <Text style={styles.lbl}>Type d'établissement *</Text>
      <ChipSelector options={TYPES} valeur={type} onChange={setType} />
      <Text style={styles.lbl}>Statut juridique *</Text>
      <ChipSelector options={STATUTS_JURIDIQUES} valeur={statutJuridique} onChange={setStatutJuridique} />
      <Text style={styles.lbl}>Numéro d'agrément *</Text>
      <TextInput style={styles.input} placeholder="Numéro délivré par le MINEDUB/MINESEC" placeholderTextColor="#AAAAAA" value={numeroAgrement} onChangeText={setNumeroAgrement} />
      <Text style={styles.lbl}>Nombre d'élèves (optionnel)</Text>
      <ChipSelector options={NB_ELEVES} valeur={nbEleves} onChange={setNbEleves} />
      <Text style={styles.lbl}>Région *</Text>
      <ChipSelector options={REGIONS} valeur={region} onChange={setRegion} />
      <Text style={styles.lbl}>Ville *</Text>
      <TextInput style={styles.input} placeholder="ex : Yaoundé" placeholderTextColor="#AAAAAA" value={ville} onChangeText={setVille} />
      <Text style={styles.lbl}>Quartier (optionnel)</Text>
      <TextInput style={styles.input} placeholder="ex : Melen" placeholderTextColor="#AAAAAA" value={quartier} onChangeText={setQuartier} />
      <Text style={styles.lbl}>Boîte postale (optionnel)</Text>
      <TextInput style={styles.input} placeholder="ex : BP 1234 Yaoundé" placeholderTextColor="#AAAAAA" value={boitePostale} onChangeText={setBoitePostale} />
    </View>
  );

  const renderEtape2 = () => (
    <View>
      <Text style={styles.secLabel}>ÉTABLISSEMENT</Text>
      <Text style={styles.lbl}>Téléphone *</Text>
      <TextInput style={styles.input} placeholder="6XXXXXXXX ou 2XXXXXXXX" placeholderTextColor="#AAAAAA" value={telephone} onChangeText={(t) => setTelephone(t.replace(/\D/g, '').slice(0, 9))} keyboardType="phone-pad" maxLength={9} />
      <Text style={styles.lbl}>Email *</Text>
      <TextInput style={styles.input} placeholder="contact@ecole.cm" placeholderTextColor="#AAAAAA" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Text style={styles.lbl}>Site web (optionnel)</Text>
      <TextInput style={styles.input} placeholder="https://..." placeholderTextColor="#AAAAAA" value={siteWeb} onChangeText={setSiteWeb} autoCapitalize="none" />
      <Text style={styles.lbl}>Mobile Money principal *</Text>
      <ChipSelector options={[{ valeur: 'mtn', label: 'MTN Mobile Money' }, { valeur: 'orange', label: 'Orange Money' }]} valeur={mobileMoneyPrincipal} onChange={(v) => setMobileMoneyPrincipal(v as 'mtn' | 'orange')} />
      <Text style={styles.lbl}>Numéro Mobile Money de reversement *</Text>
      <TextInput style={styles.input} placeholder="6XXXXXXXX" placeholderTextColor="#AAAAAA" value={numeroMomoReversement} onChangeText={(t) => setNumeroMomoReversement(t.replace(/\D/g, '').slice(0, 9))} keyboardType="phone-pad" maxLength={9} />

      <Text style={[styles.secLabel, { marginTop: 20 }]}>RESPONSABLE (DIRECTEUR)</Text>
      <Text style={styles.lbl}>Prénom *</Text>
      <TextInput style={styles.input} placeholder="ex : Steve" placeholderTextColor="#AAAAAA" value={respPrenom} onChangeText={setRespPrenom} />
      <Text style={styles.lbl}>Nom *</Text>
      <TextInput style={styles.input} placeholder="ex : MEKONTSO" placeholderTextColor="#AAAAAA" value={respNom} onChangeText={setRespNom} />
      <Text style={styles.lbl}>Téléphone *</Text>
      <TextInput style={styles.input} placeholder="6XXXXXXXX" placeholderTextColor="#AAAAAA" value={respTelephone} onChangeText={(t) => setRespTelephone(t.replace(/\D/g, '').slice(0, 9))} keyboardType="phone-pad" maxLength={9} />
      <Text style={styles.lbl}>Email *</Text>
      <TextInput style={styles.input} placeholder="directeur@ecole.cm" placeholderTextColor="#AAAAAA" value={respEmail} onChangeText={setRespEmail} keyboardType="email-address" autoCapitalize="none" />
      <Text style={styles.lbl}>Mot de passe *</Text>
      <TextInput style={styles.input} placeholder="Min. 8 caractères" placeholderTextColor="#AAAAAA" value={respPassword} onChangeText={setRespPassword} secureTextEntry />
      <Text style={styles.lbl}>Confirmer mot de passe *</Text>
      <TextInput style={styles.input} placeholder="Répétez" placeholderTextColor="#AAAAAA" value={respPasswordConfirmation} onChangeText={setRespPasswordConfirmation} secureTextEntry />
    </View>
  );

  const renderEtape3 = () => (
    <View>
      <Text style={styles.lbl}>Document d'agrément * (PDF, JPG ou PNG, 5 Mo max)</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={() => choisirFichier(['application/pdf', 'image/jpeg', 'image/png'], setDocumentAgrement)}>
        {documentAgrement ? <FileCheck2 size={20} color="#0D9E75" /> : <Upload size={20} color="#E8A020" />}
        <Text style={styles.uploadTxt} numberOfLines={1}>{documentAgrement ? documentAgrement.name : "Choisir le document d'agrément"}</Text>
      </TouchableOpacity>

      <Text style={styles.lbl}>Logo de l'établissement (optionnel, PNG/JPG/SVG, 2 Mo max)</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={() => choisirFichier(['image/png', 'image/jpeg', 'image/svg+xml'], setLogo)}>
        {logo ? <FileCheck2 size={20} color="#0D9E75" /> : <Upload size={20} color="#E8A020" />}
        <Text style={styles.uploadTxt} numberOfLines={1}>{logo ? logo.name : 'Choisir un logo'}</Text>
      </TouchableOpacity>

      <Text style={styles.lbl}>Description (optionnel)</Text>
      <TextInput
        style={styles.textarea}
        placeholder="Présentez brièvement votre établissement..."
        placeholderTextColor="#AAAAAA"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        maxLength={1000}
      />
    </View>
  );

  const renderEtape4 = () => (
    <View>
      <View style={styles.recapCard}>
        <Text style={styles.recapTitre}>{nom}</Text>
        <Text style={styles.recapLigne}>{TYPES.find((t) => t.valeur === type)?.label} · {ville}</Text>
        <Text style={styles.recapLigne}>{email} · {telephone}</Text>
        <Text style={styles.recapLigne}>Responsable : {respPrenom} {respNom} ({respEmail})</Text>
        <Text style={styles.recapLigne}>Document d'agrément : {documentAgrement?.name || '—'}</Text>
      </View>

      <TouchableOpacity style={styles.cguRow} onPress={() => setCguAccepted(!cguAccepted)}>
        {cguAccepted ? <CheckSquare size={18} color="#E8A020" /> : <Square size={18} color="#AAAAAA" />}
        <Text style={styles.cguTxt}>J'accepte les conditions d'utilisation d'EduPay</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cguRow} onPress={() => setCertificationAccepted(!certificationAccepted)}>
        {certificationAccepted ? <CheckSquare size={18} color="#E8A020" /> : <Square size={18} color="#AAAAAA" />}
        <Text style={styles.cguTxt}>Je certifie l'exactitude des informations fournies</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btnSuivant, envoi && { opacity: 0.7 }]} onPress={soumettre} disabled={envoi}>
        {envoi ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnSuivantTxt}>Envoyer le dossier →</Text>}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (etapeIndex > 0 ? setEtapeIndex(etapeIndex - 1) : router.back())}
        >
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.titreRow}>
          <School size={18} color="#FFFFFF" />
          <Text style={styles.titre}>Inscrire mon établissement</Text>
        </View>
        <Text style={styles.etapeTxt}>Étape {etapeIndex + 1}/4 — {ETAPES[etapeIndex]}</Text>
      </View>
      <View style={styles.stepsRow}>
        {ETAPES.map((_, i) => (
          <View key={i} style={[styles.step, i <= etapeIndex && styles.stepActive]} />
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {etapeIndex === 0 && renderEtape1()}
        {etapeIndex === 1 && renderEtape2()}
        {etapeIndex === 2 && renderEtape3()}
        {etapeIndex === 3 && renderEtape4()}

        {etapeIndex < 3 && (
          <TouchableOpacity style={styles.btnSuivant} onPress={suivant}>
            <Text style={styles.btnSuivantTxt}>Continuer →</Text>
          </TouchableOpacity>
        )}
        {etapeIndex === 0 && (
          <TouchableOpacity style={{ marginTop: 16 }} onPress={() => router.push('/screens/ecole/LoginEcoleScreen')}>
            <Text style={styles.deja}>Déjà inscrit ? <Text style={styles.dejaLnk}>Se connecter</Text></Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  titreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  titre: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  etapeTxt: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  stepsRow: { flexDirection: 'row', gap: 6, padding: 16, backgroundColor: '#0B2545' },
  step: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  stepActive: { backgroundColor: '#E8A020' },
  content: { flex: 1, padding: 16 },
  secLabel: { fontSize: 10, fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  textarea: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 13, color: '#1A1A2E', textAlignVertical: 'top', minHeight: 90 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  chipActive: { backgroundColor: '#E8A020', borderColor: '#E8A020' },
  chipTxt: { fontSize: 11, fontWeight: '600', color: '#1A1A2E' },
  chipTxtActive: { color: '#FFFFFF' },
  uploadBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FEF3DC', borderWidth: 1.5, borderColor: '#E8A020', borderStyle: 'dashed', borderRadius: 10, padding: 14, marginBottom: 4 },
  uploadTxt: { flex: 1, fontSize: 11, color: '#8B5E10', fontWeight: '600' },
  recapCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  recapTitre: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', marginBottom: 8 },
  recapLigne: { fontSize: 12, color: '#666666', marginBottom: 4 },
  cguRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  cguTxt: { flex: 1, fontSize: 12, color: '#555555', lineHeight: 16 },
  btnSuivant: { backgroundColor: '#E8A020', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 24, width: '100%' },
  btnSuivantTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  deja: { textAlign: 'center', fontSize: 13, color: '#888888' },
  dejaLnk: { color: '#E8A020', fontWeight: '700' },
});
