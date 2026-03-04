"use client";
import { useEffect, useState } from "react";
import { COURSES, TYPE_COLOR } from "@/lib/constants";
import type { CourseEntry } from "@/types";

interface Props {
  userId: number;
  onSaved: () => void;
}

// Flatten all courses into a single searchable list
const ALL_COURSES: CourseEntry[] = Object.values(COURSES).flatMap((bySubject) =>
  Object.values(bySubject).flat()
);

export default function SubjectEditor({ userId, onSaved }: Props) {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/mentors/me?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => { setSubjects(d.subjects ?? []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [userId]);

  const suggestions = query.trim().length > 0
    ? ALL_COURSES.filter(
        (c) =>
          !subjects.includes(c.code) &&
          (c.code.toLowerCase().includes(query.toLowerCase()) ||
            c.name.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8)
    : [];

  function add(code: string) {
    setSubjects((prev) => [...prev, code]);
    setQuery("");
  }

  function remove(code: string) {
    setSubjects((prev) => prev.filter((s) => s !== code));
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/mentors/me?userId=${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjects }),
    });
    setSaving(false);
    onSaved();
  }

  if (!loaded) return <div style={{ color: "#637088", fontSize: "0.82rem" }}>Loading…</div>;

  return (
    <div>
      {/* Current subject chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: subjects.length ? "12px" : 0 }}>
        {subjects.map((code) => {
          const course = ALL_COURSES.find((c) => c.code === code);
          const color = course ? (TYPE_COLOR[course.type] ?? "#22D4C0") : "#22D4C0";
          return (
            <span
              key={code}
              style={{
                background: `${color}22`,
                color,
                border: `1px solid ${color}55`,
                borderRadius: "20px",
                padding: "4px 10px",
                fontSize: "0.78rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {code}
              <button
                onClick={() => remove(code)}
                style={{ background: "none", border: "none", color, cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "0.9rem" }}
              >
                ×
              </button>
            </span>
          );
        })}
        {subjects.length === 0 && (
          <span style={{ color: "#637088", fontSize: "0.8rem" }}>No courses added yet</span>
        )}
      </div>

      {/* Search to add */}
      <div style={{ position: "relative" }}>
        <input
          className="msg-input"
          style={{ width: "100%", boxSizing: "border-box" }}
          placeholder="Search course code or name to add…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {suggestions.length > 0 && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            background: "#111928", border: "1px solid #1A2A40", borderRadius: "10px",
            zIndex: 20, overflow: "hidden",
          }}>
            {suggestions.map((c) => {
              const color = TYPE_COLOR[c.type] ?? "#22D4C0";
              return (
                <button
                  key={c.code}
                  onClick={() => add(c.code)}
                  style={{
                    width: "100%", textAlign: "left", background: "none", border: "none",
                    padding: "9px 14px", cursor: "pointer", display: "flex",
                    alignItems: "center", gap: "10px", color: "#E2EAF6", fontSize: "0.82rem",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#1A2A40")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: "6px", padding: "2px 7px", fontWeight: 700, fontSize: "0.75rem" }}>
                    {c.code}
                  </span>
                  <span style={{ color: "#A8B8D0" }}>{c.name.split(" (")[0]}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        className="btn btn-primary btn-sm btn-full"
        style={{ marginTop: "12px" }}
        onClick={save}
        disabled={saving}
      >
        {saving ? "Saving…" : "Save Courses"}
      </button>
    </div>
  );
}
