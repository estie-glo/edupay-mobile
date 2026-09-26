import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, CheckSquare, FileSpreadsheet, Plus, Search, Square, Trash2, UserCheck, UserX, X } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { bulkDestroyApprenantsEcole, creerApprenantEcole, getApprenantsEcole, getUrlModeleImportCsv, importerApprenantsCsv, rejeterApprenant, removeApprenantEcole, validerApprenant } from '../../../services/api';
import { telechargerEtPartager } from '../../../services/fichiers';

// Champs alignés sur ApprenantResource / Etablissement/ApprenantController::index
// (vérifiés le 27/09/2026, après le correctif backend "audit E-F") : `statut`
// (en_attente | valide | actif — dérivé de Apprenant::statutRattachement(),
// pas de valeur "rejete" car le rejet supprime l'apprenant) pilote l'affichage
// Valider/Rejeter ; total_du/total_paye/solde_du sont désormais exposés aussi.
type Apprenant = {
  id: number;
  prenom: string;
  nom: string;
  matricule?: string;
  classe?: string;
  statut?: 'en_attente' | 'valide' | 'actif';
  statut_paiement?: string; // a_jour | partiel | impaye
  solde_du?: number;
};

const STATUT_PAIEMENT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  a_jour: { bg: '#E0F5EE', fg: '#085041', label: 'À jour' },
  partiel: { bg: '#FEF3DC', fg: '#8B5E10', label: 'Partiel' },
  impaye: { bg: '#FBEAEA', fg: '#9B2C2C', label: 'Impayé' },
};

function styleStatutPaiement(statut?: string) {
  return STATUT_PAIEMENT_STYLE[(statut || 'a_jour').toLowerCase()] || { bg: '#F0F2F5', fg: '#666666', label: statut || '—' };
}

const STATUTS_PAIEMENT_FILTRE = [
  { valeur: '', label: 'Tous' },
  { valeur: 'a_jour', label: 'À jour' },
  { valeur: 'partiel', label: 'Partiel' },
  { valeur: 'impaye', label: 'Impayé' },
];

