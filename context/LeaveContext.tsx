"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type LeaveRequest = {
  id: number;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
};

interface LeaveContextType {
  leaves: LeaveRequest[];
  addLeave: (leave: Omit<LeaveRequest, "id" | "status">) => Promise<void>;
  updateStatus: (id: number, status: "Approved" | "Rejected") => Promise<void>;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export function LeaveProvider({ children }: { children: ReactNode }) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://leave-management-api-ekh9.onrender.com";
  const API_URL = `${API_BASE}/leaves`;

  // Fetch leaves from the server on load
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setLeaves(data);
      } catch (err) {
        console.error("Failed to fetch leaves", err);
      }
    };
    fetchLeaves();
  }, [API_URL]);

  const addLeave = async (newLeave: Omit<LeaveRequest, "id" | "status">) => {
    const leaveWithDefaults = { ...newLeave, status: "Pending" };
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveWithDefaults),
      });
      if (res.ok) {
        const savedLeave = await res.json();
        setLeaves((prev) => [...prev, savedLeave]);
      }
    } catch (err) {
      alert("Error submitting leave request");
    }
  };

  const updateStatus = async (id: number, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      }
    } catch (err) {
      alert("Error updating leave status");
    }
  };

  return (
    <LeaveContext.Provider value={{ leaves, addLeave, updateStatus }}>
      {children}
    </LeaveContext.Provider>
  );
}

export const useLeaves = () => {
  const context = useContext(LeaveContext);
  if (!context) throw new Error("useLeaves must be used within Provider");
  return context;
};