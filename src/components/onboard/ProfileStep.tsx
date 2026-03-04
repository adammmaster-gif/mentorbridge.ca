"use client";
import { useState } from "react";
import { AV_COLORS } from "@/lib/constants";
import type { School } from "@/types";

const GRADES = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];

interface Props {
  role: "learner" | "mentor";
  school: School;
  onComplete: (userId: number, profile: { name: string; initials: string; grade: string; role: string; avatarColor: number; school: School }) => void;
  onBack: () => void;
}

export default function ProfileStep({ role, school, onComplete, onBack }: Props) {
  const [name, setName] = useState("");
  const [initials, setInitials] = useState("");
  const [grade, setGrade] = useState("");
  const [email, setEmail] = useState("");
  const [avatarColor, setAvatarColor] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const computedInitials = initials || (name
    ? name.trim().split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "");

  async function handleSubmit() {
    if (!name || !grade) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), grade, role, schoolId: school.id, avatarColor, email: email.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Failed to create account");
      const user = await res.json();
      onComplete(user.id, { name: user.name, initials: computedInitials, grade: user.grade, role: user.role, avatarColor: user.avatarColor, school: user.school });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="onboard">
      <div className="og" />
      <div className="og2" />
      <div className="logo"><span>🍁</span>Mentor<em>Bridge</em></div>
      <div className="ob-card">
        <div className="spill"><div className="sdot" /><span className="stxt">Step 3 of 3 — Your profile</span></div>
        <h1>Set up your <em>profile</em></h1>
        <p>Visible to students and mentors at <strong>{school.name}</strong>.</p>

        <div className="form-row">
          <label className="form-lbl">Avatar colour</label>
          <div className="av-row">
            {AV_COLORS.map((c, i) => (
              <div key={i} className={`av-o ${avatarColor === i ? "sel" : ""}`} style={{ background: c }} onClick={() => setAvatarColor(i)}>
                {avatarColor === i ? "✓" : ""}
              </div>
            ))}
          </div>
        </div>

        <div className="form-row">
          <label className="form-lbl">Full name</label>
          <input className="form-input" placeholder="e.g. Jordan Davis" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-row">
          <label className="form-lbl">Initials (on avatar)</label>
          <input className="form-input" placeholder={computedInitials || "e.g. JD"} maxLength={3} value={initials} onChange={(e) => setInitials(e.target.value.toUpperCase())} />
        </div>

        <div className="form-row">
          <label className="form-lbl">Email <span style={{ color: "#637088", fontWeight: 400 }}>(optional — used to sign back in)</span></label>
          <input className="form-input" type="email" placeholder="e.g. jordan@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="form-row">
          <label className="form-lbl">Grade</label>
          <div className="grade-row">
            {GRADES.map((g) => (
              <button key={g} className={`grade-btn ${grade === g ? "sel" : ""}`} onClick={() => setGrade(g)}>{g}</button>
            ))}
          </div>
        </div>

        {error && <p style={{ color: "#FF4D6D", fontSize: "0.85rem" }}>{error}</p>}

        <div className="ob-acts">
          <button className="btn btn-ghost" onClick={onBack} disabled={loading}>← Back</button>
          <button className="btn btn-primary" disabled={!name || !grade || loading} onClick={handleSubmit}>
            {loading ? "Creating…" : "Enter MentorBridge 🎉"}
          </button>
        </div>
      </div>
    </div>
  );
}
