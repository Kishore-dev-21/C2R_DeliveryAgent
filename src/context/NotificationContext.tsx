import React, { createContext, useContext, useState, ReactNode } from "react";
import { initialNotifications } from "@/lib/mock-data";
import type { AgentNotification } from "@/lib/types";

interface NotificationContextType {
  notifications: AgentNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notif: Omit<AgentNotification, "id" | "timestamp" | "read">) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<AgentNotification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (notif: Omit<AgentNotification, "id" | "timestamp" | "read">) => {
    const newNotif: AgentNotification = {
      ...notif,
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
