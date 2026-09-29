import { useState } from 'react';
import { clearSession, loginAccount, readSession, startDemoSession } from './authService.js';
import { AuthContext } from './useAuth.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);
  async function login(values) {
    setUser(await loginAccount(values));
  }
  function loginDemo() {
    setUser(startDemoSession());
  }
  function logout() {
    try { clearSession(); } finally { setUser(null); }
  }
  return <AuthContext.Provider value={{ user, login, loginDemo, logout }}>{children}</AuthContext.Provider>;
}
