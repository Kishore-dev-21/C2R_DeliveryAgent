import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { initialDeliveryTasks } from "@/lib/mock-data";
import type {
  DeliveryTask,
  DeliveryStatus,
  VerificationMethod,
  DigitalProofOfDelivery,
  VerificationRequirement
} from "@/lib/types";
import { ApiService } from "@/lib/api-service";
import { useAuth } from "./AuthContext";

interface PerformanceStats {
  totalAssigned: number;
  completed: number;
  inTransit: number;
  pendingVerification: number;
  adminHeld: number;
  delayed: number;
  successRatePercent: number;
  avgCompletionTimeMinutes: number;
}

interface DeliveryContextType {
  deliveries: DeliveryTask[];
  activeTask: DeliveryTask | null;
  stats: PerformanceStats;
  getDeliveryById: (id: string) => DeliveryTask | undefined;
  transitionStatus: (id: string, targetStatus: DeliveryStatus, reason?: string) => Promise<{ success: boolean; error?: string }>;
  requestBeneficiaryOtp: (orderId: string) => Promise<{ success: boolean; expiresInSeconds?: number; mockDisplayOtp?: string; error?: string }>;
  verifyBeneficiaryOtp: (orderId: string, enteredOtp: string) => Promise<{ success: boolean; error?: string; attemptsRemaining?: number }>;
  executeBiometricScan: (orderId: string, shouldFail?: boolean) => Promise<{ success: boolean; qualityScore?: number; error?: string }>;
  finalizeDelivery: (orderId: string, method: VerificationMethod) => Promise<{ success: boolean; proof?: DigitalProofOfDelivery; error?: string }>;
  requestAdminReview: (orderId: string, notes: string) => Promise<{ success: boolean; error?: string }>;
  resetDemoQueue: () => void;
  triggerDemoScenario: (scenario: "CASE_1_NORMAL" | "CASE_2_ADDITIONAL_VERIFICATION" | "CASE_3_ADMIN_HOLD") => string;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider = ({ children }: { children: ReactNode }) => {
  const { agent } = useAuth();
  const [tasks, setTasks] = useState<DeliveryTask[]>(initialDeliveryTasks);

  // Filter tasks assigned to currently authenticated agent (isolation)
  const agentTasks = tasks.filter((t) => !agent || t.agentId === agent.agentId);

  const activeTask = agentTasks.find(
    (t) => t.status === "ACCEPTED" || t.status === "ON_THE_WAY" || t.status === "ARRIVED" || t.status === "VERIFICATION"
  ) || null;

  const getDeliveryById = (id: string) => {
    return agentTasks.find((t) => t.id === id);
  };

  const transitionStatus = async (
    id: string,
    targetStatus: DeliveryStatus,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const targetTask = getDeliveryById(id);
    if (!targetTask) {
      return { success: false, error: "Delivery task not found" };
    }

    const result = await ApiService.transitionDeliveryStatus(targetTask, targetStatus, reason);
    if (result.success && result.updatedDelivery) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? result.updatedDelivery! : t))
      );
      return { success: true };
    }
    return { success: false, error: result.error || "Status update failed" };
  };

  const requestBeneficiaryOtp = async (orderId: string) => {
    return await ApiService.requestOtp(orderId);
  };

  const verifyBeneficiaryOtp = async (orderId: string, enteredOtp: string) => {
    return await ApiService.verifyOtp(orderId, enteredOtp);
  };

  const executeBiometricScan = async (orderId: string, shouldFail: boolean = false) => {
    const task = getDeliveryById(orderId);
    return await ApiService.executeMantraBiometricVerification(
      orderId,
      task?.beneficiaryIdentifier || "BEN_UNKNOWN",
      shouldFail
    );
  };

  const finalizeDelivery = async (orderId: string, method: VerificationMethod) => {
    const task = getDeliveryById(orderId);
    if (!task) {
      return { success: false, error: "Task not found" };
    }

    const result = await ApiService.finalizeDeliveryWithProof(task, method);
    if (result.success && result.updatedDelivery) {
      setTasks((prev) =>
        prev.map((t) => (t.id === orderId ? result.updatedDelivery! : t))
      );
      return { success: true, proof: result.proof };
    }
    return { success: false, error: "Failed to finalize digital proof of delivery" };
  };

  const requestAdminReview = async (orderId: string, notes: string) => {
    const result = await ApiService.requestAdminClearance(orderId, notes);
    if (result.success) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === orderId ? { ...t, adminClearanceStatus: "PENDING_REVIEW" as const } : t
        )
      );
      return { success: true };
    }
    return { success: false, error: "Failed to submit administrative review request" };
  };

  const resetDemoQueue = () => {
    setTasks(initialDeliveryTasks);
    ApiService.logAudit("DEMO_QUEUE_RESET", undefined, "Reset all synthetic demo delivery states to default");
  };

  const triggerDemoScenario = (
    scenario: "CASE_1_NORMAL" | "CASE_2_ADDITIONAL_VERIFICATION" | "CASE_3_ADMIN_HOLD"
  ): string => {
    let orderId = "";
    if (scenario === "CASE_1_NORMAL") {
      orderId = "ORD-2026-8801";
      setTasks((prev) =>
        prev.map((t) =>
          t.id === orderId
            ? {
                ...t,
                status: "ASSIGNED",
                riskLevel: "LOW_RISK",
                verificationRequirement: "STANDARD_VERIFICATION",
                riskInstructionEn: "Standard delivery verification required.",
                riskInstructionTa: "நிலையான விநியோக சரிபார்ப்பு தேவை.",
              }
            : t
        )
      );
    } else if (scenario === "CASE_2_ADDITIONAL_VERIFICATION") {
      orderId = "ORD-2026-8802";
      setTasks((prev) =>
        prev.map((t) =>
          t.id === orderId
            ? {
                ...t,
                status: "ASSIGNED",
                riskLevel: "MEDIUM_RISK",
                verificationRequirement: "ADDITIONAL_VERIFICATION",
                riskInstructionEn: "Additional beneficiary verification required.",
                riskInstructionTa: "கூடுதல் பயனாளி சரிபார்ப்பு தேவை.",
              }
            : t
        )
      );
    } else if (scenario === "CASE_3_ADMIN_HOLD") {
      orderId = "ORD-2026-8803";
      setTasks((prev) =>
        prev.map((t) =>
          t.id === orderId
            ? {
                ...t,
                status: "ASSIGNED",
                riskLevel: "HIGH_RISK",
                verificationRequirement: "ADMINISTRATIVE_HOLD",
                riskInstructionEn: "Administrative verification required before completion.",
                riskInstructionTa: "நிறைவு செய்வதற்கு முன் நிர்வாக சரிபார்ப்பு தேவை.",
                adminClearanceStatus: "PENDING_REVIEW",
              }
            : t
        )
      );
    }
    return orderId;
  };

  // Performance calculations
  const totalAssigned = agentTasks.length;
  const completed = agentTasks.filter((t) => t.status === "DELIVERED").length;
  const inTransit = agentTasks.filter((t) => t.status === "ON_THE_WAY" || t.status === "ACCEPTED").length;
  const pendingVerification = agentTasks.filter(
    (t) => (t.status === "ARRIVED" || t.status === "VERIFICATION") && t.verificationRequirement !== "ADMINISTRATIVE_HOLD"
  ).length;
  const adminHeld = agentTasks.filter((t) => t.verificationRequirement === "ADMINISTRATIVE_HOLD").length;
  const delayed = agentTasks.filter((t) => t.status === "DELAYED").length;
  const successRatePercent = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;
  const avgCompletionTimeMinutes = 18.5; // Average baseline from completed delivery route

  const stats: PerformanceStats = {
    totalAssigned,
    completed,
    inTransit,
    pendingVerification,
    adminHeld,
    delayed,
    successRatePercent,
    avgCompletionTimeMinutes,
  };

  return (
    <DeliveryContext.Provider
      value={{
        deliveries: agentTasks,
        activeTask,
        stats,
        getDeliveryById,
        transitionStatus,
        requestBeneficiaryOtp,
        verifyBeneficiaryOtp,
        executeBiometricScan,
        finalizeDelivery,
        requestAdminReview,
        resetDemoQueue,
        triggerDemoScenario,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDeliveries = () => {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error("useDeliveries must be used within DeliveryProvider");
  return ctx;
};
