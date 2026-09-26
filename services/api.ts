import axios from 'axios';
import { router } from 'expo-router';
import { deleteItem, getItem, setItem } from './storage';

// Contrat confirmé par l'équipe backend (API REST v1, Laravel + Sanctum) le 30/08/2026.
// Basculer via .env (EXPO_PUBLIC_API_URL) — prod par défaut, local ex. http://10.0.2.2:8000/api/v1
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://edupay.mekontso.gsi2026.com/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Token automatique sur chaque requête
api.interceptors.request.use(async (config) => {
  const token = await getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirige vers l'écran hors-ligne uniquement quand la requête n'a reçu
// aucune réponse (pas de réseau) — pas pour les erreurs 4xx/5xx classiques,
// qui ont leur propre gestion dans chaque écran.
let redirectionHorsLigneEnCours = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response && !redirectionHorsLigneEnCours) {
      redirectionHorsLigneEnCours = true;
      router.push('/screens/commun/OfflineScreen');
      setTimeout(() => { redirectionHorsLigneEnCours = false; }, 3000);
    }
    return Promise.reject(error);
  }
);

// ── AUTH ──────────────────────────────────────────────────────
export const register = async (data: {
  profil: string;
  prenom: string;
  nom: string;
  telephone: string;
  ville: string;
  cgu_accepted: boolean;
  email?: string;
  quartier?: string;
  notif_sms?: boolean;
  notif_email?: boolean;
  password: string;
  password_confirmation: string;
}) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// `login` : email OU téléphone, champ unique. Pas d'étape OTP après inscription
// ou connexion côté API — /auth/register et /auth/login renvoient { token, user }.
export const login = async (login: string, password: string) => {
  const response = await api.post('/auth/login', { login, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  await deleteItem('token');
  await deleteItem('user');
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (data: {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
}) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

// Connexion par code (email uniquement — 422 si le compte n'a pas d'email renseigné).
export const envoyerOtp = async (login: string) => {
  const response = await api.post('/auth/otp', { login });
  return response.data;
};

export const verifierOtp = async (login: string, otp_code: string) => {
  const response = await api.post('/auth/otp/verify', { login, otp_code });
  return response.data;
};

// Inscription établissement — endpoint unique multipart (fichiers inclus), pas de
// token en retour : le compte directeur est créé mais l'établissement reste
// 'en_attente' jusqu'à validation manuelle par l'équipe EduPay.
export const inscrireEtablissement = async (data: {
  nom: string; type: string; statut_juridique: string; numero_agrement: string;
  nb_eleves?: string; region: string; ville: string; quartier?: string; boite_postale?: string;
  telephone: string; email: string; site_web?: string;
  mobile_money_principal: 'mtn' | 'orange'; numero_momo_reversement: string;
  resp_prenom: string; resp_nom: string; resp_telephone: string; resp_email: string;
  resp_password: string; resp_password_confirmation: string;
  document_agrement: { uri: string; name: string; mimeType?: string };
  logo?: { uri: string; name: string; mimeType?: string };
  description?: string;
  cgu_accepted: boolean; certification_accepted: boolean;
}) => {
  const formData = new FormData();
  const { document_agrement, logo, ...champs } = data;
  Object.entries(champs).forEach(([cle, valeur]) => {
    if (valeur !== undefined && valeur !== null) formData.append(cle, String(valeur));
  });
  formData.append('document_agrement', { uri: document_agrement.uri, name: document_agrement.name, type: document_agrement.mimeType || 'application/pdf' } as any);
  if (logo) formData.append('logo', { uri: logo.uri, name: logo.name, type: logo.mimeType || 'image/png' } as any);

  const response = await api.post('/auth/inscription-etablissement', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Dashboard payeur consolidé (apprenants + soldes + derniers paiements +
// notifications + liste des établissements actifs) — évite de composer
// manuellement à partir de /apprenants + /paiements.
export const getDashboard = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

// ── PROFIL ────────────────────────────────────────────────────
export const getMe = async () => {
  const response = await api.get('/me');
  return response.data;
};

export const getProfil = async () => {
  const response = await api.get('/profil');
  return response.data;
};

export const updateProfil = async (data: {
  prenom?: string; nom?: string; ville?: string; quartier?: string; email?: string;
  notif_sms?: boolean; notif_email?: boolean; notif_rappel_echeance?: boolean;
}) => {
  const response = await api.put('/profil', data);
  return response.data;
};

export const updateProfilNotifications = async (data: { notif_sms?: boolean; notif_email?: boolean; notif_rappel_echeance?: boolean }) => {
  const response = await api.put('/profil/notifications', data);
  return response.data;
};

export const updateProfilPassword = async (data: { current_password: string; password: string; password_confirmation: string }) => {
  const response = await api.put('/profil/password', data);
  return response.data;
};

// ── APPRENANTS ────────────────────────────────────────────────
export const getApprenants = async () => {
  const response = await api.get('/apprenants');
  return response.data;
};

// Rattachement par code établissement + matricule (fournis par l'école au parent)
export const rattacherApprenant = async (data: {
  code_etablissement: string;
  matricule: string;
}) => {
  const response = await api.post('/apprenants/rattacher', data);
  return response.data;
};

export const removeApprenant = async (id: number) => {
  const response = await api.delete(`/apprenants/${id}`);
  return response.data;
};

// Annuaire des établissements actifs, pour la recherche lors du rattachement d'un enfant.
export const getEtablissementsPourRattachement = async () => {
  const response = await api.get('/apprenants/etablissements');
  return response.data;
};

// ── FRAIS & PAIEMENTS ─────────────────────────────────────────
export const getFraisApprenant = async (apprenant_id: number) => {
  const response = await api.get(`/frais/${apprenant_id}`);
  return response.data;
};

export const getHistorique = async (page: number = 1) => {
  const response = await api.get(`/paiements?page=${page}`);
  return response.data;
};

export const initierPaiement = async (data: {
  frais_apprenant_id: number;
  montant: number;
  mode: 'mtn_momo' | 'orange_money' | 'carte';
  telephone?: string;
}) => {
  const response = await api.post('/paiements/initier', data);
  return response.data;
};

// Polling statut : en_attente → valide / echoue
export const verifierPaiement = async (paiement_id: number) => {
  const response = await api.post(`/paiements/${paiement_id}/verifier`);
  return response.data;
};

// Annule un paiement en attente pour permettre un nouvel essai — ne touche pas
// au statut réel si l'opérateur confirme finalement en retard (annule_manuellement).
export const annulerPaiement = async (paiement_id: number) => {
  const response = await api.post(`/paiements/${paiement_id}/annuler`);
  return response.data;
};

// ── RECLAMATIONS ──────────────────────────────────────────────
export const getReclamations = async () => {
  const response = await api.get('/reclamations');
  return response.data;
};

export const creerReclamation = async (data: {
  sujet: string;
  description: string;
  paiement_id?: number;
}) => {
  const response = await api.post('/reclamations', data);
  return response.data;
};

export const getDetailReclamation = async (id: number) => {
  const response = await api.get(`/reclamations/${id}`);
  return response.data;
};

// ── NOTIFICATIONS ─────────────────────────────────────────────
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const marquerNotificationsLues = async (ids?: number[]) => {
  const response = await api.post('/notifications/lire', ids?.length ? { ids } : {});
  return response.data;
};

export const marquerNotificationLue = async (id: number) => {
  const response = await api.post(`/notifications/${id}/lue`);
  return response.data;
};

// ── PUBLIC (sans token) ───────────────────────────────────────
export const getStatsPubliques = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const getEtablissementPublic = async (code: string) => {
  const response = await api.get(`/etablissements/${code}`);
  return response.data;
};

export const envoyerContact = async (data: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) => {
  const response = await api.post('/contact', data);
  return response.data;
};

// Recherche publique — endpoint non confirmé par le backend, gardé en fallback.
export const searchEtablissements = async (q: string, type?: string) => {
  const params = type ? `?q=${q}&type=${type}` : `?q=${q}`;
  const response = await api.get(`/etablissements/search${params}`);
  return response.data;
};

// ── BACK-OFFICE ECOLE ─────────────────────────────────────────
// Annoncé par le backend le 01/09/2026 : socle complet sous /etablissement,
// même token Bearer que le payeur (rôle directeur|comptable|caissier).
export const getDashboardEcole = async () => {
  const response = await api.get('/etablissement/dashboard');
  return response.data;
};

export const getApprenantsEcole = async (filtres?: { q?: string; classe?: string; statut_paiement?: string; page?: number }) => {
  const params = new URLSearchParams();
  if (filtres?.q) params.set('q', filtres.q);
  if (filtres?.classe) params.set('classe', filtres.classe);
  if (filtres?.statut_paiement) params.set('statut_paiement', filtres.statut_paiement);
  params.set('page', String(filtres?.page || 1));
  const response = await api.get(`/etablissement/apprenants?${params.toString()}`);
  return response.data;
};

export const getImpayes = async () => {
  const response = await api.get('/etablissement/impayes');
  return response.data;
};

export const relancerImpayesGroupe = async (data: { filtre?: any; message?: string }) => {
  const response = await api.post('/etablissement/impayes/relancer', data);
  return response.data;
};

export const relancerImpayeApprenant = async (apprenantId: number) => {
  const response = await api.post(`/etablissement/impayes/apprenants/${apprenantId}/relancer`);
  return response.data;
};

export const getRapports = async () => {
  const response = await api.get('/etablissement/rapports');
  return response.data;
};

export const getUrlExportRapportPdf = () => '/etablissement/rapports/export/pdf';
export const getUrlExportRapportExcel = () => '/etablissement/rapports/export/excel';

// ── ECOLE : APPRENANTS ──────────────────────────────────────────
export const creerApprenantEcole = async (data: {
  prenom: string;
  nom: string;
  matricule: string;
  classe: string;
}) => {
  const response = await api.post('/etablissement/apprenants', data);
  return response.data;
};

export const updateApprenantEcole = async (id: number, data: { prenom?: string; nom?: string; matricule?: string; classe?: string }) => {
  const response = await api.put(`/etablissement/apprenants/${id}`, data);
  return response.data;
};

export const removeApprenantEcole = async (id: number) => {
  const response = await api.delete(`/etablissement/apprenants/${id}`);
  return response.data;
};

// Fiche détaillée : apprenant + parents rattachés + frais/échéanciers.
export const getApprenantEcole = async (id: number) => {
  const response = await api.get(`/etablissement/apprenants/${id}`);
  return response.data;
};

export const desaffecterFraisApprenant = async (apprenantId: number, fraisApprenantId: number) => {
  const response = await api.delete(`/etablissement/apprenants/${apprenantId}/frais/${fraisApprenantId}`);
  return response.data;
};

export const bulkDestroyApprenantsEcole = async (ids: number[]) => {
  const response = await api.post('/etablissement/apprenants/bulk-destroy', { ids });
  return response.data;
};

export const validerApprenant = async (id: number) => {
  const response = await api.post(`/etablissement/apprenants/${id}/valider`);
  return response.data;
};

export const rejeterApprenant = async (id: number) => {
  const response = await api.post(`/etablissement/apprenants/${id}/rejeter`);
  return response.data;
};

// Import en masse via un fichier CSV (uri local choisi par expo-document-picker).
// Colonnes attendues (sans en-tête personnalisable) : nom, prenom, classe,
// matricule (optionnel), date_naissance AAAA-MM-JJ (optionnel), sexe M/F (optionnel).
export const importerApprenantsCsv = async (fichier: { uri: string; name: string; mimeType?: string }) => {
  const formData = new FormData();
  formData.append('fichier_csv', {
    uri: fichier.uri,
    name: fichier.name,
    type: fichier.mimeType || 'text/csv',
  } as any);
  const response = await api.post('/etablissement/apprenants/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getUrlModeleImportCsv = () => '/etablissement/apprenants/import/model';

// ── ECOLE : FRAIS & ECHEANCIERS ──────────────────────────────────
export const getFraisEcole = async () => {
  const response = await api.get('/etablissement/frais');
  return response.data;
};

export const creerFraisEcole = async (data: {
  nom: string;
  montant_total: number;
  fractionnable?: boolean;
  nb_tranches_max?: number;
}) => {
  const response = await api.post('/etablissement/frais', data);
  return response.data;
};

export const updateFraisEcole = async (id: number, data: { nom?: string; montant_total?: number; fractionnable?: boolean; nb_tranches_max?: number }) => {
  const response = await api.put(`/etablissement/frais/${id}`, data);
  return response.data;
};

export const removeFraisEcole = async (id: number) => {
  const response = await api.delete(`/etablissement/frais/${id}`);
  return response.data;
};

export const affecterFraisClasse = async (id: number, classe: string) => {
  const response = await api.post(`/etablissement/frais/${id}/affecter`, { classe });
  return response.data;
};

export const ajouterEcheancier = async (fraisId: number, data: { libelle: string; montant: number; date_echeance?: string }) => {
  const response = await api.post(`/etablissement/frais/${fraisId}/echeanciers`, data);
  return response.data;
};

export const supprimerEcheancier = async (fraisId: number, echeancierId: number) => {
  const response = await api.delete(`/etablissement/frais/${fraisId}/echeanciers/${echeancierId}`);
  return response.data;
};

export const getPaiementsEcole = async (page: number = 1, filtres?: { q?: string; statut?: string }) => {
  const params = new URLSearchParams({ page: String(page) });
  if (filtres?.q) params.set('q', filtres.q);
  if (filtres?.statut) params.set('statut', filtres.statut);
  const response = await api.get(`/etablissement/paiements?${params.toString()}`);
  return response.data;
};

// ── ECOLE : UTILISATEURS INTERNES (réservé directeur) ────────────
export const getUtilisateursEcole = async () => {
  const response = await api.get('/etablissement/utilisateurs');
  return response.data;
};

export const inviterUtilisateurEcole = async (data: { prenom: string; nom: string; email: string; role: 'comptable' | 'caissier' }) => {
  const response = await api.post('/etablissement/utilisateurs', data);
  return response.data;
};

export const changerRoleUtilisateur = async (id: number, role: 'comptable' | 'caissier') => {
  const response = await api.put(`/etablissement/utilisateurs/${id}/role`, { role });
  return response.data;
};

export const supprimerUtilisateurEcole = async (id: number) => {
  const response = await api.delete(`/etablissement/utilisateurs/${id}`);
  return response.data;
};

// ── ECOLE : REMBOURSEMENTS ───────────────────────────────────────
export const getRemboursements = async () => {
  const response = await api.get('/etablissement/remboursements');
  return response.data;
};

export const demanderRemboursement = async (data: { paiement_id: number; motif: string; montant?: number }) => {
  const response = await api.post('/etablissement/remboursements', data);
  return response.data;
};

export const approuverRemboursement = async (id: number) => {
  const response = await api.post(`/etablissement/remboursements/${id}/approuver`);
  return response.data;
};

export const refuserRemboursement = async (id: number, motif?: string) => {
  const response = await api.post(`/etablissement/remboursements/${id}/refuser`, { motif });
  return response.data;
};

// ── ECOLE : PROFIL COMPTE, ABONNEMENT ────────────────────────────
export const getProfilEcole = async () => {
  const response = await api.get('/etablissement/profil');
  return response.data;
};

export const updateProfilEcole = async (data: { prenom: string; nom: string; telephone: string; email?: string; ville?: string }) => {
  const response = await api.put('/etablissement/profil', data);
  return response.data;
};

export const updateProfilPasswordEcole = async (data: { current_password: string; password: string; password_confirmation: string }) => {
  const response = await api.put('/etablissement/profil/password', data);
  return response.data;
};

export const getAbonnement = async () => {
  const response = await api.get('/etablissement/abonnement');
  return response.data;
};

// ── ECOLE : PARAMÈTRES ÉTABLISSEMENT ─────────────────────────────
export const getParametresEcole = async () => {
  const response = await api.get('/etablissement/parametres');
  return response.data;
};

export const updateParametresEcole = async (data: {
  nom: string; type: string; statut_juridique?: string; numero_agrement?: string;
  nb_eleves?: string; region?: string; ville: string; quartier?: string; boite_postale?: string;
  telephone: string; email: string; site_web?: string; description?: string;
  mobile_money_principal: 'mtn' | 'orange' | 'les_deux'; numero_momo_reversement?: string;
  operateur_momo_reversement?: 'mtn' | 'orange'; annee_scolaire_active?: string;
  logo?: { uri: string; name: string; mimeType?: string };
  document_agrement?: { uri: string; name: string; mimeType?: string };
}) => {
  const formData = new FormData();
  const { logo, document_agrement, ...champs } = data;
  Object.entries(champs).forEach(([cle, valeur]) => {
    if (valeur !== undefined && valeur !== null) formData.append(cle, String(valeur));
  });
  if (logo) formData.append('logo', { uri: logo.uri, name: logo.name, type: logo.mimeType || 'image/png' } as any);
  if (document_agrement) {
    formData.append('document_agrement', { uri: document_agrement.uri, name: document_agrement.name, type: document_agrement.mimeType || 'application/pdf' } as any);
  }
  // PUT + multipart n'est pas fiable côté PHP : on passe par le spoofing Laravel standard (_method).
  formData.append('_method', 'PUT');

  const response = await api.post('/etablissement/parametres', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ── ECOLE : MULTI-SITES (plans Standard/Premium) ─────────────────
export const getSites = async () => {
  const response = await api.get('/etablissement/sites');
  return response.data;
};

export const creerSite = async (data: { nom: string; ville: string; adresse?: string; telephone?: string }) => {
  const response = await api.post('/etablissement/sites', data);
  return response.data;
};

export const updateSite = async (id: number, data: { nom?: string; ville?: string; adresse?: string; telephone?: string }) => {
  const response = await api.put(`/etablissement/sites/${id}`, data);
  return response.data;
};

export const supprimerSite = async (id: number) => {
  const response = await api.delete(`/etablissement/sites/${id}`);
  return response.data;
};

// ── TOKEN ─────────────────────────────────────────────────────
export const saveToken = async (token: string) => {
  await setItem('token', token);
};

export const getToken = async () => {
  return await getItem('token');
};

export const removeToken = async () => {
  await deleteItem('token');
};

export default api;
