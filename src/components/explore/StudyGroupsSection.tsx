"use client";
import { useState } from "react";
import { AV_COLORS, COURSES, TYPE_COLOR } from "@/lib/constants";
import type { CourseEntry, StudyGroup } from "@/types";

interface Props {
  userId: number;
}

const ALL_COURSES: CourseEntry[] = Object.values(COURSES).flatMap((bySubject) =>
  Object.values(bySubject).flat()
);

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function StudyGroupsSection({ userId }: Props) {
  const [open,       setOpen]       = useState(false);
  const [query,      setQuery]      = useState("");
  const [suggestions, setSuggestions] = useState<CourseEntry[]>([]);
  const [selCourse,  setSelCourse]  = useState<CourseEntry | null>(null);
  const [groups,     setGroups]     = useState<StudyGroup[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [joining,    setJoining]    = useState<number | null>(null);

  function handleQueryChange(val: string) {
    setQuery(val);
    if (val.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    setSuggestions(
      ALL_COURSES.filter(
        (c) =>
          c.code.toLowerCase().includes(val.toLowerCase()) ||
          c.name.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 8)
    );
  }

  async function selectCourse(c: CourseEntry) {
    setSelCourse(c);
    setQuery(`${c.code} — ${c.name.split(" (")[0]}`);
    setSuggestions([]);
    setLoading(true);
    const res = await fetch(`/api/study-groups?q=${encodeURIComponent(c.code)}&learnerId=${userId}`);
    if (res.ok) setGroups(await res.json());
    setLoading(false);
  }

  async function join(groupId: number) {
    setJoining(groupId);
    await fetch(`/api/study-groups/${groupId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ learnerId: userId }),
    });
    // Refresh list
    if (selCourse) {
      const res = await fetch(`/api/study-groups?q=${encodeURIComponent(selCourse.code)}&learnerId=${userId}`);
      if (res.ok) setGroups(await res.json());
    }
    setJoining(null);
  }

  async function leave(groupId: number) {
    setJoining(groupId);
    await fetch(`/api/study-groups/${groupId}/join`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ learnerId: userId }),
    });
    if (selCourse) {
      const res = await fetch(`/api/study-groups?q=${encodeURIComponent(selCourse.code)}&learnerId=${userId}`);
      if (res.ok) setGroups(await res.json());
    }
    setJoining(null);
  }

  const courseColor = selCourse ? (TYPE_COLOR[selCourse.type] ?? "#22D4C0") : "#22D4C0";

  return (
    <div className="page" style={{ paddingTop: 0, paddingBottom: "32px" }}>
      <div className="sg-panel">
        <div className="sg-hd">
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#E2EAF6" }}>Study Groups</div>
            <div style={{ fontSize: "0.78rem", color: "#637088", marginTop: "2px" }}>
              Search a course to find open drop-in sessions you can join
            </div>
          </div>
          <button
            className={`btn btn-sm ${open ? "btn-ghost" : "btn-primary"}`}
            onClick={() => { setOpen((o) => !o); if (!open) setQuery(""); }}
          >
            {open ? "Close" : "Browse Groups"}
          </button>
        </div>

        {open && (
          <>
            {/* Course search */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <input
                className="msg-input"
                style={{ width: "100%", boxSizing: "border-box" }}
                placeholder="Search a course code or name (e.g. MHF4U, calculus)…"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                autoFocus
              />
              {suggestions.length > 0 && (
                <div className="wl-dropdown">
                  {suggestions.map((c) => {
                    const col = TYPE_COLOR[c.type] ?? "#22D4C0";
                    return (
                      <button key={c.code} className="wl-option" onClick={() => selectCourse(c)}>
                        <span style={{ background: `${col}22`, color: col, border: `1px solid ${col}44`, borderRadius: "6px", padding: "2px 7px", fontWeight: 700, fontSize: "0.75rem" }}>
                          {c.code}
                        </span>
                        <span style={{ color: "#A8B8D0", fontSize: "0.82rem" }}>{c.name.split(" (")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Results */}
            {loading && <div style={{ color: "#637088", fontSize: "0.82rem", padding: "12px 0" }}>Searching…</div>}

            {!loading && selCourse && groups.length === 0 && (
              <div style={{ color: "#637088", fontSize: "0.82rem", padding: "12px 0" }}>
                No open study groups for <span style={{ color: courseColor, fontWeight: 700 }}>{selCourse.code}</span> right now.
              </div>
            )}

            {!loading && groups.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {groups.map((g) => {
                  const avColor  = AV_COLORS[g.mentorAvatarColor] ?? "#22D4C0";
                  const cColor   = TYPE_COLOR["University"] ?? "#22D4C0";
                  const isFull   = g.memberCount >= g.maxStudents;
                  const isJoining = joining === g.id;
                  return (
                    <div key={g.id} className="sg-card">
                      <div className="sg-card-top">
                        <span className="sg-course-badge" style={{ background: `${cColor}18`, color: cColor, border: `1px solid ${cColor}44` }}>
                          {g.courseCode}
                        </span>
                        <span className={`sg-spots ${isFull ? "sg-full" : ""}`}>
                          {isFull ? "Full" : `${g.memberCount}/${g.maxStudents} spots`}
                        </span>
                      </div>
                      <div className="sg-title">{g.title}</div>
                      <div className="sg-meta">
                        <div className="msg-av" style={{ background: avColor, width: 22, height: 22, fontSize: "0.6rem", flexShrink: 0 }}>
                          {g.mentorInitials}
                        </div>
                        <span style={{ color: "#A8B8D0" }}>{g.mentorName}</span>
                        <span style={{ color: "#637088" }}>·</span>
                        <span style={{ color: "#637088" }}>📅 {fmtDate(g.scheduledDate)}</span>
                        <span style={{ color: "#637088" }}>·</span>
                        <span style={{ color: "#637088" }}>📍 {g.location}</span>
                        <span style={{ color: "#637088" }}>·</span>
                        <span style={{ color: "#637088" }}>{g.durationMinutes} min</span>
                      </div>
                      <div style={{ marginTop: "10px" }}>
                        {g.alreadyJoined ? (
                          <button className="btn btn-ghost btn-sm" style={{ color: "#FF4D6D", borderColor: "#FF4D6D" }} disabled={isJoining} onClick={() => leave(g.id)}>
                            {isJoining ? "…" : "Leave Group"}
                          </button>
                        ) : (
                          <button className="btn btn-primary btn-sm" disabled={isFull || isJoining} onClick={() => join(g.id)}>
                            {isJoining ? "…" : isFull ? "Group Full" : "Join Group"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
