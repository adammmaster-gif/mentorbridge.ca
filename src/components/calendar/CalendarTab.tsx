"use client";
import { useEffect, useState } from "react";
import type { SessionRow, UserProfile } from "@/types";

interface Props {
  profile: UserProfile;
  userId: number;
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STATUS_COLOR: Record<string, string> = {
  pending:   "#FFBA08",
  upcoming:  "#22D4C0",
  completed: "#637088",
  cancelled: "#FF4D6D",
  live:      "#06D6A0",
};

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

export default function CalendarTab({ profile, userId }: Props) {
  const today = new Date();
  const [year,     setYear]     = useState(today.getFullYear());
  const [month,    setMonth]    = useState(today.getMonth());
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [selected, setSelected] = useState<SessionRow | null>(null);

  const role = profile.role === "mentor" ? "mentor" : "learner";

  useEffect(() => {
    fetch(`/api/sessions?userId=${userId}&role=${role}`)
      .then((r) => r.json())
      .then(setSessions)
      .catch(() => {});
  }, [userId, role]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }
  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  // Build 42-cell grid (6 weeks)
  const firstDow      = new Date(year, month, 1).getDay();
  const daysInMonth   = new Date(year, month + 1, 0).getDate();
  const daysInPrev    = new Date(year, month, 0).getDate();

  const cells: { date: Date; current: boolean }[] = [];
  for (let i = firstDow - 1; i >= 0; i--)
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), current: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d), current: true });
  while (cells.length < 42)
    cells.push({ date: new Date(year, month + 1, cells.length - daysInMonth - firstDow + 1), current: false });

  function dayEvents(date: Date) {
    return sessions.filter((s) => sameDay(new Date(s.scheduledDate), date));
  }

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
  }
  function fmtFull(iso: string) {
    return new Date(iso).toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }

  return (
    <div className="page" style={{ paddingTop: "20px" }}>

      {/* Header */}
      <div className="cal-hd">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button className="btn btn-ghost btn-sm" onClick={prevMonth}>‹</button>
          <span className="cal-month-label">{MONTHS[month]} {year}</span>
          <button className="btn btn-ghost btn-sm" onClick={nextMonth}>›</button>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={goToday}>Today</button>
      </div>

      {/* Calendar grid */}
      <div className="cal-grid">
        {DOW.map((d) => (
          <div key={d} className="cal-dow">{d}</div>
        ))}
        {cells.map((cell, i) => {
          const evts = dayEvents(cell.date);
          const isT  = sameDay(cell.date, today);
          return (
            <div key={i} className={`cal-cell${!cell.current ? " cal-other" : ""}${isT ? " cal-today" : ""}`}>
              <div className="cal-day-num">{cell.date.getDate()}</div>
              {evts.map((s) => {
                const color = STATUS_COLOR[s.status] ?? "#22D4C0";
                return (
                  <div
                    key={s.id}
                    className="cal-event"
                    style={{ background: `${color}22`, color, borderLeft: `3px solid ${color}` }}
                    onClick={() => setSelected(selected?.id === s.id ? null : s)}
                  >
                    {fmtTime(s.scheduledDate)} {s.courseCode}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Detail card */}
      {selected && (
        <div className="cal-detail">
          <button className="cal-detail-close" onClick={() => setSelected(null)}>×</button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: STATUS_COLOR[selected.status] ?? "#22D4C0" }}>
              {selected.courseCode}
            </span>
            <span className={`sbadge s-${selected.status === "upcoming" ? "up" : selected.status === "pending" ? "pend" : selected.status === "live" ? "live" : "done"}`}>
              {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
            </span>
          </div>
          <div style={{ color: "#A8B8D0", fontSize: "0.82rem", marginBottom: "14px" }}>{selected.courseName}</div>
          <div className="cal-detail-row">📅 {fmtFull(selected.scheduledDate)}</div>
          <div className="cal-detail-row">🕐 {fmtTime(selected.scheduledDate)} · {selected.durationMinutes} min</div>
          <div className="cal-detail-row">📍 {selected.location}</div>
          {profile.role === "learner" && selected.mentorName && (
            <div className="cal-detail-row">👤 Mentor: {selected.mentorName}</div>
          )}
          {profile.role === "mentor" && selected.learnerName && (
            <div className="cal-detail-row">👤 Student: {selected.learnerName}</div>
          )}
        </div>
      )}
    </div>
  );
}
