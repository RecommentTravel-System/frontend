import { createContext, useContext, useState, useEffect } from "react";
import { loginApi, signupApi, verifyEmailApi, logoutApi, getMyProfileApi, googleLoginApi } from "~/features/auth/services/auth-api";
import { signInWithGoogle, signOutFirebase, onFirebaseAuthStateChanged, isFirebaseToken } from "~/features/auth/services/firebase-auth";

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
      const savedToken = localStorage.getItem("wayvee_token") || null;
      // Tự động phát hiện và xóa token Firebase cũ (nếu có trong localStorage)
      // Backend Wayvee chỉ xác thực HMAC HS256 token được cấp bởi server
      if (savedToken && isFirebaseToken(savedToken)) {
        localStorage.removeItem("wayvee_token");
        localStorage.removeItem("wayvee_user");
        return null;
      }
      return savedToken;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedToken = localStorage.getItem("wayvee_token");
      if (!savedToken || isFirebaseToken(savedToken)) return null;
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
        updateUser((prev) => ({
          ...(prev || {}),
          ...profileData,
          id: profileData.userId ? `WV-${String(profileData.userId).padStart(5, "0")}` : (prev?.id || `WV-00000`),
          authProvider: profileData.authProvider || prev?.authProvider || "LOCAL",
          isGoogleUser: profileData.authProvider === "GOOGLE" || prev?.isGoogleUser || false
        }));
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
        const existingToken = localStorage.getItem("wayvee_token");
        // Nếu đã có token backend Wayvee hợp lệ (không phải Firebase token), giữ nguyên token backend
        if (existingToken && !isFirebaseToken(existingToken)) {
          return;
        }

        // Nếu chưa có token backend hoặc token cũ là Firebase token,
        // tiến hành trao đổi Firebase ID token lấy JWT token backend Wayvee
        try {
          const firebaseIdToken = await fbUser.getIdToken();
          const beResponse = await googleLoginApi({
            email: fbUser.email,
            fullName: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
            avatarUrl: fbUser.photoURL || null,
            googleId: fbUser.uid,
            idToken: firebaseIdToken
          });

          const responseData = beResponse?.data || beResponse;
          const userResponse = responseData?.userResponse;
          const accessToken = responseData?.accessToken;

          if (userResponse && accessToken) {
            const backendUser = {
              ...userResponse,
              id: `WV-${String(userResponse.userId).padStart(5, "0")}`,
              authProvider: userResponse.authProvider || "GOOGLE",
              isGoogleUser: true
            };
            setToken(accessToken);
            setUser(backendUser);
            localStorage.setItem("wayvee_token", accessToken);
            localStorage.setItem("wayvee_user", JSON.stringify(backendUser));
          }
        } catch (e) {
          console.warn("Could not exchange Firebase token with backend:", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

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
        const backendUser = {
          ...userResponse,
          id: `WV-${String(userResponse.userId).padStart(5, "0")}`,
          authProvider: userResponse.authProvider || "LOCAL"
        };
        setUser(backendUser);
        localStorage.setItem("wayvee_user", JSON.stringify(backendUser));
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
      logoutApi(token).catch(() => {});
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
