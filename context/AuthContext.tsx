import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { getToken, logout, removeToken, saveToken } from '../services/api';
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

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  return ctx;
}
