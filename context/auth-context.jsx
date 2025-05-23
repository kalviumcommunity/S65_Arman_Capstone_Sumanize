"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { setCookie, destroyCookie } from "nookies";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pendingVerification, setPendingVerification] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkSession();
  }, []);

  const login = async (email) => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.success) {
      setPendingVerification({ email });
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const register = async (email) => {
    return login(email);
  };

  const verifyEmail = async (email, otp) => {
    setIsVerifying(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setIsVerifying(false);
    if (data.success) {
      const userData = {
        email,
        isPremium: data.user?.isPremium || false,
        subscriptionEnds: data.user?.currentPeriodEnd || null,
      };
      setUser(userData);
      setPendingVerification(null);
      setCookie(null, "sumanize-token", data.token, {
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const logout = () => {
    setUser(null);
    destroyCookie(null, "sumanize-token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        verifyEmail,
        pendingVerification,
        isVerifying,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
