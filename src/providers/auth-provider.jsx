import { createContext, useContext, useState, useEffect } from "react";
import { loginApi, signupApi, verifyEmailApi, logoutApi, getMyProfileApi } from "~/features/auth/services/auth-api";

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  verifyEmail: async () => {},
  logout: () => {},
  updateUser: () => {},
  refreshUser: async () => {}
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("wayvee_token") || null;
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("wayvee_user");
      if (!savedUser || savedUser === "undefined" || savedUser === "null") return null;
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const updateUser = (newUser) => {
    if (!newUser) {
      setUser(null);
      localStorage.removeItem("wayvee_user");
      return;
    }
    const merged = typeof newUser === "function" ? newUser(user) : { ...user, ...newUser };
    setUser(merged);
    localStorage.setItem("wayvee_user", JSON.stringify(merged));
  };

  const refreshUser = async () => {
    if (!token) return null;
    try {
      const res = await getMyProfileApi();
      const profileData = res?.data || res;
      if (profileData) {
        updateUser(profileData);
        return profileData;
      }
    } catch (err) {
      console.warn("Could not sync user profile from DB:", err);
    }
    return null;
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, [token]);

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
        logout,
        updateUser,
        refreshUser
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
