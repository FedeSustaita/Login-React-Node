import { createContext, useEffect, useState } from "react";

// Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [listadoId, setListadoId] = useState(null);

  // 🔄 Restaurar sesión
  useEffect(() => {
    const savedLogin = localStorage.getItem("isLoggedIn");
    const savedListado = localStorage.getItem("listadoId");

    if (savedLogin === "true" && savedListado) {
      setIsLoggedIn(true);
      setListadoId(Number(savedListado));
    }
  }, []);

  // 🔐 Login
  const login = (idListado) => {
    setIsLoggedIn(true);
    setListadoId(idListado);

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("listadoId", idListado);
  };

  // 🚪 Logout
  const logout = () => {
    setIsLoggedIn(false);
    setListadoId(null);

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("listadoId");
    localStorage.removeItem("historial"); // opcional
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        listadoId,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
