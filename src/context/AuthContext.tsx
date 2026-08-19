import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { mockAgent } from "@/lib/mock-data";
import type { AgentProfile } from "@/lib/types";
import { ApiService } from "@/lib/api-service";

interface AuthContextType {
  agent: AgentProfile | null;
  isAuthenticated: boolean;
  login: (agentId: string, password: string, otp?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [agent, setAgent] = useState<AgentProfile | null>(mockAgent);

  useEffect(() => {
    ApiService.setSession(agent);
  }, [agent]);

  const login = async (agentId: string, password: string, otp?: string): Promise<{ success: boolean; error?: string }> => {
    // Simulated network delay
    await new Promise((r) => setTimeout(r, 600));

    if (agentId.trim().toUpperCase() === "AGT001" && password === "click2ration") {
      const authenticatedAgent: AgentProfile = {
        ...mockAgent,
        agentId: "AGT001",
        token: `JWT_C2R_SECURE_${Date.now()}_VALID_SESSION`,
      };
      setAgent(authenticatedAgent);
      ApiService.setSession(authenticatedAgent);
      ApiService.logAudit("AGENT_LOGIN_SUCCESS", undefined, "Agent authenticated successfully via credentials");
      return { success: true };
    }

    ApiService.logAudit("AGENT_LOGIN_FAILED", undefined, `Failed login attempt for Agent ID: ${agentId}`);
    return { success: false, error: "Invalid Agent ID or Security Password" };
  };

  const logout = () => {
    ApiService.logAudit("AGENT_LOGOUT", undefined, "Agent signed out of session");
    setAgent(null);
    ApiService.setSession(null);
  };

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
