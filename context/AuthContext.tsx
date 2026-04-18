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

  // IMPORTANT: Replace the string below with your actual Render URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://leave-management-api-ekh9.onrender.com";
  const API_URL = `${API_BASE}/users`;

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
      }
    } catch (error) {
      alert("Failed to connect to the API. Ensure your Render service is active.");
    }
  };

  const login = async (email: string, password: string, role: Role) => {
    try {
      const response = await fetch(`${API_URL}?email=${email}`);
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        alert("User not found!");
        return;
      }

      const foundUser = data[0];
      if (foundUser.password !== password || foundUser.role !== role) {
        alert("Invalid credentials!");
        return;
      }

      setUser({ name: foundUser.name, email: foundUser.email, role: foundUser.role });
      handleRedirect(foundUser.role);
    } catch (error) {
      alert("Login failed. Check if the backend is running.");
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