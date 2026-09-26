import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Award, ChevronRight, School, Search, Trash2, UserPlus } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { getApprenants, getEtablissementsPourRattachement, rattacherApprenant, removeApprenant } from '../../../services/api';
import { telechargerEtPartager } from '../../../services/fichiers';
import BottomNavParent from '../../../components/BottomNavParent';

type EtablissementAnnuaire = { id: number; nom: string; ville?: string; type?: string; code_etablissement: string };

type Apprenant = {
  id: number;
  prenom: string;
  nom: string;
  classe?: string;
  etablissement?: { nom?: string; code_etablissement?: string };
  solde_du?: number;
  statut?: string;
};

const STATUT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  a_jour: { bg: '#E0F5EE', fg: '#085041', label: 'À jour' },
  partiel: { bg: '#FEF3DC', fg: '#8B5E10', label: 'Partiel' },
  impaye: { bg: '#FBEAEA', fg: '#9B2C2C', label: 'Impayé' },
};

function styleStatut(statut?: string) {
  return STATUT_STYLE[(statut || 'a_jour').toLowerCase()] || { bg: '#F0F2F5', fg: '#666666', label: statut || '—' };
}

type Candidat = { id: number; prenom: string; nom: string; classe?: string; matricule?: string };

export default function EnfantsScreen() {
  const router = useRouter();
  const { token, isLoading: authLoading, user } = useAuth();
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOuvert, setFormOuvert] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  const [annuaire, setAnnuaire] = useState<EtablissementAnnuaire[]>([]);
  const [rechercheEtab, setRechercheEtab] = useState('');
  const [etablissementChoisi, setEtablissementChoisi] = useState<EtablissementAnnuaire | null>(null);
  const [modeConnuMatricule, setModeConnuMatricule] = useState(true);
  const [matricule, setMatricule] = useState('');
  const [nomRecherche, setNomRecherche] = useState('');
  const [prenomRecherche, setPrenomRecherche] = useState('');
  const [classeRecherche, setClasseRecherche] = useState('');
  const [candidats, setCandidats] = useState<Candidat[] | null>(null);
  const [certificatEnCoursId, setCertificatEnCoursId] = useState<number | null>(null);

  const lien: 'parent' | 'soi-meme' = user?.profil === 'eleve' || user?.profil === 'etudiant' ? 'soi-meme' : 'parent';

  useEffect(() => {
    if (!token && !authLoading) {
      router.replace('/screens/parent/LoginParentScreen');
      return;
    }
    if (token) {
      chargerApprenants();
      getEtablissementsPourRattachement().then((r) => setAnnuaire(r.data ?? r)).catch(() => setAnnuaire([]));
    }
  }, [token, authLoading]);

  const etablissementsFiltres = annuaire.filter((e) => {
    const q = rechercheEtab.trim().toLowerCase();
    return !q || e.nom.toLowerCase().includes(q) || (e.ville || '').toLowerCase().includes(q);
  });

  const chargerApprenants = async () => {
    setLoading(true);
    try {
      const response = await getApprenants();
      const data = response.data ?? response;
      setApprenants(Array.isArray(data) ? data : data.apprenants ?? []);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de charger vos enfants');
    } finally {
      setLoading(false);
    }
  };

  const resetFormulaire = () => {
    setFormOuvert(false);
    setRechercheEtab('');
    setEtablissementChoisi(null);
    setModeConnuMatricule(true);
    setMatricule('');
    setNomRecherche('');
    setPrenomRecherche('');
    setClasseRecherche('');
    setCandidats(null);
  };

  const traiterReponseRattachement = (reponse: any) => {
    const donnees = reponse.data;
    if (Array.isArray(donnees)) {
      if (donnees.length === 0) {
        Alert.alert('Aucun résultat', reponse.message || 'Aucun apprenant ne correspond à ces critères.');
        return;
      }
      // Plusieurs correspondances : l'utilisateur doit désambiguïser.
      setCandidats(donnees);
      return;
    }
    // Un seul apprenant : déjà rattaché par le serveur.
    resetFormulaire();
    chargerApprenants();
    Alert.alert('Rattaché', reponse.message || 'Apprenant rattaché avec succès.');
  };

  const handleAjouter = async () => {
    if (!etablissementChoisi) {
      Alert.alert('Erreur', "Veuillez choisir l'établissement");
      return;
    }
    if (modeConnuMatricule && !matricule) {
      Alert.alert('Erreur', 'Veuillez renseigner le matricule');
      return;
    }
    if (!modeConnuMatricule && !nomRecherche && !prenomRecherche) {
      Alert.alert('Erreur', 'Veuillez renseigner au moins le nom ou le prénom');
      return;
    }
    setEnvoi(true);
    try {
      const reponse = modeConnuMatricule
        ? await rattacherApprenant({ code_etablissement: etablissementChoisi.code_etablissement, mode: 'matricule', matricule, lien })
        : await rattacherApprenant({
            code_etablissement: etablissementChoisi.code_etablissement,
            mode: 'recherche',
            nom: nomRecherche || undefined,
            prenom: prenomRecherche || undefined,
            classe: classeRecherche || undefined,
            lien,
          });
      traiterReponseRattachement(reponse);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de rattacher cet apprenant');
    } finally {
      setEnvoi(false);
    }
  };

  const handleChoisirCandidat = async (candidat: Candidat) => {
    if (!etablissementChoisi || !candidat.matricule) return;
    setEnvoi(true);
    try {
      const reponse = await rattacherApprenant({ code_etablissement: etablissementChoisi.code_etablissement, mode: 'matricule', matricule: candidat.matricule, lien });
      traiterReponseRattachement(reponse);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de rattacher cet apprenant');
    } finally {
      setEnvoi(false);
    }
  };

  const handleSupprimer = (apprenant: Apprenant) => {
    Alert.alert(
      'Supprimer cet enfant ?',
      `${apprenant.prenom} ${apprenant.nom} sera détaché de votre compte.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeApprenant(apprenant.id);
              chargerApprenants();
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.message || 'Suppression impossible');
            }
          },
        },
      ]
    );
  };

  const handleTelechargerCertificat = async (apprenant: Apprenant) => {
    setCertificatEnCoursId(apprenant.id);
    try {
      await telechargerEtPartager(`/apprenants/${apprenant.id}/certificat`, `certificat-${apprenant.prenom}-${apprenant.nom}.pdf`);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Téléchargement du certificat impossible');
    } finally {
      setCertificatEnCoursId(null);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0D9E75" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.titre}>Mes enfants</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setFormOuvert(true)}>
          <UserPlus size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {formOuvert && (
          <View style={styles.formCard}>
            <Text style={styles.formTitre}>Rattacher un enfant</Text>
            <Text style={styles.formSousTitre}>Recherchez l'établissement de l'enfant, puis renseignez son matricule.</Text>

            <Text style={styles.lbl}>Établissement *</Text>
            {etablissementChoisi ? (
              <TouchableOpacity style={styles.etabChoisi} onPress={() => setEtablissementChoisi(null)}>
                <School size={16} color="#0D9E75" />
                <Text style={styles.etabChoisiTxt}>{etablissementChoisi.nom} · {etablissementChoisi.ville}</Text>
                <Text style={styles.etabChoisiChanger}>Changer</Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.rechercheBox}>
                  <Search size={14} color="#AAAAAA" />
                  <TextInput
                    style={styles.rechercheInput}
                    placeholder="Nom ou ville de l'établissement"
                    placeholderTextColor="#AAAAAA"
                    value={rechercheEtab}
                    onChangeText={setRechercheEtab}
                  />
                </View>
                <View style={styles.listeEtabs}>
                  {etablissementsFiltres.slice(0, 6).map((e) => (
                    <TouchableOpacity key={e.id} style={styles.etabItem} onPress={() => setEtablissementChoisi(e)}>
                      <School size={14} color="#888888" />
                      <Text style={styles.etabItemTxt}>{e.nom} · {e.ville}</Text>
                    </TouchableOpacity>
                  ))}
                  {rechercheEtab.length > 0 && etablissementsFiltres.length === 0 && (
                    <Text style={styles.etabVide}>Aucun établissement trouvé.</Text>
                  )}
                </View>
              </>
            )}

            {candidats ? (
              <>
                <Text style={styles.lbl}>Plusieurs apprenants correspondent — sélectionnez le bon</Text>
                {candidats.map((c) => (
                  <TouchableOpacity key={c.id} style={styles.etabItem} onPress={() => handleChoisirCandidat(c)} disabled={envoi}>
                    <School size={14} color="#888888" />
                    <Text style={styles.etabItemTxt}>{c.prenom} {c.nom}{c.classe ? ` · ${c.classe}` : ''}{c.matricule ? ` · ${c.matricule}` : ''}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.btnAnnuler} onPress={() => setCandidats(null)}>
                  <Text style={styles.btnAnnulerTxt}>Aucun de ceux-ci</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.modeToggle} onPress={() => setModeConnuMatricule((v) => !v)}>
                  <Text style={styles.modeToggleTxt}>
                    {modeConnuMatricule ? 'Je ne connais pas le matricule →' : 'Je connais le matricule →'}
                  </Text>
                </TouchableOpacity>

                {modeConnuMatricule ? (
                  <>
                    <Text style={styles.lbl}>Matricule de l'enfant *</Text>
                    <TextInput style={styles.input} placeholder="ex : 2026-0451" placeholderTextColor="#AAAAAA" value={matricule} onChangeText={setMatricule} />
                  </>
                ) : (
                  <>
                    <Text style={styles.lbl}>Prénom</Text>
                    <TextInput style={styles.input} placeholder="ex : Brice" placeholderTextColor="#AAAAAA" value={prenomRecherche} onChangeText={setPrenomRecherche} />
                    <Text style={styles.lbl}>Nom</Text>
                    <TextInput style={styles.input} placeholder="ex : FONO" placeholderTextColor="#AAAAAA" value={nomRecherche} onChangeText={setNomRecherche} />
                    <Text style={styles.lbl}>Classe (optionnel, affine la recherche)</Text>
                    <TextInput style={styles.input} placeholder="ex : 3eme A" placeholderTextColor="#AAAAAA" value={classeRecherche} onChangeText={setClasseRecherche} />
                  </>
                )}

                <View style={styles.formBtns}>
                  <TouchableOpacity style={styles.btnAnnuler} onPress={resetFormulaire}>
                    <Text style={styles.btnAnnulerTxt}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btnEnvoyer, envoi && { opacity: 0.7 }]} onPress={handleAjouter} disabled={envoi}>
                    {envoi ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnEnvoyerTxt}>Rattacher</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}

        {apprenants.length === 0 ? (
          <Text style={styles.vide}>Aucun enfant rattaché pour le moment.</Text>
        ) : (
          apprenants.map((a) => {
            const s = styleStatut(a.statut);
            return (
              <TouchableOpacity
                key={a.id}
                style={styles.card}
                onPress={() => router.push({ pathname: '/screens/parent/EcheancierScreen', params: { apprenantId: String(a.id) } })}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nom}>{a.prenom} {a.nom}</Text>
                    {a.etablissement?.code_etablissement ? (
                      <TouchableOpacity onPress={() => router.push({ pathname: '/screens/commun/EtablissementPublicScreen', params: { code: a.etablissement!.code_etablissement! } })}>
                        <Text style={[styles.ecole, styles.ecoleLien]}>{a.etablissement?.nom || '—'}{a.classe ? ` · ${a.classe}` : ''}</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.ecole}>{a.etablissement?.nom || '—'}{a.classe ? ` · ${a.classe}` : ''}</Text>
                    )}
                  </View>
                  <View style={[styles.pill, { backgroundColor: s.bg }]}>
                    <Text style={[styles.pillTxt, { color: s.fg }]}>{s.label}</Text>
                  </View>
                </View>
                <View style={styles.cardBottom}>
                  <Text style={styles.solde}>Reste dû : <Text style={{ fontWeight: '700' }}>{(a.solde_du ?? 0).toLocaleString('fr-FR')} FCFA</Text></Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => handleTelechargerCertificat(a)} style={styles.trashBtn} disabled={certificatEnCoursId === a.id}>
                      {certificatEnCoursId === a.id ? <ActivityIndicator size="small" color="#0D9E75" /> : <Award size={16} color="#0D9E75" />}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSupprimer(a)} style={styles.trashBtn}>
                      <Trash2 size={16} color="#D94040" />
                    </TouchableOpacity>
                    <ChevronRight size={18} color="#AAAAAA" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <BottomNavParent actif="accueil" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  header: { backgroundColor: '#0B2545', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  addBtn: { backgroundColor: '#0D9E75', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, padding: 16 },
  vide: { fontSize: 13, color: '#888888', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  nom: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  ecole: { fontSize: 11, color: '#888888', marginTop: 2 },
  ecoleLien: { color: '#0D9E75', fontWeight: '600', textDecorationLine: 'underline' },
  pill: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  pillTxt: { fontSize: 10, fontWeight: '700' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  solde: { fontSize: 12, color: '#555555' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trashBtn: { padding: 4 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  formTitre: { fontSize: 14, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  formSousTitre: { fontSize: 11, color: '#888888', marginBottom: 4, lineHeight: 15 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F5F6F7', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  modeToggle: { alignSelf: 'flex-start', marginTop: 4, marginBottom: 4 },
  modeToggleTxt: { fontSize: 11, fontWeight: '700', color: '#0D9E75' },
  rechercheBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F5F6F7', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  rechercheInput: { flex: 1, fontSize: 13, color: '#1A1A2E' },
  listeEtabs: { marginTop: 6, maxHeight: 180 },
  etabItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  etabItemTxt: { fontSize: 12, color: '#333333', flexShrink: 1 },
  etabVide: { fontSize: 11, color: '#AAAAAA', textAlign: 'center', paddingVertical: 10 },
  etabChoisi: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E0F5EE', borderRadius: 10, padding: 12 },
  etabChoisiTxt: { flex: 1, fontSize: 12, fontWeight: '700', color: '#085041' },
  etabChoisiChanger: { fontSize: 11, fontWeight: '700', color: '#0D9E75', textDecorationLine: 'underline' },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnAnnuler: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  btnAnnulerTxt: { color: '#666666', fontSize: 12, fontWeight: '700' },
  btnEnvoyer: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#0D9E75' },
  btnEnvoyerTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
