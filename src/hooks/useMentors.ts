import { useState, useEffect } from "react";
import type { MentorProfile } from "@/types";

export function useMentors(schoolId: string, q: string = "") {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!schoolId) return;
    setLoading(true);
    const params = new URLSearchParams({ schoolId });
    if (q) params.set("q", q);
    fetch(`/api/mentors?${params}`)
      .then((r) => r.json())
      .then((data) => { setMentors(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [schoolId, q]);

  return { mentors, loading };
}
