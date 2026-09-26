import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Building2, Globe, Layers3, Mail, MapPin, Phone, Users } from 'lucide-react-native';
import { getEtablissementPublic } from '../../../services/api';

// Forme exacte de EtablissementPublicController::show (vérifiée le 26/09/2026).
type CategorieFrais = { id: number; nom: string; montant: number; annee_scolaire?: string };
type Etablissement = {
  code_etablissement: string;
  nom: string;
  type?: string;
  statut_juridique?: string;
  region?: string;
  ville?: string;
  quartier?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  description?: string;
  logo?: string;
  nb_apprenants?: number;
  categories_frais?: CategorieFrais[];
};

export default function EtablissementPublicScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [etablissement, setEtablissement] = useState<Etablissement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (code) charger();
  }, [code]);

  const charger = async () => {
    setLoading(true);
    try {
      const reponse = await getEtablissementPublic(String(code));
      setEtablissement(reponse.data ?? reponse);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Établissement introuvable');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !etablissement) {
    return <ActivityIndicator size="large" color="#0D9E75" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          {etablissement.logo ? (
            <Image source={{ uri: etablissement.logo }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Building2 size={22} color="#0B2545" />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.nom}>{etablissement.nom}</Text>
            <Text style={styles.sousTitre}>{etablissement.type}{etablissement.ville ? ` · ${etablissement.ville}` : ''}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {!!etablissement.description && (
          <View style={styles.card}>
            <Text style={styles.descTxt}>{etablissement.description}</Text>
          </View>
        )}

        <Text style={styles.secLabel}>INFORMATIONS</Text>
        <View style={styles.card}>
          {!!(etablissement.ville || etablissement.quartier || etablissement.region) && (
            <View style={styles.infoRow}>
              <MapPin size={14} color="#0D9E75" />
              <Text style={styles.infoTxt}>{[etablissement.quartier, etablissement.ville, etablissement.region].filter(Boolean).join(', ')}</Text>
            </View>
          )}
          {!!etablissement.telephone && (
            <View style={styles.infoRow}>
              <Phone size={14} color="#0D9E75" />
              <Text style={styles.infoTxt}>{etablissement.telephone}</Text>
            </View>
          )}
          {!!etablissement.email && (
            <View style={styles.infoRow}>
              <Mail size={14} color="#0D9E75" />
              <Text style={styles.infoTxt}>{etablissement.email}</Text>
            </View>
          )}
          {!!etablissement.site_web && (
            <View style={styles.infoRow}>
              <Globe size={14} color="#0D9E75" />
              <Text style={styles.infoTxt}>{etablissement.site_web}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Users size={14} color="#0D9E75" />
            <Text style={styles.infoTxt}>{etablissement.nb_apprenants ?? 0} apprenant(s) inscrit(s)</Text>
          </View>
        </View>

        {!!etablissement.categories_frais?.length && (
          <>
            <Text style={[styles.secLabel, { marginTop: 20 }]}>CATÉGORIES DE FRAIS</Text>
            <View style={styles.card}>
              {etablissement.categories_frais.map((c) => (
                <View key={c.id} style={styles.fraisRow}>
                  <Layers3 size={13} color="#888888" />
                  <Text style={styles.fraisTxt}>{c.nom}</Text>
                  <Text style={styles.fraisMontant}>{c.montant.toLocaleString('fr-FR')} FCFA</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logo: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFFFFF' },
  logoPlaceholder: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  nom: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  sousTitre: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10, gap: 10 },
  descTxt: { fontSize: 13, color: '#555555', lineHeight: 19 },
  secLabel: { fontSize: 10, fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoTxt: { fontSize: 12, color: '#333333', flex: 1 },
  fraisRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  fraisTxt: { fontSize: 12, color: '#333333', flex: 1 },
  fraisMontant: { fontSize: 12, fontWeight: '700', color: '#1A1A2E' },
});
