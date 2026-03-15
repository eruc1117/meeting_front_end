import React, { createContext, useState, useEffect } from "react";



export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    if (token && userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        setIsLoggedIn(true);
        setUser(parsed);
      } catch {
        // 資料損毀，清除並要求重新登入
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsInitialized(true);
  }, []);

  const login = (token, userInfo) => {
    // 只儲存最小必要資訊，避免敏感個資洩露
    const minimalUser = { id: userInfo.id, username: userInfo.username };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(minimalUser));
    setIsLoggedIn(true);
    setUser(minimalUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isInitialized, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
