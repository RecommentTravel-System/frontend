import { createContext, useContext, useState, useEffect } from "react";
import { loginApi, signupApi, verifyEmailApi, logoutApi } from "~/features/auth/services/auth-api";

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  verifyEmail: async () => {},
  logout: () => {}
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("wayvee_token"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("wayvee_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem("wayvee_token");
      localStorage.removeItem("wayvee_user");
    };

    window.addEventListener("wayvee:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("wayvee:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async ({ email, password }) => {
    const response = await loginApi({ email, password });
    if (response.data) {
      const { accessToken, userResponse } = response.data;
      if (accessToken) {
        setToken(accessToken);
        localStorage.setItem("wayvee_token", accessToken);
      }
      if (userResponse) {
        setUser(userResponse);
        localStorage.setItem("wayvee_user", JSON.stringify(userResponse));
      }
    }
    return response;
  };

  const signup = async ({ email, password, fullName, phone }) => {
    return await signupApi({ email, password, fullName, phone });
  };

  const verifyEmail = async ({ email, otp }) => {
    return await verifyEmailApi({ email, otp });
  };

  const logout = () => {
    if (token) {
      logoutApi(token).catch(() => {});
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("wayvee_token");
    localStorage.removeItem("wayvee_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        signup,
        verifyEmail,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
