"use client";
import { useEffect, useState } from "react";
import { AV_COLORS } from "@/lib/constants";
import CreateStudyGroupModal from "@/components/modals/CreateStudyGroupModal";
import type { HoursData, SessionRow, StudyGroup, UserProfile } from "@/types";

interface Props {
  profile: UserProfile;
  userId: number;
  hoursData: HoursData | null;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function MentorOverview({ profile, userId, hoursData }: Props) {
  const [sessions,       setSessions]       = useState<SessionRow[]>([]);
  const [studyGroups,    setStudyGroups]    = useState<StudyGroup[]>([]);
  const [showCreateSG,   setShowCreateSG]   = useState(false);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => { loadData(); }, [userId]);

  async function loadData() {
    setLoading(true);
    const [sessRes, sgRes] = await Promise.all([
      fetch(`/api/sessions?userId=${userId}&role=mentor`),
      fetch(`/api/study-groups?mentorId=${userId}`),
    ]);
    if (sessRes.ok) setSessions(await sessRes.json());
    if (sgRes.ok)   setStudyGroups(await sgRes.json());
    setLoading(false);
  }

  const pending   = sessions.filter((s) => s.status === "pending");
  const upcoming  = sessions.filter((s) => s.status === "upcoming");
  const completed = sessions.filter((s) => s.status === "completed");
  const uColor    = AV_COLORS[profile.avatarColor] ?? "#22D4C0";

  return (
    <>
      <div className="page" style={{ paddingTop: "28px" }}>

        {/* Hero */}
        <div className="prof-hero" style={{ marginBottom: "28px" }}>
          <div className="prof-av" style={{ background: uColor }}>{profile.initials}</div>
          <div className="prof-info">
            <h2>Welcome back, {profile.name.split(" ")[0]}!</h2>
            <p>{profile.school.name} · Mentor</p>
          </div>
          <div className="prof-stats">
            <div><div className="ps-n">{hoursData?.totalHours ?? "0.0"}</div><div className="ps-l">Hours</div></div>
            <div><div className="ps-n">{completed.length}</div><div className="ps-l">Sessions</div></div>
            <div><div className="ps-n">{pending.length}</div><div className="ps-l">Pending</div></div>
          </div>
        </div>

        <div className="prof-grid">

          {/* Pending requests */}
          <div className="pp">
            <div className="ppt">
              Incoming Requests
              {pending.length > 0 && <span className="msg-badge" style={{ marginLeft: 8 }}>{pending.length}</span>}
            </div>
            {loading ? (
              <div className="empty-state" style={{ padding: "20px 0", fontSize: "0.8rem", color: "#637088" }}>Loading…</div>
            ) : pending.length === 0 ? (
              <div className="empty-state" style={{ padding: "20px 0", fontSize: "0.8rem" }}>No pending requests</div>
            ) : (
              pending.map((s) => (
                <div key={s.id} className="srow" style={{ marginBottom: "10px" }}>
                  <div className="sr-top"><span className="sr-code">{s.courseCode}</span><span className="s-badge s-pend">⏳ Pending</span></div>
                  <div className="sr-sub">{s.learnerName} · 📍 {s.location}</div>
                  <div className="sr-sub" style={{ color: "#637088" }}>{fmt(s.scheduledDate)}</div>
                </div>
              ))
            )}
          </div>

          {/* Upcoming sessions */}
          <div className="pp">
            <div className="ppt">Upcoming Sessions</div>
            {loading ? (
              <div className="empty-state" style={{ padding: "20px 0", fontSize: "0.8rem", color: "#637088" }}>Loading…</div>
            ) : upcoming.length === 0 ? (
              <div className="empty-state" style={{ padding: "20px 0", fontSize: "0.8rem" }}>No upcoming sessions</div>
            ) : (
              upcoming.map((s) => (
                <div key={s.id} className="srow" style={{ marginBottom: "10px" }}>
                  <div className="sr-top"><span className="sr-code">{s.courseCode}</span><span className="s-badge s-up">✅ Confirmed</span></div>
                  <div className="sr-sub">{s.learnerName} · 📍 {s.location}</div>
                  <div className="sr-sub" style={{ color: "#637088" }}>{fmt(s.scheduledDate)}</div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Study Groups section */}
        <div className="pp" style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div className="ppt" style={{ marginBottom: 0 }}>My Study Groups</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateSG(true)}>
              + Create Study Group
            </button>
          </div>

          {studyGroups.length === 0 ? (
            <div style={{ color: "#637088", fontSize: "0.82rem", padding: "12px 0" }}>
              No study groups yet. Create one to let multiple students join a drop-in session.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {studyGroups.map((g) => (
                <div key={g.id} className="sg-card">
                  <div className="sg-card-top">
                    <span className="sg-course-badge" style={{ background: "rgba(34,212,192,0.12)", color: "#22D4C0", border: "1px solid rgba(34,212,192,0.3)" }}>
                      {g.courseCode}
                    </span>
                    <span className={`sg-spots ${g.memberCount >= g.maxStudents ? "sg-full" : ""}`}>
                      {g.memberCount >= g.maxStudents ? "Full" : `${g.memberCount}/${g.maxStudents} joined`}
                    </span>
                  </div>
                  <div className="sg-title">{g.title}</div>
                  <div className="sg-meta">
                    <span style={{ color: "#637088" }}>📅 {fmt(g.scheduledDate)}</span>
                    <span style={{ color: "#637088" }}>·</span>
                    <span style={{ color: "#637088" }}>📍 {g.location}</span>
                    <span style={{ color: "#637088" }}>·</span>
                    <span style={{ color: "#637088" }}>{g.durationMinutes} min</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {showCreateSG && (
        <CreateStudyGroupModal
          profile={profile}
          userId={userId}
          onClose={() => setShowCreateSG(false)}
          onCreated={() => { setShowCreateSG(false); loadData(); }}
        />
      )}
    </>
  );
}
