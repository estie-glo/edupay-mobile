import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Layers3, Phone, Save, Trash2, UserRound, Users } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { desaffecterFraisApprenant, getApprenantEcole, updateApprenantEcole } from '../../../services/api';
import Card from '../../../components/ui/Card';
import PrimaryButton from '../../../components/ui/PrimaryButton';

type Echeancier = { id: number; libelle?: string; montant?: number; date_echeance?: string };
type Frais = {
  id: number;
  categorie?: { nom?: string };
  montant_total: number;
  montant_paye: number;
  reste: number;
  statut?: string;
  echeanciers?: Echeancier[];
};
type Parent = { id: number; nom_complet?: string; telephone?: string; email?: string; lien?: string };
type Apprenant = {
  id: number;
  nom: string;
  prenom: string;
  classe?: string;
  matricule?: string;
  statut_paiement?: string;
};

export default function EcoleApprenantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { token, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [apprenant, setApprenant] = useState<Apprenant | null>(null);
  const [parents, setParents] = useState<Parent[]>([]);
  const [frais, setFrais] = useState<Frais[]>([]);
  const [desaffectationEnCoursId, setDesaffectationEnCoursId] = useState<number | null>(null);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [classe, setClasse] = useState('');

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/ecole/LoginEcoleScreen');
      return;
    }
    if (token && id) charger();
  }, [token, authLoading, id]);

  const charger = async () => {
    setLoading(true);
    try {
      const reponse = await getApprenantEcole(Number(id));
      const a = reponse.data ?? reponse;
      setApprenant(a);
      setParents(reponse.parents || []);
      setFrais(a.frais || []);
      setPrenom(a.prenom || '');
      setNom(a.nom || '');
      setMatricule(a.matricule || '');
      setClasse(a.classe || '');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || "Impossible de charger cet apprenant");
    } finally {
      setLoading(false);
    }
  };

  const handleEnregistrer = async () => {
    if (!prenom || !nom || !matricule || !classe) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setEnregistrement(true);
    try {
      await updateApprenantEcole(Number(id), { prenom, nom, matricule, classe });
      Alert.alert('Enregistré', 'Les informations ont été mises à jour.');
      charger();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Mise à jour impossible');
    } finally {
      setEnregistrement(false);
    }
  };

  const handleDesaffecter = (f: Frais) => {
    Alert.alert(
      'Désaffecter ce frais ?',
      `${f.categorie?.nom || 'Cette catégorie'} sera retirée de ${apprenant?.prenom}. Impossible si des paiements existent déjà.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désaffecter',
          style: 'destructive',
          onPress: async () => {
            setDesaffectationEnCoursId(f.id);
            try {
              await desaffecterFraisApprenant(Number(id), f.id);
              charger();
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.message || 'Désaffectation impossible');
            } finally {
              setDesaffectationEnCoursId(null);
            }
          },
        },
      ]
    );
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
        <View style={styles.titreRow}>
          <UserRound size={18} color="#FFFFFF" />
          <Text style={styles.titre}>{apprenant?.prenom} {apprenant?.nom}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.secLabel}>INFORMATIONS</Text>
        <Text style={styles.lbl}>Prénom *</Text>
        <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Nom *</Text>
        <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Matricule *</Text>
        <TextInput style={styles.input} value={matricule} onChangeText={setMatricule} placeholderTextColor="#AAAAAA" />
        <Text style={styles.lbl}>Classe *</Text>
        <TextInput style={styles.input} value={classe} onChangeText={setClasse} placeholderTextColor="#AAAAAA" />

        <PrimaryButton title="Enregistrer" onPress={handleEnregistrer} loading={enregistrement} icon={<Save size={16} color="#FFFFFF" />} style={{ marginTop: 8 }} />

        <View style={styles.secHeader}>
          <Users size={14} color="#888888" />
          <Text style={styles.secLabel}>PARENTS RATTACHÉS ({parents.length})</Text>
        </View>
        {parents.length === 0 ? (
          <Text style={styles.vide}>Aucun parent rattaché.</Text>
        ) : (
          parents.map((p) => (
            <Card key={p.id} style={styles.parentCard}>
              <Text style={styles.parentNom}>{p.nom_complet} {p.lien ? `(${p.lien})` : ''}</Text>
              {!!p.telephone && (
                <View style={styles.parentLigne}>
                  <Phone size={12} color="#888888" />
                  <Text style={styles.parentTxt}>{p.telephone}</Text>
                </View>
              )}
              {!!p.email && <Text style={styles.parentTxt}>{p.email}</Text>}
            </Card>
          ))
        )}

        <View style={styles.secHeader}>
          <Layers3 size={14} color="#888888" />
          <Text style={styles.secLabel}>FRAIS AFFECTÉS ({frais.length})</Text>
        </View>
        {frais.length === 0 ? (
          <Text style={styles.vide}>Aucun frais affecté.</Text>
        ) : (
          frais.map((f) => (
            <Card key={f.id} style={styles.fraisCard}>
              <View style={styles.fraisTop}>
                <Text style={styles.fraisNom}>{f.categorie?.nom || '—'}</Text>
                <TouchableOpacity onPress={() => handleDesaffecter(f)} disabled={desaffectationEnCoursId === f.id}>
                  {desaffectationEnCoursId === f.id ? <ActivityIndicator size="small" color="#D94040" /> : <Trash2 size={15} color="#D94040" />}
                </TouchableOpacity>
              </View>
              <Text style={styles.fraisMontant}>
                {(f.montant_paye ?? 0).toLocaleString('fr-FR')} / {(f.montant_total ?? 0).toLocaleString('fr-FR')} FCFA
                <Text style={styles.fraisReste}> · reste {(f.reste ?? 0).toLocaleString('fr-FR')} FCFA</Text>
              </Text>
              {!!f.echeanciers?.length && (
                <View style={styles.echeanciersBox}>
                  {f.echeanciers.map((e) => (
                    <Text key={e.id} style={styles.echeancierTxt}>• {e.libelle || 'Échéance'} — {(e.montant ?? 0).toLocaleString('fr-FR')} FCFA{e.date_echeance ? ` avant le ${e.date_echeance.slice(0, 10)}` : ''}</Text>
                  ))}
                </View>
              )}
            </Card>
          ))
        )}
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
  secLabel: { fontSize: 10, fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: 1 },
  secHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24, marginBottom: 8 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  vide: { fontSize: 12, color: '#AAAAAA' },
  parentCard: { padding: 12, marginBottom: 8 },
  parentNom: { fontSize: 12, fontWeight: '700', color: '#1A1A2E', marginBottom: 4, textTransform: 'capitalize' },
  parentLigne: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  parentTxt: { fontSize: 11, color: '#666666' },
  fraisCard: { padding: 12, marginBottom: 8 },
  fraisTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  fraisNom: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  fraisMontant: { fontSize: 12, color: '#1A1A2E', fontWeight: '600' },
  fraisReste: { color: '#888888', fontWeight: '400' },
  echeanciersBox: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0F2F5', gap: 3 },
  echeancierTxt: { fontSize: 11, color: '#666666' },
});
