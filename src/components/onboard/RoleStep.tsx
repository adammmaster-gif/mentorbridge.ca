"use client";

interface Props {
  role: "learner" | "mentor" | null;
  onSelect: (r: "learner" | "mentor") => void;
  onNext: () => void;
  onSignIn: () => void;
}

export default function RoleStep({ role, onSelect, onNext, onSignIn }: Props) {
  return (
    <div className="onboard">
      <div className="og" />
      <div className="og2" />
      <div className="logo"><span>🍁</span>Mentor<em>Bridge</em></div>
      <div className="ob-card">
        <div className="spill"><div className="sdot" /><span className="stxt">Step 1 of 3</span></div>
        <h1>Welcome to<br /><em>MentorBridge</em></h1>
        <p>DPCDSB's peer-to-peer learning platform — connecting students across all 26 Catholic secondary schools in Mississauga, Brampton, and Caledon.</p>
        <div className="role-grid">
          <div className={`role-card ${role === "learner" ? "sel" : ""}`} onClick={() => onSelect("learner")}>
            <div className="ri">📚</div>
            <h3>I'm a Student</h3>
            <p>I want help from an upperclassman who took my exact course at my school.</p>
          </div>
          <div className={`role-card ${role === "mentor" ? "sel" : ""}`} onClick={() => onSelect("mentor")}>
            <div className="ri">🎓</div>
            <h3>I'm a Mentor</h3>
            <p>I want to help others and earn verified OSSD volunteer hours.</p>
          </div>
        </div>
        <button className="btn btn-primary btn-full" disabled={!role} onClick={onNext}>
          Continue →
        </button>
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onSignIn}
            style={{ fontSize: "0.8rem", color: "#637088" }}
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
