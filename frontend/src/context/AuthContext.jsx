import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import vgtAPI from "../utils/axiosConfig";

const AuthContext = createContext(null);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [externalToken, setExternalToken] = useState(() =>
    localStorage.getItem("external_token"),
  );
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  //setting external token on mount
  useEffect(() => {
    if (externalToken) {
      localStorage.setItem("external_token", externalToken);
    } else {
      localStorage.removeItem("external_token");
    }
  }, [externalToken]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userName", user.name || "");
      localStorage.setItem("userRole", user.role || "");
      localStorage.setItem("userId", String(user.id ?? ""));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
    }
  }, [user]);

  useEffect(() => {
    const hydrateProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (user?.role === "admin") {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser((prev) => ({
          ...prev,
          ...response.data,
        }));
      } catch (error) {
        console.error("Error loading auth profile:", error);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrateProfile();
  }, [token, user?.role]);

  //generate salt using user_id and passord
  const generateSalt = async (email, password) => {
    try {
      const saltResponse = await api.post("/auth/generate-salt", {
        email,
        password,
      });
      return saltResponse.data.salt;
    } catch (error) {
      console.error("genSalt error:", error.response);
    }
  };

  const getJwtPayload = (token) => {
    try {
      const payload = token.split(".")[1];

      return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    } catch (error) {
      console.error("Invalid JWT:", error);
      return null;
    }
  };

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token: nextToken, user: nextUser } = response.data;

    //getting external token
    const tokenResponse = await vgtAPI.post(`/login/`, {
      email: email,
      password: await generateSalt(email, password),
    });

    const externalToken = tokenResponse.data.token;
    const payload = getJwtPayload(externalToken);

    setToken(nextToken);
    setUser({
      ...nextUser,
      admin_id: payload?.admin_id,
    });
    setExternalToken(externalToken);

    return nextUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setExternalToken(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token),
        login,
        logout,
        setToken,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
