import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserActivities } from "../services/activityService";
import type { DocumentActivity } from "../types/eduvault.types";

export const useVaultActivities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<DocumentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!user?.uid) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getUserActivities(user.uid, 50);
      setActivities(data);
    } catch (err) {
      console.error("[useVaultActivities] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, refresh: fetchActivities };
};
