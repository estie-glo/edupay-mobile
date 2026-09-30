import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, CheckSquare, Copy, EyeOff, Layers3, Pencil, Plus, Square, Trash2, Trash } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { affecterFraisClasse, ajouterEcheancier, creerFraisEcole, dupliquerFraisEcole, getFraisEcole, purgerFraisAnneesPassees, removeFraisEcole, supprimerEcheancier, updateEcheancier, updateFraisEcole } from '../../../services/api';
import Card from '../../../components/ui/Card';
import PrimaryButton from '../../../components/ui/PrimaryButton';

// Champs et règles alignés sur FraisStoreRequest / Etablissement/FraisController
// (vérifiés le 26/09/2026) : annee_scolaire et nb_tranches_max sont TOUJOURS
// obligatoires côté API (même frais non fractionnable → nb_tranches_max=1),
// tout comme date_echeance sur un échéancier — ces champs manquaient dans les
// appels précédents et déclenchaient un 422 systématique à chaque création.
type Echeancier = { id: number; numero_tranche?: number; libelle?: string; montant: number; date_echeance?: string };
type Frais = {
  id: number;
  nom: string;
  description?: string;
  montant_total: number;
  annee_scolaire?: string;
  fractionnable?: boolean;
  nb_tranches_max?: number;
  actif?: boolean;
  echeanciers?: Echeancier[];
};

function anneeScolaireActuelle() {
  const maintenant = new Date();
  const annee = maintenant.getFullYear();
  return maintenant.getMonth() + 1 >= 9 ? `${annee}-${annee + 1}` : `${annee - 1}-${annee}`;
}

function anneeSuivante(anneeScolaire?: string): string {
  const match = (anneeScolaire || anneeScolaireActuelle()).match(/^(\d{4})-(\d{4})$/);
  if (!match) return anneeScolaireActuelle();
  return `${Number(match[1]) + 1}-${Number(match[2]) + 1}`;
}

