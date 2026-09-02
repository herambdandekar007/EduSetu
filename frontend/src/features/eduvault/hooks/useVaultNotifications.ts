import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserNotifications, markNotificationRead } from "../services/notificationService";
import type { VaultNotification } from "../types/eduvault.types";

export const useVaultNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<VaultNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const list = await getUserNotifications(user.uid, 30);
      setNotifications(list);
    } catch (err) {
      console.error("[useVaultNotifications] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    loading,
    refresh: fetchNotifications,
    markAsRead: handleMarkRead,
  };
};
