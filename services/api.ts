import axios from 'axios';
import { deleteItem, getItem, setItem } from './storage';

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

// `login` : téléphone ou email, champ unique — cf. auth/login.blade.php (name="login") sur main
export const login = async (login: string, password: string) => {
  const response = await api.post('/auth/login', { login, password });
  return response.data;
};

export const verifyOtp = async (login: string, otp_code: string) => {
  const response = await api.post('/auth/verify-otp', { login, otp_code });
  return response.data;
};

export const resendOtp = async (login: string) => {
  const response = await api.post('/auth/resend-otp', { login });
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

// ── DASHBOARD PAYEUR ──────────────────────────────────────────
export const getDashboard = async () => {
  const response = await api.get('/payeur/dashboard');
  return response.data;
};

export const getFraisApprenant = async (apprenant_id: number) => {
  const response = await api.get(`/payeur/frais/${apprenant_id}`);
  return response.data;
};

// ── APPRENANTS ────────────────────────────────────────────────
export const getApprenants = async () => {
  const response = await api.get('/payeur/dashboard');
  return response.data;
};

export const addApprenant = async (data: {
  etablissement_id: number;
  prenom: string;
  nom: string;
  matricule: string;
  classe: string;
  code_etablissement: string;
}) => {
  const response = await api.post('/payeur/apprenants', data);
  return response.data;
};

export const removeApprenant = async (id: number) => {
  const response = await api.delete(`/payeur/apprenants/${id}`);
  return response.data;
};

// ── PAIEMENTS ─────────────────────────────────────────────────
// payeur/paiement.blade.php sur main : un seul dossier de frais par (apprenant,
// catégorie) — pas de tranche/échéancier séparés, `type_paiement` détermine le
// montant calculé côté serveur (intégral vs tranche suivante).
export const initierPaiement = async (data: {
  frais_apprenant_id: number;
  mode_paiement: string;
  type_paiement: string;
  montant: number;
  telephone_paiement?: string;
}) => {
  const response = await api.post('/payeur/paiement/initier', data);
  return response.data;
};

export const getStatutPaiement = async (paiement_id: number) => {
  const response = await api.get(`/payeur/paiement/${paiement_id}/statut`);
  return response.data;
};

export const getHistorique = async (page: number = 1) => {
  const response = await api.get(`/payeur/historique?page=${page}`);
  return response.data;
};

export const getRecu = async (paiement_id: number) => {
  const response = await api.get(`/payeur/recu/${paiement_id}`, {
    responseType: 'blob'
  });
  return response.data;
};

// ── RECLAMATIONS ──────────────────────────────────────────────
export const getReclamations = async () => {
  const response = await api.get('/payeur/reclamations');
  return response.data;
};

// payeur/reclamations.blade.php sur main : sujet libre, paiement lié optionnel
// (pas de champ "type" à choix fixe)
export const creerReclamation = async (data: {
  sujet: string;
  description: string;
  paiement_id?: number;
}) => {
  const response = await api.post('/payeur/reclamations', data);
  return response.data;
};

export const getDetailReclamation = async (id: number) => {
  const response = await api.get(`/payeur/reclamations/${id}`);
  return response.data;
};

// ── PROFIL ────────────────────────────────────────────────────
export const getProfil = async () => {
  const response = await api.get('/payeur/profil');
  return response.data;
};

export const updateProfil = async (data: any) => {
  const response = await api.put('/payeur/profil', data);
  return response.data;
};

// ── ETABLISSEMENTS (recherche publique) ───────────────────────
export const searchEtablissements = async (q: string, type?: string) => {
  const params = type ? `?q=${q}&type=${type}` : `?q=${q}`;
  const response = await api.get(`/etablissements/search${params}`);
  return response.data;
};

// ── BACK-OFFICE ECOLE ─────────────────────────────────────────
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
