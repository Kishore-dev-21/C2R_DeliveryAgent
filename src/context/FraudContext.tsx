import React, { createContext, useContext, useState, ReactNode } from "react";
import type { FraudLog } from "@/lib/fraud-detection";

const initialFraudLogs: FraudLog[] = [
  {
    id: "FR-SEED-001",
    agentId: "AGT001",
    deliveryId: "DEL006",
    beneficiaryName: "Anitha K",
    rationCardNumber: "TN10203040",
    timestamp: "2025-10-06T09:12:00Z",
    fraudType: "Biometric",
    description: "Biometric authentication failed 5 times before success (threshold: 3). Possible identity mismatch.",
    status: "Pending Review",
  },
  {
    id: "FR-SEED-002",
    agentId: "AGT001",
    deliveryId: "DEL007",
    beneficiaryName: "Ravi Shankar",
    rationCardNumber: "TN50607080",
    timestamp: "2025-10-06T09:45:00Z",
    fraudType: "Biometric",
    description: "Biometric authentication failed 4 times before success (threshold: 3). Possible identity mismatch.",
    status: "Pending Review",
  },
  {
    id: "FR-SEED-003",
    agentId: "AGT001",
    deliveryId: "DEL008",
    beneficiaryName: "Lakshmi Devi",
    rationCardNumber: "TN11121314",
    timestamp: "2025-10-06T10:20:00Z",
    fraudType: "Biometric",
    description: "Biometric authentication failed 6 times before success (threshold: 3). Possible identity mismatch.",
    status: "Pending Review",
  },
  {
    id: "FR-SEED-004",
    agentId: "AGT001",
    deliveryId: "DEL009",
    beneficiaryName: "Kumar P",
    rationCardNumber: "TN15161718",
    timestamp: "2025-10-06T11:05:00Z",
    fraudType: "Biometric",
    description: "Biometric authentication failed 4 times before success (threshold: 3). Possible identity mismatch.",
    status: "Resolved",
  },
  {
    id: "FR-SEED-005",
    agentId: "AGT001",
    deliveryId: "DEL010",
    beneficiaryName: "Saravanan T",
    rationCardNumber: "TN19202122",
    timestamp: "2025-10-06T11:30:00Z",
    fraudType: "GPS",
    description: "Delivery GPS is 12.3km from registered address (threshold: 5km). Location mismatch detected.",
    status: "Pending Review",
  },
  {
    id: "FR-SEED-006",
    agentId: "AGT001",
    deliveryId: "DEL011",
    beneficiaryName: "Meena R",
    rationCardNumber: "TN23242526",
    timestamp: "2025-10-06T12:00:00Z",
    fraudType: "GPS",
    description: "Delivery GPS is 8.7km from registered address (threshold: 5km). Location mismatch detected.",
    status: "Pending Review",
  },
  {
    id: "FR-SEED-007",
    agentId: "AGT001",
    deliveryId: "DEL012",
    beneficiaryName: "Ganesh B",
    rationCardNumber: "TN27282930",
    timestamp: "2025-10-06T12:25:00Z",
    fraudType: "GPS",
    description: "Delivery GPS is 15.1km from registered address (threshold: 5km). Location mismatch detected.",
    status: "Pending Review",
  },
  {
    id: "FR-SEED-008",
    agentId: "AGT001",
    deliveryId: "DEL013",
    beneficiaryName: "Vasanthi M",
    rationCardNumber: "TN31323334",
    timestamp: "2025-10-06T12:50:00Z",
    fraudType: "GPS",
    description: "Delivery GPS is 9.4km from registered address (threshold: 5km). Location mismatch detected.",
    status: "Resolved",
  },
];

interface FraudContextType {
  fraudLogs: FraudLog[];
  addFraudLogs: (logs: FraudLog[]) => void;
  resolveFraud: (id: string) => void;
  pendingCount: number;
}

const FraudContext = createContext<FraudContextType | undefined>(undefined);

export const FraudProvider = ({ children }: { children: ReactNode }) => {
  const [fraudLogs, setFraudLogs] = useState<FraudLog[]>(initialFraudLogs);

  const addFraudLogs = (logs: FraudLog[]) => {
    if (logs.length > 0) {
      setFraudLogs((prev) => [...logs, ...prev]);
    }
  };

  const resolveFraud = (id: string) => {
    setFraudLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, status: "Resolved" as const } : log))
    );
  };

  const pendingCount = fraudLogs.filter((l) => l.status === "Pending Review").length;

  return (
    <FraudContext.Provider value={{ fraudLogs, addFraudLogs, resolveFraud, pendingCount }}>
      {children}
    </FraudContext.Provider>
  );
};

export const useFraud = () => {
  const ctx = useContext(FraudContext);
  if (!ctx) throw new Error("useFraud must be used within FraudProvider");
  return ctx;
};
