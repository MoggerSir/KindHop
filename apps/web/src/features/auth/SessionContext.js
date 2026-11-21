import { createContext, useContext } from 'react';

export const SessionContext = createContext(null);

// { status: 'loading' | 'authenticated' | 'anonymous' | 'error', user, config, refresh, signOut }
export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession debe usarse dentro de <SessionProvider>');
  return value;
}
