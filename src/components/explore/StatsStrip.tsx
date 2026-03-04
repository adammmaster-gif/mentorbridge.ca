"use client";
import type { MentorProfile } from "@/types";

interface Props {
  mentors: MentorProfile[];
}

export default function StatsStrip({ mentors }: Props) {
  const available = mentors.filter((m) => m.available).length;
  const totalSessions = mentors.reduce((a, m) => a + m.sessions, 0);
  const avgRating = mentors.length
    ? (mentors.reduce((a, m) => a + m.rating, 0) / mentors.length).toFixed(1)
    : "—";

  return (
    <div className="stats-strip">
      <div className="sp"><div className="sp-n">{mentors.length}</div><div className="sp-l">Mentors at your school</div></div>
      <div className="sp"><div className="sp-n">{available}</div><div className="sp-l">Available now</div></div>
      <div className="sp"><div className="sp-n">{totalSessions}</div><div className="sp-l">Sessions done</div></div>
      <div className="sp"><div className="sp-n">{avgRating}★</div><div className="sp-l">Avg rating</div></div>
    </div>
  );
}
