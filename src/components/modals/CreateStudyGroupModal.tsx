"use client";
import { useState } from "react";
import { COURSES, TIMES, TYPE_COLOR } from "@/lib/constants";
import CourseSelectorModal from "./CourseSelectorModal";
import type { CourseEntry, UserProfile } from "@/types";

interface Props {
  profile: UserProfile;
  userId: number;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateStudyGroupModal({ profile, userId, onClose, onCreated }: Props) {
  const [selCourse,    setSelCourse]    = useState<CourseEntry | null>(null);
  const [title,        setTitle]        = useState("");
  const [selDate,      setSelDate]      = useState("");
  const [selTime,      setSelTime]      = useState<string | null>(null);
  const [location,     setLocation]     = useState("");
  const [maxStudents,  setMaxStudents]  = useState(4);
  const [duration,     setDuration]     = useState(60);
  const [loading,      setLoading]      = useState(false);
  const [showPicker,   setShowPicker]   = useState(false);

  async function handleCreate() {
    if (!selCourse || !title.trim() || !selDate || !selTime || !location.trim()) return;
    setLoading(true);

    const [datePart] = selDate.split("T");
    const [hourStr, minuteStr] = selTime.replace(" PM","").replace(" AM","").split(":");
    const isPM = selTime.includes("PM");
    let hour = Number(hourStr);
    if (isPM && hour !== 12) hour += 12;
    const scheduledDate = new Date(`${datePart}T${String(hour).padStart(2,"0")}:${minuteStr}:00`);

    await fetch("/api/study-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentorId: userId,
        courseCode: selCourse.code,
        courseName: selCourse.name.split(" (")[0],
        title: title.trim(),
        scheduledDate: scheduledDate.toISOString(),
        durationMinutes: duration,
        location: location.trim(),
        maxStudents,
      }),
    });

    setLoading(false);
    onCreated();
  }

  if (showPicker) {
    return (
      <CourseSelectorModal
        initialGrade={profile.grade}
        onSelect={(c) => { setSelCourse(c); setShowPicker(false); }}
        onClose={() => setShowPicker(false)}
      />
    );
  }

  const courseColor = selCourse ? (TYPE_COLOR[selCourse.type] ?? "#22D4C0") : "#22D4C0";
  const canCreate   = selCourse && title.trim() && selDate && selTime && location.trim() && !loading;

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Create Study Group</h2>
        <p className="modal-sub">Open drop-in for students to join · {profile.school.name}</p>

        {/* Course */}
        <div className="form-row">
          <label className="form-lbl">Course</label>
          {selCourse ? (
            <div className="sel-course-box" onClick={() => setShowPicker(true)}>
              <div className="scb-label">Selected Course</div>
              <div className="scb-value" style={{ color: courseColor }}>{selCourse.code} — {selCourse.name.split(" (")[0]}</div>
              <div className="scb-change">Tap to change →</div>
            </div>
          ) : (
            <button className="btn btn-ghost btn-full" style={{ justifyContent: "center", padding: "14px" }} onClick={() => setShowPicker(true)}>
              📋 Browse All Ontario Courses →
            </button>
          )}
        </div>

        {/* Title */}
        <div className="form-row">
          <label className="form-lbl">Session Title</label>
          <input
            className="form-input"
            placeholder={selCourse ? `e.g. ${selCourse.code} Drop-in, Exam Prep, Unit 4 Review…` : "e.g. MHF4U Drop-in Session"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Date */}
        <div className="form-row">
          <label className="form-lbl">Date</label>
          <input className="form-input" type="date" value={selDate} onChange={(e) => setSelDate(e.target.value)} />
        </div>

        {/* Time */}
        <div className="form-row">
          <label className="form-lbl">Start Time</label>
          <div className="tgrid">
            {TIMES.map((t) => (
              <div key={t} className={`tslot ${selTime === t ? "sel" : ""}`} onClick={() => setSelTime(t)}>{t}</div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="form-row">
          <label className="form-lbl">Meeting Location</label>
          <input
            className="form-input"
            placeholder="e.g. Library Room 204, Study Hall…"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Max students + duration row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label className="form-lbl">Max Students</label>
            <select className="form-input" value={maxStudents} onChange={(e) => setMaxStudents(Number(e.target.value))}>
              {[2,3,4,5,6,8,10].map((n) => <option key={n} value={n}>{n} students</option>)}
            </select>
          </div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label className="form-lbl">Duration</label>
            <select className="form-input" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              {[30,45,60,90,120].map((n) => <option key={n} value={n}>{n} min</option>)}
            </select>
          </div>
        </div>

        <div className="mfoot" style={{ marginTop: "20px" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!canCreate} onClick={handleCreate}>
            {loading ? "Creating…" : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}
