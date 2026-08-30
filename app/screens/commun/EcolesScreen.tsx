import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MapPin, Search } from 'lucide-react-native';
import PageHeader from '../../../components/PageHeader';
import { ETABLISSEMENTS, TYPES_ETABLISSEMENT } from '../../../data/etablissements';

const COULEURS_AVATAR = ['#0B2545', '#0D9E75', '#1a472a', '#E8A020'];

export default function EcolesScreen() {
  const [recherche, setRecherche] = useState('');
  const [typeChoisi, setTypeChoisi] = useState<string | null>(null);

  const ecoles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return ETABLISSEMENTS.filter((e) => {
      const matchQ = !q || e.nom.toLowerCase().includes(q) || e.ville.toLowerCase().includes(q);
      const matchType = !typeChoisi || e.type === typeChoisi;
      return matchQ && matchType;
    });
  }, [recherche, typeChoisi]);

  return (
    <View style={styles.container}>
      <PageHeader
        tag="Annuaire"
        titre="Établissements partenaires"
        sousTitre="Tous les établissements qui utilisent EduPay pour la collecte de leurs frais."
      />
      <View style={styles.searchZone}>
        <View style={styles.searchBox}>
          <Search size={16} color="#888888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un établissement, une ville..."
            placeholderTextColor="#AAAAAA"
            value={recherche}
            onChangeText={setRecherche}
          />
        </View>
        <View style={styles.chipsRow}>
          <TouchableOpacity style={[styles.chip, !typeChoisi && styles.chipActive]} onPress={() => setTypeChoisi(null)}>
            <Text style={[styles.chipTxt, !typeChoisi && styles.chipTxtActive]}>Tous types</Text>
          </TouchableOpacity>
          {TYPES_ETABLISSEMENT.map((t) => (
            <TouchableOpacity key={t} style={[styles.chip, typeChoisi === t && styles.chipActive]} onPress={() => setTypeChoisi(t)}>
              <Text style={[styles.chipTxt, typeChoisi === t && styles.chipTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {ecoles.length === 0 ? (
          <Text style={styles.vide}>Aucun établissement trouvé.</Text>
        ) : (
          ecoles.map((ecole, i) => (
            <View key={ecole.nom} style={styles.card}>
              <View style={[styles.avatar, { backgroundColor: COULEURS_AVATAR[i % COULEURS_AVATAR.length] }]}>
                <Text style={styles.avatarTxt}>{ecole.nom.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nom}>{ecole.nom}</Text>
                <View style={styles.villeRow}>
                  <MapPin size={11} color="#888888" />
                  <Text style={styles.ville}>{ecole.ville}</Text>
                </View>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillTxt}>{ecole.type}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  searchZone: { backgroundColor: '#0B2545', paddingHorizontal: 16, paddingBottom: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 13, color: '#1A1A2E' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: '#0D9E75', borderColor: '#0D9E75' },
  chipTxt: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  chipTxtActive: { color: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  vide: { fontSize: 13, color: '#888888', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  avatar: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  nom: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', marginBottom: 3 },
  villeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ville: { fontSize: 11, color: '#888888' },
  pill: { backgroundColor: '#E0F5EE', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4, flexShrink: 0 },
  pillTxt: { fontSize: 9, fontWeight: '700', color: '#085041' },
});
