import axios from 'axios';
import { router } from 'expo-router';
import { deleteItem, getItem, setItem } from './storage';

// Contrat confirmé par l'équipe backend (API REST v1, Laravel + Sanctum) le 30/08/2026.
const API_URL = 'https://edupay.mekontso.gsi2026.com/api/v1';

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

// ── PROFIL ────────────────────────────────────────────────────
export const getMe = async () => {
  const response = await api.get('/me');
  return response.data;
};

export const getProfil = async () => {
  const response = await api.get('/profil');
  return response.data;
};

export const updateProfil = async (data: any) => {
  const response = await api.put('/profil', data);
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

export const marquerNotificationsLues = async () => {
  const response = await api.post('/notifications/lire');
  return response.data;
};

// ── ETABLISSEMENTS (recherche publique — endpoint non confirmé par le backend) ─
export const searchEtablissements = async (q: string, type?: string) => {
  const params = type ? `?q=${q}&type=${type}` : `?q=${q}`;
  const response = await api.get(`/etablissements/search${params}`);
  return response.data;
};

// ── BACK-OFFICE ECOLE (pas encore annoncé par le backend — routes provisoires) ─
export const getDashboardEcole = async () => {
  const response = await api.get('/etablissement/dashboard');
  return response.data;
};

export const getApprenantsEcole = async (params?: string) => {
  const response = await api.get(`/etablissement/apprenants${params || ''}`);
  return response.data;
};

export const getImpayes = async () => {
  const response = await api.get('/etablissement/impayes');
  return response.data;
};

export const envoyerRelanceGroupee = async (data: {
  filtre: any;
  message: string;
}) => {
  const response = await api.post('/etablissement/impayes/relance-groupee', data);
  return response.data;
};

export const getRapports = async (params: string) => {
  const response = await api.get(`/etablissement/rapports?${params}`);
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
