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

  /** * CHANGE: This checks if you have a production URL set.
   * Replace 'your-api-link.onrender.com' with your actual Render API link later.
   **/
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const API_URL = `${API_BASE}/users`;

  // 1. SIGN UP
  const signup = async (userData: User) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUser({ name: newUser.name, email: newUser.email, role: newUser.role });
        handleRedirect(newUser.role);
      } else {
        alert("Signup failed. Ensure the backend is running.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      alert("Cannot connect to server. Did you start json-server with --cors?");
    }
  };

  // 2. LOGIN
  const login = async (email: string, password: string, role: Role) => {
    try {
      // json-server allows filtering via query strings
      const response = await fetch(`${API_URL}?email=${email}`);

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        alert("User not found! Please sign up first.");
        return;
      }

      const foundUser = data[0];

      // Security check for password and role
      if (foundUser.password !== password || foundUser.role !== role) {
        alert("Invalid credentials or role selection!");
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
      alert("Connection failed. Check your internet or backend status.");
    }
  };

  const handleRedirect = (role: Role) => {
    if (role === "EMPLOYEE") router.push("/employee");
    else if (role === "MANAGER") router.push("/manager");
    else if (role === "ADMIN") router.push("/admin");
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within Provider");
  return context;
};