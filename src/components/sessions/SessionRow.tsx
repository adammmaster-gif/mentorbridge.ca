"use client";
import { format, isToday, isTomorrow } from "date-fns";
import type { SessionRow } from "@/types";
import type { MentorProfile } from "@/types";

interface Props {
  session: SessionRow;
  schoolName: string;
  onJoin?: (mentor: MentorProfile | null) => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d");
}

function formatTime(iso: string) {
  return format(new Date(iso), "h:mm a");
}

export default function SessionRow({ session, schoolName, onJoin }: Props) {
  const statusClass =
    session.status === "live" ? "s-live"
    : session.status === "upcoming" ? "s-up"
    : session.status === "pending" ? "s-pend"
    : "s-done";

  const statusLabel =
    session.status === "live" ? "🔴 Live"
    : session.status === "upcoming" ? "Upcoming"
    : session.status === "pending" ? "⏳ Awaiting Confirmation"
    : "✓ Done";

  const subtitle = session.mentorName
    ? `with ${session.mentorName} · ${session.durationMinutes} min · ${schoolName}`
    : `${session.durationMinutes} min · ${schoolName}`;

  return (
    <div className="srow">
      <div className="srt">
        {formatTime(session.scheduledDate)}
        <span>{formatDate(session.scheduledDate)}</span>
      </div>
      <div className="sri">
        <h4>{session.courseCode} – {session.courseName}</h4>
        <p>{subtitle}</p>
        {session.location && (
          <p style={{ color: "#22D4C0", fontSize: "0.78rem", marginTop: "2px" }}>
            📍 {session.location}
          </p>
        )}
      </div>
      <span className={`sbadge ${statusClass}`}>{statusLabel}</span>
      {session.status === "live" && onJoin && (
        <button className="btn btn-danger btn-sm" onClick={() => onJoin(null)}>Join</button>
      )}
    </div>
  );
}
