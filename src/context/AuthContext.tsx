import React, { createContext, useContext, useState, ReactNode } from "react";
import { mockAgent, type Agent } from "@/lib/mock-data";

interface AuthContextType {
  agent: Agent | null;
  isAuthenticated: boolean;
  login: (agentId: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [agent, setAgent] = useState<Agent | null>(null);

  const login = (agentId: string, password: string): boolean => {
    if (agentId === mockAgent.agentId && password === mockAgent.password) {
      setAgent(mockAgent);
      return true;
    }
    return false;
  };

  const logout = () => setAgent(null);

  return (
    <AuthContext.Provider value={{ agent, isAuthenticated: !!agent, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
