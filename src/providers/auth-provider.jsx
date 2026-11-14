import { createContext, useContext, useState, useEffect } from "react";
import { loginApi, signupApi, verifyEmailApi, logoutApi, getMyProfileApi } from "~/features/auth/services/auth-api";
import { signInWithGoogle, signOutFirebase, onFirebaseAuthStateChanged, formatFirebaseUser } from "~/features/auth/services/firebase-auth";

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => {},
  loginWithGoogle: async () => {},
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
    // Bỏ qua gọi backend /me nếu phiên đăng nhập hiện tại là tài khoản Google
    // (tránh 401 unauthenticated do backend kiểm tra HMAC token riêng)
    if (user?.authProvider === "google" || user?.isGoogleUser) {
      return user;
    }
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

  // Đồng bộ phiên đăng nhập Firebase Auth
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged(async (fbUser) => {
      if (fbUser) {
        const isCurrentGoogleUser = user?.authProvider === "google" || user?.isGoogleUser;
        if (isCurrentGoogleUser || !user) {
          try {
            const freshToken = await fbUser.getIdToken();
            const formatted = formatFirebaseUser(fbUser);
            setToken(freshToken);
            setUser((prev) => ({ ...(prev || {}), ...formatted }));
            localStorage.setItem("wayvee_token", freshToken);
            localStorage.setItem("wayvee_user", JSON.stringify(formatted));
          } catch (e) {
            console.warn("Could not sync Firebase token:", e);
          }
        }
      }
    });
    return () => unsubscribe();
  }, [user?.authProvider, user?.isGoogleUser]);

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

  const loginWithGoogle = async () => {
    const { user: googleUser, token: googleToken } = await signInWithGoogle();
    if (googleToken) {
      setToken(googleToken);
      localStorage.setItem("wayvee_token", googleToken);
    }
    if (googleUser) {
      setUser(googleUser);
      localStorage.setItem("wayvee_user", JSON.stringify(googleUser));
    }
    return googleUser;
  };

  const signup = async ({ email, password, fullName, phone }) => {
    return await signupApi({ email, password, fullName, phone });
  };

  const verifyEmail = async ({ email, otp }) => {
    return await verifyEmailApi({ email, otp });
  };

  const logout = () => {
    if (token) {
      if (user?.authProvider !== "google" && !user?.isGoogleUser) {
        logoutApi(token).catch(() => {});
      }
    }
    signOutFirebase().catch(() => {});
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
        loginWithGoogle,
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
