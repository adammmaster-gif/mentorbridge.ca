import { useState, useEffect } from "react";
import type { SessionRow } from "@/types";

export function useSessions(userId: number | null, role: "learner" | "mentor" = "learner") {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    if (!userId) return;
    fetch(`/api/sessions?userId=${userId}&role=${role}`)
      .then((r) => r.json())
      .then((data) => { setSessions(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    refetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, role]);

  return { sessions, loading, refetch };
}