export default function EcoleApprenantsScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlus, setLoadingPlus] = useState(false);
  const [page, setPage] = useState(1);
  const [dernierePage, setDernierePage] = useState(1);
  const [recherche, setRecherche] = useState('');
  const [classeFiltre, setClasseFiltre] = useState('');
  const [statutFiltre, setStatutFiltre] = useState('');
  const [formOuvert, setFormOuvert] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [enTraitement, setEnTraitement] = useState<number | null>(null);
  const [importEnCours, setImportEnCours] = useState(false);
  const [modeleEnCours, setModeleEnCours] = useState(false);
  const [modeSelection, setModeSelection] = useState(false);
  const [selection, setSelection] = useState<number[]>([]);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [classe, setClasse] = useState('');

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/ecole/LoginEcoleScreen');
      return;
    }
    if (token) charger(1);
  }, [token, authLoading]);

  const charger = async (pageAcharger: number, q = recherche, cls = classeFiltre, statut = statutFiltre) => {
    if (pageAcharger === 1) setLoading(true);
    else setLoadingPlus(true);
    try {
      const response = await getApprenantsEcole({ q: q || undefined, classe: cls || undefined, statut_paiement: statut || undefined, page: pageAcharger });
      const items: Apprenant[] = response.data ?? [];
      setApprenants((prev) => (pageAcharger === 1 ? items : [...prev, ...items]));
      setDernierePage(response.meta?.last_page ?? pageAcharger);
      setPage(pageAcharger);
      if (response.classes) setClasses(response.classes.filter(Boolean));
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger les apprenants');
    } finally {
      setLoading(false);
      setLoadingPlus(false);
    }
  };

  const lancerRecherche = () => charger(1, recherche, classeFiltre, statutFiltre);
  const changerClasse = (v: string) => {
    setClasseFiltre(v);
    charger(1, recherche, v, statutFiltre);
  };
  const changerStatut = (v: string) => {
    setStatutFiltre(v);
    charger(1, recherche, classeFiltre, v);
  };

  const resetFormulaire = () => {
    setFormOuvert(false);
    setPrenom('');
    setNom('');
    setMatricule('');
    setClasse('');
  };

  const handleTelechargerModele = async () => {
    setModeleEnCours(true);
    try {
      await telechargerEtPartager(getUrlModeleImportCsv(), 'modele-import-apprenants.csv');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Téléchargement du modèle impossible');
    } finally {
      setModeleEnCours(false);
    }
  };

  const handleImporterCsv = async () => {
    const resultat = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'text/comma-separated-values'], copyToCacheDirectory: true });
    if (resultat.canceled || !resultat.assets?.[0]) return;
    const fichier = resultat.assets[0];
    setImportEnCours(true);
    try {
      const reponse = await importerApprenantsCsv({ uri: fichier.uri, name: fichier.name, mimeType: fichier.mimeType });
      Alert.alert('Import terminé', reponse.message || `${reponse.importes ?? 0} apprenant(s) importé(s).`);
      charger(1);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || "Échec de l'import du fichier");
    } finally {
      setImportEnCours(false);
    }
  };

  const handleAjouter = async () => {
    if (!prenom || !nom || !matricule || !classe) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setEnvoi(true);
    try {
      await creerApprenantEcole({ prenom, nom, matricule, classe });
      resetFormulaire();
      charger(1);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || "Impossible d'ajouter cet apprenant");
    } finally {
      setEnvoi(false);
    }
  };

  const handleValider = async (a: Apprenant) => {
    setEnTraitement(a.id);
    try {
      await validerApprenant(a.id);
      charger(1);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Validation impossible');
    } finally {
      setEnTraitement(null);
    }
  };

  const handleRejeter = (a: Apprenant) => {
    Alert.alert('Rejeter ce rattachement ?', `${a.prenom} ${a.nom} ne sera pas rattaché à ce parent.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Rejeter',
        style: 'destructive',
        onPress: async () => {
          setEnTraitement(a.id);
          try {
            await rejeterApprenant(a.id);
            charger(1);
          } catch (error: any) {
            Alert.alert('Erreur', error.response?.data?.message || 'Rejet impossible');
          } finally {
            setEnTraitement(null);
          }
        },
      },
    ]);
  };

  const handleSupprimer = (a: Apprenant) => {
    Alert.alert('Supprimer cet apprenant ?', `${a.prenom} ${a.nom} sera retiré de l'annuaire.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeApprenantEcole(a.id);
            charger(1);
          } catch (error: any) {
            Alert.alert('Erreur', error.response?.data?.message || 'Suppression impossible');
          }
        },
      },
    ]);
  };

  const basculerSelection = (id: number) => {
    setSelection((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const annulerSelection = () => {
    setModeSelection(false);
    setSelection([]);
  };

  const handleSupprimerSelection = () => {
    if (selection.length === 0) return;
    Alert.alert(
      'Supprimer les apprenants sélectionnés ?',
      `${selection.length} apprenant(s) seront retirés de l'annuaire.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setSuppressionEnCours(true);
            try {
              await bulkDestroyApprenantsEcole(selection);
              annulerSelection();
              charger(1);
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.message || 'Suppression impossible');
            } finally {
              setSuppressionEnCours(false);
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
        <TouchableOpacity style={styles.backBtn} onPress={() => (modeSelection ? annulerSelection() : router.back())}>
          {modeSelection ? <X size={18} color="#FFFFFF" /> : <ArrowLeft size={18} color="#FFFFFF" />}
        </TouchableOpacity>
        <Text style={styles.titre}>{modeSelection ? `${selection.length} sélectionné(s)` : 'Apprenants'}</Text>
        {modeSelection ? (
          <TouchableOpacity style={styles.addBtn} onPress={handleSupprimerSelection} disabled={suppressionEnCours || selection.length === 0}>
            {suppressionEnCours ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Trash2 size={16} color="#FFFFFF" />}
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.selectBtn} onPress={() => setModeSelection(true)}>
              <CheckSquare size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={() => setFormOuvert(true)}>
              <Plus size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.searchZone}>
        <View style={styles.rechercheBox}>
          <Search size={14} color="#AAAAAA" />
          <TextInput
            style={styles.rechercheInput}
            placeholder="Rechercher un nom, un matricule..."
            placeholderTextColor="#AAAAAA"
            value={recherche}
            onChangeText={setRecherche}
            onSubmitEditing={lancerRecherche}
            returnKeyType="search"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {STATUTS_PAIEMENT_FILTRE.map((s) => (
            <TouchableOpacity key={s.valeur} style={[styles.chip, statutFiltre === s.valeur && styles.chipActive]} onPress={() => changerStatut(s.valeur)}>
              <Text style={[styles.chipTxt, statutFiltre === s.valeur && styles.chipTxtActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
          {classes.length > 0 && (
            <>
              <TouchableOpacity style={[styles.chip, classeFiltre === '' && styles.chipActive]} onPress={() => changerClasse('')}>
                <Text style={[styles.chipTxt, classeFiltre === '' && styles.chipTxtActive]}>Toutes classes</Text>
              </TouchableOpacity>
              {classes.map((c) => (
                <TouchableOpacity key={c} style={[styles.chip, classeFiltre === c && styles.chipActive]} onPress={() => changerClasse(c)}>
                  <Text style={[styles.chipTxt, classeFiltre === c && styles.chipTxtActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
        <View style={styles.importRow}>
          <TouchableOpacity style={styles.importBtn} onPress={handleImporterCsv} disabled={importEnCours}>
            {importEnCours ? <ActivityIndicator size="small" color="#FFFFFF" /> : <FileSpreadsheet size={13} color="#FFFFFF" />}
            <Text style={styles.importBtnTxt}>Importer un CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleTelechargerModele} disabled={modeleEnCours}>
            <Text style={styles.modeleLien}>{modeleEnCours ? '...' : 'Modèle CSV'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {formOuvert && (
          <View style={styles.formCard}>
            <Text style={styles.formTitre}>Ajouter un apprenant</Text>
            <Text style={styles.lbl}>Prénom *</Text>
            <TextInput style={styles.input} placeholder="ex : Brice" placeholderTextColor="#AAAAAA" value={prenom} onChangeText={setPrenom} />
            <Text style={styles.lbl}>Nom *</Text>
            <TextInput style={styles.input} placeholder="ex : FONO" placeholderTextColor="#AAAAAA" value={nom} onChangeText={setNom} />
            <Text style={styles.lbl}>Matricule *</Text>
            <TextInput style={styles.input} placeholder="ex : 2026-0451" placeholderTextColor="#AAAAAA" value={matricule} onChangeText={setMatricule} />
            <Text style={styles.lbl}>Classe *</Text>
            <TextInput style={styles.input} placeholder="ex : 3eme A" placeholderTextColor="#AAAAAA" value={classe} onChangeText={setClasse} />
            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.btnAnnuler} onPress={resetFormulaire}>
                <Text style={styles.btnAnnulerTxt}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnEnvoyer, envoi && { opacity: 0.7 }]} onPress={handleAjouter} disabled={envoi}>
                {envoi ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnEnvoyerTxt}>Ajouter</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {apprenants.length === 0 ? (
          <Text style={styles.vide}>Aucun apprenant trouvé.</Text>
        ) : (
          apprenants.map((a) => {
            const s = styleStatutPaiement(a.statut_paiement);
            const enAttente = a.statut === 'en_attente';
            const selectionne = selection.includes(a.id);
            return (
              <TouchableOpacity
                key={a.id}
                style={styles.card}
                onPress={() => (modeSelection ? basculerSelection(a.id) : router.push({ pathname: '/screens/ecole/EcoleApprenantDetailScreen', params: { id: String(a.id) } }))}
                onLongPress={() => {
                  setModeSelection(true);
                  basculerSelection(a.id);
                }}
              >
                <View style={styles.cardTop}>
                  {modeSelection && (
                    selectionne ? <CheckSquare size={18} color="#E8A020" /> : <Square size={18} color="#AAAAAA" />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nom}>{a.prenom} {a.nom}</Text>
                    <Text style={styles.sousTitre}>{a.matricule || '—'}{a.classe ? ` · ${a.classe}` : ''}</Text>
                    {!!a.solde_du && <Text style={styles.soldeDu}>Reste dû : {a.solde_du.toLocaleString('fr-FR')} FCFA</Text>}
                  </View>
                  <View style={[styles.pill, { backgroundColor: s.bg }]}>
                    <Text style={[styles.pillTxt, { color: s.fg }]}>{s.label}</Text>
                  </View>
                </View>
                {!modeSelection && (
                  <View style={styles.actionsRow}>
                    {enAttente ? (
                      <>
                        <TouchableOpacity style={styles.actionBtnValider} onPress={() => handleValider(a)} disabled={enTraitement === a.id}>
                          {enTraitement === a.id ? <ActivityIndicator size="small" color="#FFFFFF" /> : <><UserCheck size={14} color="#FFFFFF" /><Text style={styles.actionBtnTxt}>Valider</Text></>}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtnRejeter} onPress={() => handleRejeter(a)} disabled={enTraitement === a.id}>
                          <UserX size={14} color="#D94040" />
                          <Text style={styles.actionBtnRejeterTxt}>Rejeter</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity style={styles.supprimerBtn} onPress={() => handleSupprimer(a)}>
                        <Trash2 size={14} color="#D94040" />
                        <Text style={styles.actionBtnRejeterTxt}>Retirer</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}

        {page < dernierePage && (
          <TouchableOpacity style={styles.btnPlus} onPress={() => charger(page + 1)} disabled={loadingPlus}>
            {loadingPlus ? <ActivityIndicator color="#E8A020" /> : <Text style={styles.btnPlusTxt}>Charger plus</Text>}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  addBtn: { backgroundColor: '#E8A020', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  searchZone: { backgroundColor: '#0B2545', paddingHorizontal: 16, paddingBottom: 16 },
  searchInput: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: '#1A1A2E', marginBottom: 10 },
  rechercheBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  rechercheInput: { flex: 1, fontSize: 13, color: '#1A1A2E' },
  chipsRow: { flexDirection: 'row', marginBottom: 10 },
  chip: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6 },
  chipActive: { backgroundColor: '#E8A020' },
  chipTxt: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  chipTxtActive: { color: '#FFFFFF' },
  btnPlus: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  btnPlusTxt: { color: '#E8A020', fontSize: 13, fontWeight: '700' },
  importRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  importBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  importBtnTxt: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  modeleLien: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', textDecorationLine: 'underline' },
  content: { flex: 1, padding: 16 },
  vide: { fontSize: 13, color: '#888888', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  selectBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  nom: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  sousTitre: { fontSize: 11, color: '#888888', marginTop: 2 },
  soldeDu: { fontSize: 11, color: '#D94040', fontWeight: '600', marginTop: 3 },
  pill: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  pillTxt: { fontSize: 10, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtnValider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#0D9E75', borderRadius: 8, paddingVertical: 9, flex: 1 },
  actionBtnTxt: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  actionBtnRejeter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: '#FBEAEA', borderRadius: 8, paddingVertical: 9, flex: 1 },
  actionBtnRejeterTxt: { color: '#D94040', fontSize: 11, fontWeight: '700' },
  supprimerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: '#FBEAEA', borderRadius: 8, paddingVertical: 9, flex: 1 },
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
