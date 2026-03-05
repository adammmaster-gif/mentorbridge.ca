"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  function enter(role: "mentor" | "learner") {
    const userId = role === "mentor" ? 1 : 7;
    const profile = {
      name: role === "mentor" ? "Demo Mentor" : "Demo Student",
      initials: role === "mentor" ? "DM" : "DS",
      grade: "11",
      role,
      avatarColor: role === "mentor" ? "#4f46e5" : "#0891b2",
      school: "st_marcellinus",
    };
    localStorage.setItem("mb_user_id", String(userId));
    localStorage.setItem("mb_profile", JSON.stringify(profile));
    router.replace("/dashboard");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#06080D",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "2rem",
      fontFamily: "sans-serif",
    }}>
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1 style={{ color: "#E2EAF6", fontSize: "2.5rem", fontWeight: 700, margin: 0 }}>
          Mentor<span style={{ color: "#22D4C0" }}>Bridge</span>
        </h1>
        <p style={{ color: "#637088", marginTop: "0.5rem", fontSize: "1rem" }}>
          DPCDSB Peer Tutoring Platform
        </p>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => enter("mentor")}
          style={{
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "1.25rem 2.5rem",
            fontSize: "1.1rem",
            fontWeight: 600,
            cursor: "pointer",
            minWidth: "180px",
          }}
        >
          Enter as Mentor
        </button>
        <button
          onClick={() => enter("learner")}
          style={{
            background: "#0891b2",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "1.25rem 2.5rem",
            fontSize: "1.1rem",
            fontWeight: 600,
            cursor: "pointer",
            minWidth: "180px",
          }}
        >
          Enter as Student
        </button>
      </div>
    </div>
  );
}
