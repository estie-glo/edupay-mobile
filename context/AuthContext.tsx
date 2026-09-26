import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { getMe, getToken, logout, removeToken, saveToken } from '../services/api';
import { deleteItem, getItem, setItem } from '../services/storage';

export type AuthUser = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  profil: string;
  [key: string]: any;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string, user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await getToken();
        const storedUser = await getItem('user');
        if (storedToken) setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch {
        // Session non restaurable (stockage indisponible, JSON corrompu...) : on repart déconnecté
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = async (newToken: string, newUser: AuthUser) => {
    await saveToken(newToken);
    await setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const signOut = async () => {
    try {
      await logout();
    } catch {
      // La déconnexion locale doit réussir même si l'appel réseau échoue
    } finally {
      await removeToken();
      await deleteItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const reponse = await getMe();
      const donnees = reponse.data ?? reponse;
      setUser((precedent) => ({ ...precedent, ...donnees }));
      await setItem('user', JSON.stringify({ ...user, ...donnees }));
    } catch {
      // Rafraîchissement silencieux : une panne réseau ne doit pas déconnecter l'utilisateur
    }
  };

  useEffect(() => {
    if (!token) return;
    const abonnement = AppState.addEventListener('change', (etat) => {
      if (etat === 'active') refreshUser();
    });
    return () => abonnement.remove();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  return ctx;
}
