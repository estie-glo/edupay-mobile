import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Building, FileUp, MapPin } from 'lucide-react-native';

const TYPES_ETABLISSEMENT = ['Maternelle', 'Primaire', 'Collège', 'Lycée général', 'Lycée technique', 'Université', 'Institut'];

export default function EcoleKycScreen() {
  const router = useRouter();
  const [nomEtablissement, setNomEtablissement] = useState('');
  const [type, setType] = useState(TYPES_ETABLISSEMENT[0]);
  const [ville, setVille] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');

  const handleSoumettre = () => {
    if (!nomEtablissement || !ville || !adresse || !telephone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    // Pas de route API dédiée à la soumission du KYC établissement dans le guide actuel :
    // les données sont collectées ici mais la soumission au backend reste à brancher.
    Alert.alert(
      'Dossier enregistré localement',
      "La soumission au backend n'est pas encore disponible (aucune route API fournie pour le KYC établissement). Contactez l'équipe backend pour finaliser cette étape.",
      [{ text: 'Continuer vers le back-office', onPress: () => router.replace('/screens/ecole/BackOfficeScreen') }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.titre}>Informations de l'établissement</Text>
        <Text style={styles.sousTitre}>Ces informations seront vérifiées par notre équipe</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.lbl}>Nom de l'établissement *</Text>
        <View style={styles.inputRow}>
          <Building size={16} color="#888888" />
          <TextInput style={styles.inputInline} placeholder="ex : Lycée Bilingue de Melen" placeholderTextColor="#AAAAAA" value={nomEtablissement} onChangeText={setNomEtablissement} />
        </View>

        <Text style={styles.lbl}>Type d'établissement *</Text>
        <View style={styles.chipsRow}>
          {TYPES_ETABLISSEMENT.map((t) => (
            <TouchableOpacity key={t} style={[styles.chip, type === t && styles.chipActive]} onPress={() => setType(t)}>
              <Text style={[styles.chipTxt, type === t && styles.chipTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.lbl}>Ville *</Text>
        <View style={styles.inputRow}>
          <MapPin size={16} color="#888888" />
          <TextInput style={styles.inputInline} placeholder="ex : Yaoundé" placeholderTextColor="#AAAAAA" value={ville} onChangeText={setVille} />
        </View>

        <Text style={styles.lbl}>Adresse complète *</Text>
        <TextInput style={styles.input} placeholder="Quartier, rue, repère..." placeholderTextColor="#AAAAAA" value={adresse} onChangeText={setAdresse} />

        <Text style={styles.lbl}>Téléphone de l'établissement *</Text>
        <TextInput style={styles.input} placeholder="6XX XXX XXX" placeholderTextColor="#AAAAAA" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" />

        <Text style={styles.lbl}>Documents justificatifs</Text>
        <TouchableOpacity style={styles.uploadBox}>
          <FileUp size={20} color="#E8A020" />
          <Text style={styles.uploadTxt}>Autorisation d'ouverture / agrément (à venir)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSuivant} onPress={handleSoumettre}>
          <Text style={styles.btnSuivantTxt}>Soumettre le dossier →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  titre: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  sousTitre: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  content: { flex: 1, padding: 16 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, gap: 10 },
  inputInline: { flex: 1, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  chipActive: { backgroundColor: '#E8A020', borderColor: '#E8A020' },
  chipTxt: { fontSize: 10, fontWeight: '600', color: '#1A1A2E' },
  chipTxtActive: { color: '#FFFFFF' },
  uploadBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FEF3DC', borderWidth: 1.5, borderColor: '#E8A020', borderStyle: 'dashed', borderRadius: 10, padding: 14 },
  uploadTxt: { flex: 1, fontSize: 11, color: '#8B5E10', fontWeight: '600' },
  btnSuivant: { backgroundColor: '#E8A020', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 24, width: '100%' },
  btnSuivantTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
