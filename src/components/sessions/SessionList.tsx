"use client";
import { useState } from "react";
import { useSessions } from "@/hooks/useSessions";
import SessionRow from "./SessionRow";
import type { UserProfile } from "@/types";

interface Props {
  profile: UserProfile;
  userId: number | null;
  onBookNew: () => void;
  onJoinLive: () => void;
}

export default function SessionList({ profile, userId, onBookNew, onJoinLive }: Props) {
  const { sessions, loading, refetch } = useSessions(userId, profile.role);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  async function handleDecision(sessionId: number, status: "upcoming" | "cancelled") {
    setActionLoading(sessionId);
    const res = await fetch(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setActionLoading(null);
    if (res.ok) refetch();
  }

  if (profile.role === "mentor") {
    const pending  = sessions.filter((s) => s.status === "pending");
    const upcoming = sessions.filter((s) => s.status === "upcoming");
    const past     = sessions.filter((s) => s.status === "completed" || s.status === "cancelled");

    return (
      <div className="page">
        <div className="sec-hd"><div className="sec-ttl">My <em>Sessions</em></div></div>
        {loading ? (
          <div className="empty-state">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="empty-state" style={{ padding: "60px 20px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>📭</div>
            <div style={{ fontWeight: 600, marginBottom: "6px" }}>No sessions yet</div>
            <div style={{ fontSize: "0.82rem", color: "#637088" }}>Students will appear here once they book a session with you.</div>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <div className="slist-label" style={{ color: "#FFBA08" }}>⏳ Incoming Requests ({pending.length})</div>
                <div className="slist">
                  {pending.map((s) => (
                    <div key={s.id} className="srow" style={{ flexWrap: "wrap", gap: "10px" }}>
                      <div className="srt">
                        {new Date(s.scheduledDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        <span>{new Date(s.scheduledDate).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                      </div>
                      <div className="sri" style={{ flex: 1 }}>
                        <h4>{s.courseCode} – {s.courseName}</h4>
                        <p>from {s.learnerName} · {s.durationMinutes} min</p>
                        {s.location && <p style={{ color: "#22D4C0", fontSize: "0.78rem", marginTop: "2px" }}>📍 {s.location}</p>}
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button className="btn btn-primary btn-sm" disabled={actionLoading === s.id} onClick={() => handleDecision(s.id, "upcoming")}>
                          {actionLoading === s.id ? "…" : "✓ Confirm"}
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: "#FF4D6D", borderColor: "#FF4D6D" }} disabled={actionLoading === s.id} onClick={() => handleDecision(s.id, "cancelled")}>
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {upcoming.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <div className="slist-label">✅ Confirmed ({upcoming.length})</div>
                <div className="slist">{upcoming.map((s) => <SessionRow key={s.id} session={s} schoolName={profile.school.name} />)}</div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <div className="slist-label">History</div>
                <div className="slist">{past.map((s) => <SessionRow key={s.id} session={s} schoolName={profile.school.name} />)}</div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  const active = sessions.filter((s) => ["pending","upcoming","live"].includes(s.status));
  const past   = sessions.filter((s) => ["completed","cancelled"].includes(s.status));

  return (
    <div className="page">
      <div className="sec-hd">
        <div className="sec-ttl">My <em>Sessions</em></div>
        <button className="btn btn-primary btn-sm" onClick={onBookNew}>+ Book New</button>
      </div>
      {loading ? (
        <div className="empty-state">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="empty-state" style={{ padding: "60px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>📅</div>
          <div style={{ fontWeight: 600, marginBottom: "6px" }}>No sessions booked yet</div>
          <div style={{ fontSize: "0.82rem", color: "#637088", marginBottom: "16px" }}>Find a mentor in Explore and book your first session.</div>
          <button className="btn btn-primary btn-sm" onClick={onBookNew}>Browse Mentors →</button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              {past.length > 0 && <div className="slist-label">Upcoming</div>}
              <div className="slist">
                {active.map((s) => (
                  <div key={s.id}>
                    <SessionRow session={s} schoolName={profile.school.name} onJoin={s.status === "live" ? onJoinLive : undefined} />
                    {(s.status === "pending" || s.status === "upcoming") && (
                      <div style={{ padding: "0 0 8px 0", display: "flex", justifyContent: "flex-end" }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: "0.74rem", color: "#FF4D6D", borderColor: "transparent", padding: "4px 8px" }}
                          disabled={actionLoading === s.id}
                          onClick={() => handleDecision(s.id, "cancelled")}
                        >
                          {actionLoading === s.id ? "Cancelling…" : "Cancel session"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <div className="slist-label">History</div>
              <div className="slist">{past.map((s) => <SessionRow key={s.id} session={s} schoolName={profile.school.name} />)}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
