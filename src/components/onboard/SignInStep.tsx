"use client";
import { useState } from "react";
import type { School } from "@/types";

interface Props {
  onComplete: (userId: number, profile: { name: string; initials: string; grade: string; role: string; avatarColor: number; school: School }) => void;
  onBack: () => void;
}

export default function SignInStep({ onComplete, onBack }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/users?email=${encodeURIComponent(email.trim())}`);
      if (res.status === 404) {
        setError("No account found with that email. Double-check it or create a new account.");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error();
      const user = await res.json();
      onComplete(user.id, {
        name: user.name,
        initials: user.initials,
        grade: user.grade,
        role: user.role,
        avatarColor: user.avatarColor,
        school: user.school,
      });
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
        <div className="spill"><div className="sdot" /><span className="stxt">Sign In</span></div>
        <h1>Welcome <em>back</em></h1>
        <p>Enter the email you used when you created your account.</p>

        <div className="form-row">
          <label className="form-lbl">Your email</label>
          <input
            className="form-input"
            type="email"
            placeholder="e.g. jordan@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSignIn(); }}
            autoFocus
          />
        </div>

        {error && <p style={{ color: "#FF4D6D", fontSize: "0.85rem", marginBottom: "12px" }}>{error}</p>}

        <div className="ob-acts">
          <button className="btn btn-ghost" onClick={onBack} disabled={loading}>← Back</button>
          <button className="btn btn-primary" disabled={!email.trim() || loading} onClick={handleSignIn}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </div>
      </div>
    </div>
  );
}
