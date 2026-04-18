"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

export type Role = "EMPLOYEE" | "MANAGER" | "ADMIN";
export type User = { name: string; email: string; role: Role; password?: string };

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: Role) => Promise<void>;
  signup: (userData: User) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // ✅ Use env variable properly
  const API = process.env.NEXT_PUBLIC_API_URL;

  // ---------- SIGNUP ----------
  const signup = async (userData: User) => {
    try {
      const response = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error("Signup failed");

      const newUser = await response.json();

      setUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      });

      handleRedirect(newUser.role);
    } catch (error) {
      console.error("Signup Error:", error);
      alert("Signup failed. Check backend or network.");
    }
  };

  // ---------- LOGIN ----------
  const login = async (email: string, password: string, role: Role) => {
    try {
      const response = await fetch(
        `${API}/users?email=${email}&password=${password}`
      );

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();

      if (!data.length) {
        alert("Invalid credentials!");
        return;
      }

      const foundUser = data[0];

      if (foundUser.role !== role) {
        alert("Role mismatch!");
        return;
      }

      setUser({
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
      });

      handleRedirect(foundUser.role);
    } catch (error) {
      console.error("Login Error:", error);
      alert("Failed to fetch. Check backend URL or Render status.");
    }
  };

  // ---------- REDIRECT ----------
  const handleRedirect = (role: Role) => {
    if (role === "EMPLOYEE") router.push("/employee");
    else if (role === "MANAGER") router.push("/manager");
    else if (role === "ADMIN") router.push("/admin");
  };

  // ---------- LOGOUT ----------
  const logout = () => {
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------- HOOK ----------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within Provider");
  return context;
};