"use client";
import { createContext, useContext, useState, ReactNode } from "react";

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
  addLeave: (leave: Omit<LeaveRequest, "id" | "status">) => void;
  updateStatus: (id: number, status: "Approved" | "Rejected") => void;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export function LeaveProvider({ children }: { children: ReactNode }) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([
    { id: 1, employee: "John Doe", type: "Vacation", startDate: "2026-05-01", endDate: "2026-05-05", status: "Pending", reason: "Family trip" },
    { id: 2, employee: "Jane Smith", type: "Sick Leave", startDate: "2026-04-10", endDate: "2026-04-12", status: "Approved", reason: "Fever" }
  ]);

  const addLeave = (newLeave: Omit<LeaveRequest, "id" | "status">) => {
    setLeaves([...leaves, { ...newLeave, id: Date.now(), status: "Pending" }]);
  };

  const updateStatus = (id: number, status: "Approved" | "Rejected") => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status } : l));
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