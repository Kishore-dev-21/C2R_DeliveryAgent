import React, { createContext, useContext, useState, ReactNode } from "react";
import { mockDeliveries, type Delivery } from "@/lib/mock-data";

interface DeliveryContextType {
  deliveries: Delivery[];
  updateDelivery: (id: string, updates: Partial<Delivery>) => void;
  stats: { total: number; pending: number; completed: number; inProgress: number };
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider = ({ children }: { children: ReactNode }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);

  const updateDelivery = (id: string, updates: Partial<Delivery>) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter((d) => d.status === "Pending").length,
    completed: deliveries.filter((d) => d.status === "Delivered").length,
    inProgress: deliveries.filter((d) => d.status === "In Progress").length,
  };

  return (
    <DeliveryContext.Provider value={{ deliveries, updateDelivery, stats }}>
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDeliveries = () => {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error("useDeliveries must be used within DeliveryProvider");
  return ctx;
};
