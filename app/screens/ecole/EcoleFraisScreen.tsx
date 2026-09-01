import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, CheckSquare, Layers3, Plus, Square, Trash2 } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { affecterFraisClasse, ajouterEcheancier, creerFraisEcole, getFraisEcole, removeFraisEcole, supprimerEcheancier } from '../../../services/api';

type Echeancier = { id: number; libelle?: string; montant: number; date_echeance?: string };
type Frais = { id: number; nom: string; montant_total: number; fractionnable?: boolean; nb_tranches_max?: number; echeanciers?: Echeancier[] };

export default function EcoleFraisScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [frais, setFrais] = useState<Frais[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOuvert, setFormOuvert] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [ouvert, setOuvert] = useState<number | null>(null);
  const [classePourAffectation, setClassePourAffectation] = useState<Record<number, string>>({});
  const [nouvelleEcheance, setNouvelleEcheance] = useState<Record<number, { libelle: string; montant: string }>>({});
  const [envoiEcheance, setEnvoiEcheance] = useState<number | null>(null);

  const [nom, setNom] = useState('');
  const [montantTotal, setMontantTotal] = useState('');
  const [fractionnable, setFractionnable] = useState(false);
  const [nbTranchesMax, setNbTranchesMax] = useState('3');

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
      const response = await getFraisEcole();
      const data = response.data ?? response;
      setFrais(Array.isArray(data) ? data : data.frais ?? []);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger les frais');
    } finally {
      setLoading(false);
    }
  };

  const resetFormulaire = () => {
    setFormOuvert(false);
    setNom('');
    setMontantTotal('');
    setFractionnable(false);
    setNbTranchesMax('3');
  };

  const handleCreer = async () => {
    const montant = Number(montantTotal.replace(/\D/g, ''));
    if (!nom || !montant) {
      Alert.alert('Erreur', 'Veuillez renseigner le nom et le montant');
      return;
    }
    setEnvoi(true);
    try {
      await creerFraisEcole({
        nom,
        montant_total: montant,
        fractionnable,
        nb_tranches_max: fractionnable ? Number(nbTranchesMax) || 3 : undefined,
      });
      resetFormulaire();
      charger();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de créer cette catégorie de frais');
    } finally {
      setEnvoi(false);
    }
  };

  const handleSupprimer = (f: Frais) => {
    Alert.alert('Supprimer cette catégorie ?', `« ${f.nom} » sera définitivement supprimée.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFraisEcole(f.id);
            charger();
          } catch (error: any) {
            Alert.alert('Erreur', error.response?.data?.message || 'Suppression impossible');
          }
        },
      },
    ]);
  };

  const handleAffecter = async (f: Frais) => {
    const classe = classePourAffectation[f.id];
    if (!classe) {
      Alert.alert('Erreur', 'Indiquez une classe à affecter');
      return;
    }
    try {
      await affecterFraisClasse(f.id, classe);
      Alert.alert('Affecté', `« ${f.nom} » a été affecté à la classe ${classe}.`);
      setClassePourAffectation((prev) => ({ ...prev, [f.id]: '' }));
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || "Affectation impossible");
    }
  };

  const handleAjouterEcheance = async (fraisId: number) => {
    const saisie = nouvelleEcheance[fraisId];
    const montant = Number((saisie?.montant || '').replace(/\D/g, ''));
    if (!saisie?.libelle || !montant) {
      Alert.alert('Erreur', "Veuillez renseigner l'intitulé et le montant de l'échéance");
      return;
    }
    setEnvoiEcheance(fraisId);
    try {
      await ajouterEcheancier(fraisId, { libelle: saisie.libelle, montant });
      setNouvelleEcheance((prev) => ({ ...prev, [fraisId]: { libelle: '', montant: '' } }));
      charger();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || "Impossible d'ajouter cette échéance");
    } finally {
      setEnvoiEcheance(null);
    }
  };

  const handleSupprimerEcheancier = (fraisId: number, echeancierId: number) => {
    Alert.alert('Supprimer cette échéance ?', '', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await supprimerEcheancier(fraisId, echeancierId);
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
        <Text style={styles.titre}>Frais & échéanciers</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setFormOuvert(true)}>
          <Plus size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {formOuvert && (
          <View style={styles.formCard}>
            <Text style={styles.formTitre}>Nouvelle catégorie de frais</Text>
            <Text style={styles.lbl}>Nom *</Text>
            <TextInput style={styles.input} placeholder="ex : Scolarité annuelle" placeholderTextColor="#AAAAAA" value={nom} onChangeText={setNom} />
            <Text style={styles.lbl}>Montant total (FCFA) *</Text>
            <TextInput style={styles.input} placeholder="ex : 150000" placeholderTextColor="#AAAAAA" value={montantTotal} onChangeText={setMontantTotal} keyboardType="number-pad" />
            <TouchableOpacity style={styles.checkRow} onPress={() => setFractionnable(!fractionnable)}>
              {fractionnable ? <CheckSquare size={18} color="#E8A020" /> : <Square size={18} color="#AAAAAA" />}
              <Text style={styles.checkTxt}>Fractionnable en tranches</Text>
            </TouchableOpacity>
            {fractionnable && (
              <>
                <Text style={styles.lbl}>Nombre de tranches max (2 ou 3)</Text>
                <TextInput style={styles.input} value={nbTranchesMax} onChangeText={setNbTranchesMax} keyboardType="number-pad" maxLength={1} />
              </>
            )}
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

        {frais.length === 0 ? (
          <Text style={styles.vide}>Aucune catégorie de frais créée.</Text>
        ) : (
          frais.map((f) => {
            const estOuvert = ouvert === f.id;
            return (
              <View key={f.id} style={styles.card}>
                <TouchableOpacity style={styles.cardTop} onPress={() => setOuvert(estOuvert ? null : f.id)}>
                  <View style={styles.cardIco}>
                    <Layers3 size={16} color="#E8A020" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nom}>{f.nom}</Text>
                    <Text style={styles.sousTitre}>
                      {f.montant_total.toLocaleString('fr-FR')} FCFA{f.fractionnable ? ` · jusqu'à ${f.nb_tranches_max || 3} tranches` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleSupprimer(f)}>
                    <Trash2 size={16} color="#D94040" />
                  </TouchableOpacity>
                </TouchableOpacity>

                {estOuvert && (
                  <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>ÉCHÉANCIERS</Text>
                    {(f.echeanciers ?? []).length === 0 ? (
                      <Text style={styles.videMini}>Aucune échéance définie.</Text>
                    ) : (
                      f.echeanciers!.map((e) => (
                        <View key={e.id} style={styles.echeancierRow}>
                          <Text style={styles.echeancierTxt}>{e.libelle || 'Échéance'} — {e.montant.toLocaleString('fr-FR')} F{e.date_echeance ? ` (${e.date_echeance.slice(0, 10)})` : ''}</Text>
                          <TouchableOpacity onPress={() => handleSupprimerEcheancier(f.id, e.id)}>
                            <Trash2 size={13} color="#D94040" />
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                    <View style={styles.affecterRow}>
                      <TextInput
                        style={[styles.affecterInput, { flex: 1.2 }]}
                        placeholder="Intitulé (ex : Tranche 1)"
                        placeholderTextColor="#AAAAAA"
                        value={nouvelleEcheance[f.id]?.libelle || ''}
                        onChangeText={(t) => setNouvelleEcheance((prev) => ({ ...prev, [f.id]: { libelle: t, montant: prev[f.id]?.montant || '' } }))}
                      />
                      <TextInput
                        style={styles.affecterInput}
                        placeholder="Montant"
                        placeholderTextColor="#AAAAAA"
                        keyboardType="number-pad"
                        value={nouvelleEcheance[f.id]?.montant || ''}
                        onChangeText={(t) => setNouvelleEcheance((prev) => ({ ...prev, [f.id]: { libelle: prev[f.id]?.libelle || '', montant: t } }))}
                      />
                      <TouchableOpacity style={styles.affecterBtn} onPress={() => handleAjouterEcheance(f.id)} disabled={envoiEcheance === f.id}>
                        {envoiEcheance === f.id ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.affecterBtnTxt}>+ Échéance</Text>}
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.detailLabel, { marginTop: 14 }]}>AFFECTER À UNE CLASSE</Text>
                    <View style={styles.affecterRow}>
                      <TextInput
                        style={styles.affecterInput}
                        placeholder="ex : 3eme A"
                        placeholderTextColor="#AAAAAA"
                        value={classePourAffectation[f.id] || ''}
                        onChangeText={(t) => setClassePourAffectation((prev) => ({ ...prev, [f.id]: t }))}
                      />
                      <TouchableOpacity style={styles.affecterBtn} onPress={() => handleAffecter(f)}>
                        <Text style={styles.affecterBtnTxt}>Affecter</Text>
                      </TouchableOpacity>
                    </View>
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
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  addBtn: { backgroundColor: '#E8A020', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, padding: 16 },
  vide: { fontSize: 13, color: '#888888', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIco: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FEF3DC', alignItems: 'center', justifyContent: 'center' },
  nom: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  sousTitre: { fontSize: 11, color: '#888888', marginTop: 2 },
  detailBox: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F0F2F5' },
  detailLabel: { fontSize: 9, fontWeight: '800', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  videMini: { fontSize: 11, color: '#888888' },
  echeancierRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  echeancierTxt: { fontSize: 11, color: '#333333', flex: 1 },
  affecterRow: { flexDirection: 'row', gap: 8 },
  affecterInput: { flex: 1, backgroundColor: '#F5F6F7', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, color: '#1A1A2E' },
  affecterBtn: { backgroundColor: '#E8A020', borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  affecterBtnTxt: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  formTitre: { fontSize: 14, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F5F6F7', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  checkTxt: { fontSize: 12, color: '#555555' },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnAnnuler: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  btnAnnulerTxt: { color: '#666666', fontSize: 12, fontWeight: '700' },
  btnEnvoyer: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#E8A020' },
  btnEnvoyerTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
