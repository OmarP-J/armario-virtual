import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

// Cuenta local, guardada solo en este dispositivo. No hay backend detrás: es
// una autenticación de mentira que sirve para tener una pantalla de login y
// registro reales y funcionales mientras el proyecto no tiene servidor propio.
// Por eso la contraseña se guarda tal cual en AsyncStorage (nunca viaja por
// red) — si algún día se agrega un backend real, esto debería reemplazarse
// por autenticación de verdad con contraseñas con hash del lado del servidor.
export type Account = { name: string; email: string; password: string };
type Session = { name: string; email: string };

type AuthContextValue = {
  ready: boolean;
  session: Session | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const ACCOUNTS_KEY = '@armario-virtual/accounts';
const SESSION_KEY = '@armario-virtual/session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const accountsRef = useRef<Account[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [accountsRaw, sessionRaw] = await Promise.all([
          AsyncStorage.getItem(ACCOUNTS_KEY),
          AsyncStorage.getItem(SESSION_KEY),
        ]);
        const accounts: Account[] = accountsRaw ? JSON.parse(accountsRaw) : [];
        accountsRef.current = Array.isArray(accounts) ? accounts : [];
        if (sessionRaw) {
          const savedEmail = JSON.parse(sessionRaw) as string;
          const account = accountsRef.current.find(a => a.email === savedEmail);
          if (account) setSession({ name: account.name, email: account.email });
        }
      } catch {
        // Si algo quedó corrupto, arrancamos sin sesión en vez de romper la app.
        accountsRef.current = [];
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const register = async (name: string, email: string, password: string) => {
    const cleanName = name.trim();
    const cleanEmail = normalizeEmail(email);
    if (!cleanName) throw new Error('Escribe tu nombre.');
    if (!isValidEmail(cleanEmail)) throw new Error('Escribe un correo válido.');
    if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');
    if (accountsRef.current.some(a => a.email === cleanEmail)) {
      throw new Error('Ya existe una cuenta con ese correo en este dispositivo.');
    }
    const next = [...accountsRef.current, { name: cleanName, email: cleanEmail, password }];
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
    accountsRef.current = next;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(cleanEmail));
    setSession({ name: cleanName, email: cleanEmail });
  };

  const login = async (email: string, password: string) => {
    const cleanEmail = normalizeEmail(email);
    const account = accountsRef.current.find(a => a.email === cleanEmail && a.password === password);
    if (!account) throw new Error('Correo o contraseña incorrectos.');
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(cleanEmail));
    setSession({ name: account.name, email: account.email });
  };

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ ready, session, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