export default function EcoleFraisScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [frais, setFrais] = useState<Frais[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOuvert, setFormOuvert] = useState(false);
  const [fraisEnEdition, setFraisEnEdition] = useState<number | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [ouvert, setOuvert] = useState<number | null>(null);
  const [classePourAffectation, setClassePourAffectation] = useState<Record<number, string>>({});
  const [nouvelleEcheance, setNouvelleEcheance] = useState<Record<number, { id?: number; numeroTranche?: number; libelle: string; montant: string; date: string }>>({});
  const [envoiEcheance, setEnvoiEcheance] = useState<number | null>(null);
  const [dupliquerEnCoursId, setDupliquerEnCoursId] = useState<number | null>(null);
  const [purgeEnCours, setPurgeEnCours] = useState(false);

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [montantTotal, setMontantTotal] = useState('');
  const [anneeScolaire, setAnneeScolaire] = useState(anneeScolaireActuelle());
  const [fractionnable, setFractionnable] = useState(false);
  const [nbTranchesMax, setNbTranchesMax] = useState('3');
  const [actif, setActif] = useState(true);

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
    setFraisEnEdition(null);
    setNom('');
    setDescription('');
    setMontantTotal('');
    setAnneeScolaire(anneeScolaireActuelle());
    setFractionnable(false);
    setNbTranchesMax('3');
    setActif(true);
  };

  const ouvrirEdition = (f: Frais) => {
    setFraisEnEdition(f.id);
    setNom(f.nom);
    setDescription(f.description || '');
    setMontantTotal(String(f.montant_total));
    setAnneeScolaire(f.annee_scolaire || anneeScolaireActuelle());
    setFractionnable(!!f.fractionnable);
    setNbTranchesMax(String(f.nb_tranches_max || 3));
    setActif(f.actif !== false);
    setFormOuvert(true);
  };

  const handleCreer = async () => {
    const montant = Number(montantTotal.replace(/\D/g, ''));
    if (!nom || !montant || !anneeScolaire) {
      Alert.alert('Erreur', "Veuillez renseigner le nom, le montant et l'année scolaire");
      return;
    }
    setEnvoi(true);
    try {
      const donnees = {
        nom,
        montant_total: montant,
        annee_scolaire: anneeScolaire,
        description: description || undefined,
        fractionnable,
        nb_tranches_max: fractionnable ? Number(nbTranchesMax) || 2 : 1,
        actif,
      };
      if (fraisEnEdition) {
        await updateFraisEcole(fraisEnEdition, donnees);
      } else {
        await creerFraisEcole(donnees);
      }
      resetFormulaire();
      charger();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible d\'enregistrer cette catégorie de frais');
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

  const handleDupliquer = (f: Frais) => {
    const cible = anneeSuivante(f.annee_scolaire);
    Alert.alert(
      'Dupliquer cette catégorie ?',
      `« ${f.nom} » (+ ses échéanciers, décalés d'un an) sera dupliquée vers l'année ${cible}. Pensez ensuite à l'affecter aux apprenants concernés.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Dupliquer',
          onPress: async () => {
            setDupliquerEnCoursId(f.id);
            try {
              const reponse = await dupliquerFraisEcole(f.id, cible);
              Alert.alert('Dupliquée', reponse.message || `Catégorie dupliquée vers ${cible}.`);
              charger();
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.message || 'Duplication impossible');
            } finally {
              setDupliquerEnCoursId(null);
            }
          },
        },
      ]
    );
  };

  const handlePurgerAnneesPassees = () => {
    Alert.alert(
      'Purger les années passées ?',
      "Action IRRÉVERSIBLE : supprime définitivement toutes les catégories de frais (et leurs paiements, échéanciers) des années autres que l'année active. Utilisez ceci uniquement si vous êtes sûr de ne plus avoir besoin de cet historique.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Purger définitivement',
          style: 'destructive',
          onPress: async () => {
            setPurgeEnCours(true);
            try {
              const reponse = await purgerFraisAnneesPassees();
              Alert.alert('Purge effectuée', reponse.message || 'Terminé.');
              charger();
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.message || 'Purge impossible');
            } finally {
              setPurgeEnCours(false);
            }
          },
        },
      ]
    );
  };

  const ouvrirEditionEcheance = (fraisId: number, e: Echeancier) => {
    setNouvelleEcheance((prev) => ({
      ...prev,
      [fraisId]: { id: e.id, numeroTranche: e.numero_tranche, libelle: e.libelle || '', montant: String(e.montant), date: e.date_echeance?.slice(0, 10) || '' },
    }));
  };

  const handleEnregistrerEcheance = async (fraisId: number) => {
    const saisie = nouvelleEcheance[fraisId];
    const montant = Number((saisie?.montant || '').replace(/\D/g, ''));
    if (!montant || !saisie?.date || !/^\d{4}-\d{2}-\d{2}$/.test(saisie.date)) {
      Alert.alert('Erreur', "Veuillez renseigner le montant et une date valide (AAAA-MM-JJ)");
      return;
    }
    setEnvoiEcheance(fraisId);
    try {
      if (saisie.id) {
        await updateEcheancier(fraisId, saisie.id, { numero_tranche: saisie.numeroTranche || 1, libelle: saisie.libelle || undefined, montant, date_echeance: saisie.date });
      } else {
        await ajouterEcheancier(fraisId, { libelle: saisie.libelle || undefined, montant, date_echeance: saisie.date });
      }
      setNouvelleEcheance((prev) => ({ ...prev, [fraisId]: { libelle: '', montant: '', date: '' } }));
      charger();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || "Impossible d'enregistrer cette échéance");
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
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.purgeBtn} onPress={handlePurgerAnneesPassees} disabled={purgeEnCours}>
            {purgeEnCours ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Trash size={16} color="#FFFFFF" />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => setFormOuvert(true)}>
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {formOuvert && (
          <Card style={styles.formCard}>
            <Text style={styles.formTitre}>{fraisEnEdition ? 'Modifier la catégorie de frais' : 'Nouvelle catégorie de frais'}</Text>
            <Text style={styles.lbl}>Nom *</Text>
            <TextInput style={styles.input} placeholder="ex : Scolarité annuelle" placeholderTextColor="#AAAAAA" value={nom} onChangeText={setNom} />
            <Text style={styles.lbl}>Description (optionnel)</Text>
            <TextInput style={styles.input} placeholder="Précisions sur ce frais" placeholderTextColor="#AAAAAA" value={description} onChangeText={setDescription} />
            <Text style={styles.lbl}>Montant total (FCFA) *</Text>
            <TextInput style={styles.input} placeholder="ex : 150000" placeholderTextColor="#AAAAAA" value={montantTotal} onChangeText={setMontantTotal} keyboardType="number-pad" />
            <Text style={styles.lbl}>Année scolaire *</Text>
            <TextInput style={styles.input} placeholder="ex : 2026-2027" placeholderTextColor="#AAAAAA" value={anneeScolaire} onChangeText={setAnneeScolaire} />
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
            <TouchableOpacity style={styles.checkRow} onPress={() => setActif(!actif)}>
              {actif ? <CheckSquare size={18} color="#E8A020" /> : <Square size={18} color="#AAAAAA" />}
              <Text style={styles.checkTxt}>Catégorie active (visible pour affecter des frais)</Text>
            </TouchableOpacity>
            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.btnAnnuler} onPress={resetFormulaire}>
                <Text style={styles.btnAnnulerTxt}>Annuler</Text>
              </TouchableOpacity>
              <PrimaryButton title={fraisEnEdition ? 'Enregistrer' : 'Créer'} onPress={handleCreer} loading={envoi} style={{ flex: 1 }} />
            </View>
          </Card>
        )}

        {frais.length === 0 ? (
          <Text style={styles.vide}>Aucune catégorie de frais créée.</Text>
        ) : (
          frais.map((f) => {
            const estOuvert = ouvert === f.id;
            const estInactif = f.actif === false;
            return (
              <Card key={f.id} style={[styles.card, estInactif && styles.cardInactive]}>
                <TouchableOpacity style={styles.cardTop} onPress={() => setOuvert(estOuvert ? null : f.id)}>
                  <View style={[styles.cardIco, estInactif && styles.cardIcoInactif]}>
                    <Layers3 size={16} color={estInactif ? '#AAAAAA' : '#E8A020'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.nomRow}>
                      <Text style={[styles.nom, estInactif && styles.nomInactif]}>{f.nom}</Text>
                      {estInactif && (
                        <View style={styles.badgeInactif}>
                          <EyeOff size={10} color="#888888" />
                          <Text style={styles.badgeInactifTxt}>Désactivée</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.sousTitre}>
                      {f.montant_total.toLocaleString('fr-FR')} FCFA{f.fractionnable ? ` · jusqu'à ${f.nb_tranches_max || 3} tranches` : ''}{f.annee_scolaire ? ` · ${f.annee_scolaire}` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => ouvrirEdition(f)} style={{ marginRight: 4 }}>
                    <Pencil size={15} color="#666666" />
                  </TouchableOpacity>
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
                          <TouchableOpacity onPress={() => ouvrirEditionEcheance(f.id, e)} style={{ marginRight: 10 }}>
                            <Pencil size={13} color="#666666" />
                          </TouchableOpacity>
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
                        onChangeText={(t) => setNouvelleEcheance((prev) => ({ ...prev, [f.id]: { ...prev[f.id], libelle: t, montant: prev[f.id]?.montant || '', date: prev[f.id]?.date || '' } }))}
                      />
                      <TextInput
                        style={styles.affecterInput}
                        placeholder="Montant"
                        placeholderTextColor="#AAAAAA"
                        keyboardType="number-pad"
                        value={nouvelleEcheance[f.id]?.montant || ''}
                        onChangeText={(t) => setNouvelleEcheance((prev) => ({ ...prev, [f.id]: { ...prev[f.id], libelle: prev[f.id]?.libelle || '', montant: t, date: prev[f.id]?.date || '' } }))}
                      />
                    </View>
                    <View style={styles.affecterRow}>
                      <TextInput
                        style={styles.affecterInput}
                        placeholder="Date limite AAAA-MM-JJ"
                        placeholderTextColor="#AAAAAA"
                        value={nouvelleEcheance[f.id]?.date || ''}
                        onChangeText={(t) => setNouvelleEcheance((prev) => ({ ...prev, [f.id]: { ...prev[f.id], libelle: prev[f.id]?.libelle || '', montant: prev[f.id]?.montant || '', date: t } }))}
                      />
                      <TouchableOpacity style={styles.affecterBtn} onPress={() => handleEnregistrerEcheance(f.id)} disabled={envoiEcheance === f.id}>
                        {envoiEcheance === f.id ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.affecterBtnTxt}>{nouvelleEcheance[f.id]?.id ? 'Enregistrer' : '+ Échéance'}</Text>}
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.btnDupliquer} onPress={() => handleDupliquer(f)} disabled={dupliquerEnCoursId === f.id}>
                      {dupliquerEnCoursId === f.id ? <ActivityIndicator size="small" color="#0B2545" /> : <><Copy size={13} color="#0B2545" /><Text style={styles.btnDupliquerTxt}>Dupliquer vers {anneeSuivante(f.annee_scolaire)}</Text></>}
                    </TouchableOpacity>

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
              </Card>
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
  purgeBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnDupliquer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: '#0B2545', borderRadius: 8, paddingVertical: 9, marginTop: 12 },
  btnDupliquerTxt: { color: '#0B2545', fontSize: 11, fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  vide: { fontSize: 13, color: '#888888', textAlign: 'center', marginTop: 40 },
  card: { padding: 14, marginBottom: 10 },
  cardInactive: { backgroundColor: '#F5F6F7', opacity: 0.75 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIco: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FEF3DC', alignItems: 'center', justifyContent: 'center' },
  cardIcoInactif: { backgroundColor: '#E2E8F0' },
  nomRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  nom: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  nomInactif: { color: '#888888' },
  badgeInactif: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeInactifTxt: { fontSize: 9, fontWeight: '700', color: '#888888' },
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
  formCard: { padding: 16, marginBottom: 16 },
  formTitre: { fontSize: 14, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F5F6F7', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  checkTxt: { fontSize: 12, color: '#555555' },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnAnnuler: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  btnAnnulerTxt: { color: '#666666', fontSize: 12, fontWeight: '700' },
});
