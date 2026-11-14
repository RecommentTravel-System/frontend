import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../../../shared/lib/firebase.js";
import { googleLoginApi } from "./auth-api.js";

/**
 * Friendly error messages for Firebase Authentication
 */
export function getFirebaseErrorMessage(error) {
  if (!error) return "Đăng nhập Google thất bại. Vui lòng thử lại.";

  const code = error.code || "";
  switch (code) {
    case "auth/popup-closed-by-user":
      return "Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.";
    case "auth/cancelled-popup-request":
      return "Yêu cầu đăng nhập trước đó đã được thay thế hoặc bị hủy.";
    case "auth/popup-blocked":
      return "Trình duyệt đã chặn cửa sổ pop-up. Vui lòng cho phép popup đối với trang này và thử lại.";
    case "auth/unauthorized-domain":
      return "Tên miền hiện tại (localhost) chưa được cấp phép trong Firebase Console (Authentication > Settings > Authorized domains).";
    case "auth/operation-not-allowed":
      return "Phương thức đăng nhập Google chưa được kích hoạt trong Firebase Console (Authentication > Sign-in method > Google).";
    case "auth/invalid-api-key":
      return "Firebase API Key không hợp lệ. Vui lòng kiểm tra lại cấu hình VITE_FIREBASE_API_KEY trong file .env.";
    case "auth/network-request-failed":
      return "Lỗi kết nối mạng khi liên lạc với Google. Vui lòng kiểm tra kết nối internet.";
    case "auth/user-disabled":
      return "Tài khoản Google này đã bị vô hiệu hóa.";
    case "auth/account-exists-with-different-credential":
      return "Email này đã được sử dụng với phương thức đăng nhập khác.";
    default:
      return error.message || "Đăng nhập Google không thành công. Vui lòng thử lại.";
  }
}

/**
 * Formats a Firebase user object to the Wayvee user profile contract.
 */
export function formatFirebaseUser(fbUser) {
  if (!fbUser) return null;

  const displayName = fbUser.displayName || fbUser.email?.split("@")[0] || "User";
  const nameParts = displayName.trim().split(/\s+/);
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : displayName;
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  return {
    id: fbUser.uid,
    userId: fbUser.uid,
    uid: fbUser.uid,
    email: fbUser.email || "",
    fullName: displayName,
    firstName,
    lastName,
    avatarUrl: fbUser.photoURL || null,
    avatar: fbUser.photoURL || null,
    photoURL: fbUser.photoURL || null,
    role: "USER",
    roles: ["USER"],
    authProvider: "google",
    isGoogleUser: true,
    emailVerified: fbUser.emailVerified || false
  };
}

/**
 * Triggers Google Sign-In with popup.
 * Guarantees Google Account Chooser is shown.
 */
export async function signInWithGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error(
      "Firebase chưa được cấu hình. Vui lòng cung cấp các biến môi trường VITE_FIREBASE_* trong file .env (xem file .env.example để biết các biến cần thiết)."
    );
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const firebaseIdToken = await fbUser.getIdToken();
    const fallbackUser = formatFirebaseUser(fbUser);

    // Lưu / đồng bộ người dùng Google vào database backend Wayvee
    try {
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
        return {
          user: {
            ...userResponse,
            id: `WV-${String(userResponse.userId).padStart(5, "0")}`,
            authProvider: userResponse.authProvider || "GOOGLE",
            isGoogleUser: true
          },
          token: accessToken,
          firebaseUser: fbUser
        };
      }
    } catch (backendError) {
      console.warn("Backend Google sync error, falling back to Firebase auth state:", backendError);
    }

    return {
      user: fallbackUser,
      token: firebaseIdToken,
      firebaseUser: fbUser
    };
  } catch (error) {
    console.error("Firebase Google Sign-In failed:", error);
    const message = getFirebaseErrorMessage(error);
    const err = new Error(message);
    err.code = error.code;
    err.originalError = error;
    throw err;
  }
}

/**
 * Signs out from Firebase Authentication.
 */
export async function signOutFirebase() {
  if (auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Could not sign out of Firebase:", err);
    }
  }
}

/**
 * Listens to Firebase auth state changes.
 */
export function onFirebaseAuthStateChanged(callback) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}
