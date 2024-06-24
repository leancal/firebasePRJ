import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para acceder al contexto de autenticación
export function useAuth() {
  return useContext(AuthContext);
}

// Proveedor de autenticación que envuelve tu aplicación
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Exporta un componente React que utiliza el proveedor
export function AuthContextProvider({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
