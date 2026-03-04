import { useState, useEffect } from "react";
import type { HoursData } from "@/types";

export function useHours(userId: number | null) {
  const [data, setData] = useState<HoursData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/hours?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  return { data, loading };
}
