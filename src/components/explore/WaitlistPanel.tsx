"use client";
import { useEffect, useState } from "react";
import { COURSES, TYPE_COLOR } from "@/lib/constants";
import type { CourseEntry } from "@/types";

interface WaitlistEntry {
  id: number;
  courseCode: string;
  createdAt: string;
}

interface Props {
  userId: number;
}

const ALL_COURSES: CourseEntry[] = Object.values(COURSES).flatMap((bySubject) =>
  Object.values(bySubject).flat()
);

export default function WaitlistPanel({ userId }: Props) {
  const [entries, setEntries]   = useState<WaitlistEntry[]>([]);
  const [query, setQuery]       = useState("");
  const [adding, setAdding]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => { load(); }, [userId]);

  async function load() {
    const res = await fetch(`/api/waitlist?learnerId=${userId}`);
    if (res.ok) setEntries(await res.json());
  }

  const suggestions = query.trim().length > 0
    ? ALL_COURSES
        .filter(
          (c) =>
            !entries.some((e) => e.courseCode === c.code) &&
            (c.code.toLowerCase().includes(query.toLowerCase()) ||
              c.name.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 7)
    : [];

  async function join(code: string) {
    setAdding(true);
    setError(null);
    setQuery("");
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ learnerId: userId, courseCode: code }),
    });
    if (res.ok) {
      await load();
    } else {
      const data = await res.json();
      setError(data.error ?? "Could not join waitlist");
    }
    setAdding(false);
  }

  async function leave(code: string) {
    await fetch("/api/waitlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ learnerId: userId, courseCode: code }),
    });
    setEntries((prev) => prev.filter((e) => e.courseCode !== code));
  }

  return (
    <div className="page" style={{ paddingTop: 0, paddingBottom: "32px" }}>
      <div className="wl-panel">
        <div className="wl-hd">
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#E2EAF6" }}>Course Waitlist</div>
            <div style={{ fontSize: "0.78rem", color: "#637088", marginTop: "2px" }}>
              Get notified in Messages when a mentor becomes available for a course
            </div>
          </div>
        </div>

        {/* Current entries */}
        {entries.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
            {entries.map((e) => {
              const course = ALL_COURSES.find((c) => c.code === e.courseCode);
              const color  = course ? (TYPE_COLOR[course.type] ?? "#22D4C0") : "#22D4C0";
              return (
                <span key={e.id} className="wl-chip" style={{ background: `${color}18`, color, border: `1px solid ${color}44` }}>
                  <span style={{ fontWeight: 700 }}>{e.courseCode}</span>
                  {course && <span style={{ color: "#A8B8D0", fontWeight: 400, fontSize: "0.72rem" }}> · {course.name.split(" (")[0]}</span>}
                  <button className="wl-chip-x" onClick={() => leave(e.courseCode)} title="Leave waitlist">×</button>
                </span>
              );
            })}
          </div>
        )}

        {entries.length === 0 && !query && (
          <div style={{ color: "#637088", fontSize: "0.8rem", marginBottom: "12px" }}>
            You are not on any waitlists yet.
          </div>
        )}

        {/* Search to add */}
        <div style={{ position: "relative" }}>
          <input
            className="msg-input"
            style={{ width: "100%", boxSizing: "border-box" }}
            placeholder="Search a course to join its waitlist…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setError(null); }}
            disabled={adding}
          />
          {suggestions.length > 0 && (
            <div className="wl-dropdown">
              {suggestions.map((c) => {
                const color = TYPE_COLOR[c.type] ?? "#22D4C0";
                return (
                  <button
                    key={c.code}
                    className="wl-option"
                    onClick={() => join(c.code)}
                  >
                    <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: "6px", padding: "2px 7px", fontWeight: 700, fontSize: "0.75rem" }}>
                      {c.code}
                    </span>
                    <span style={{ color: "#A8B8D0", fontSize: "0.82rem" }}>{c.name.split(" (")[0]}</span>
                    <span style={{ marginLeft: "auto", color: "#637088", fontSize: "0.72rem" }}>+ Join waitlist</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && <div style={{ color: "#FFBA08", fontSize: "0.78rem", marginTop: "8px" }}>{error}</div>}
      </div>
    </div>
  );
}
