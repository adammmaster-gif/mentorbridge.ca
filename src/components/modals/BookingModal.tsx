"use client";
import { useState } from "react";
import { TIMES } from "@/lib/constants";
import CourseSelectorModal from "./CourseSelectorModal";
import type { CourseEntry, MentorProfile, UserProfile } from "@/types";

interface Props {
  mentor: MentorProfile;
  profile: UserProfile;
  onClose: () => void;
  onConfirm: (msg: string) => void;
}

export default function BookingModal({ mentor, profile, onClose, onConfirm }: Props) {
  const [selCourse, setSelCourse] = useState<CourseEntry | null>(null);
  const [selDate, setSelDate] = useState("");
  const [selTime, setSelTime] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!selCourse || !selDate || !selTime || !location.trim()) return;
    setLoading(true);

    const [datePart] = selDate.split("T");
    const [hourStr, minuteStr] = selTime.replace(" PM", "").replace(" AM", "").split(":");
    const isPM = selTime.includes("PM");
    let hour = Number(hourStr);
    if (isPM && hour !== 12) hour += 12;
    const scheduledDate = new Date(`${datePart}T${String(hour).padStart(2, "0")}:${minuteStr}:00`);

    const userId = localStorage.getItem("mb_user_id");
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        learnerId: Number(userId),
        mentorProfileId: mentor.id,
        courseCode: selCourse.code,
        courseName: selCourse.name.split(" (")[0],
        scheduledDate: scheduledDate.toISOString(),
        durationMinutes: 60,
        location: location.trim(),
        notes,
      }),
    });

    setLoading(false);
    if (res.ok) {
      onConfirm(`✅ Booked ${selCourse.code} with ${mentor.name} — ${selDate} at ${selTime}`);
    } else {
      onConfirm("❌ Booking failed. Please try again.");
    }
  }

  if (showCoursePicker) {
    return (
      <CourseSelectorModal
        initialGrade={profile.grade}
        onSelect={(c) => { setSelCourse(c); setShowCoursePicker(false); }}
        onClose={() => setShowCoursePicker(false)}
      />
    );
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Book a Session</h2>
        <p className="modal-sub">with {mentor.name} · {profile.school.name} · In Person · DPCDSB</p>

        <div className="form-row">
          <label className="form-lbl">Course</label>
          {selCourse ? (
            <div className="sel-course-box" onClick={() => setShowCoursePicker(true)}>
              <div className="scb-label">Selected Course</div>
              <div className="scb-value">{selCourse.code} — {selCourse.name.split(" (")[0]}</div>
              <div className="scb-sub">{profile.grade} · {selCourse.type}</div>
              <div className="scb-change">Tap to change course →</div>
            </div>
          ) : (
            <button
              className="btn btn-ghost btn-full"
              style={{ justifyContent: "center", gap: "8px", padding: "14px" }}
              onClick={() => setShowCoursePicker(true)}
            >
              📋 Browse All Ontario Courses by Grade →
            </button>
          )}
        </div>

        <div className="form-row">
          <label className="form-lbl">Date</label>
          <input className="form-input" type="date" value={selDate} onChange={(e) => setSelDate(e.target.value)} />
        </div>

        <div className="form-row">
          <label className="form-lbl">Available Times</label>
          <div className="tgrid">
            {TIMES.map((t) => (
              <div key={t} className={`tslot ${selTime === t ? "sel" : ""}`} onClick={() => setSelTime(t)}>{t}</div>
            ))}
          </div>
        </div>

        <div className="form-row">
          <label className="form-lbl">Meeting Location</label>
          <input
            className="form-input"
            placeholder="e.g. Library Room 204, Study Hall, Cafeteria…"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="form-lbl">What do you need help with?</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder={selCourse ? `e.g. I'm stuck on ${selCourse.code} — can we go through the hardest unit?` : "Describe what you need help with…"}
            style={{ resize: "vertical" }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="mfoot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={!selTime || !selDate || !selCourse || !location.trim() || loading}
            onClick={handleConfirm}
          >
            {loading ? "Booking…" : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
