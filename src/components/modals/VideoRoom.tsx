"use client";
import { useState, useEffect, useRef } from "react";
import { AV_COLORS, C } from "@/lib/constants";
import type { MentorProfile, UserProfile } from "@/types";

interface Props {
  mentor: MentorProfile | null;
  profile: UserProfile;
  onLeave: () => void;
}

export default function VideoRoom({ mentor, profile, onLeave }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [sideTab, setSideTab] = useState<"whiteboard" | "chat" | "notes">("whiteboard");
  const [chatMsgs, setChatMsgs] = useState([
    { from: "Mentor", text: "Hey! What do you want to work on today?" },
    { from: "You", text: "Can we go through MCV4U limits?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const uColor = AV_COLORS[profile.avatarColor] ?? C.teal;
  const mColor = mentor ? (AV_COLORS[mentor.avatarColor] ?? C.teal) : C.teal;

  function sendChat() {
    if (!chatInput.trim()) return;
    setChatMsgs((m) => [...m, { from: "You", text: chatInput }]);
    setChatInput("");
  }

  return (
    <div className="vroom">
      <div className="vrh">
        <div className="vrt">📍 {mentor?.name ?? "Demo Mentor"} · {profile.school.name}</div>
        <div className="vrtimer">{fmt(elapsed)}</div>
        <div className="vrenc">✅ In-Person · DPCDSB verified</div>
      </div>
      <div className="vrbody">
        <div className="vrfeeds">
          <div className="vrfeed">
            <div className="vrav" style={{ background: mColor }}>{mentor?.initials ?? "M"}</div>
            <div className="vrnl">{mentor?.name ?? "Demo Mentor"}</div>
            <div className="vrcl">Mentor · {profile.school.name}</div>
          </div>
          <div className="vrfeed">
            <div className="vrav" style={{ background: uColor }}>{profile.initials}</div>
            <div className="vrnl">{profile.name}</div>
            <div className="vrcl">Student · {profile.grade}</div>
          </div>
        </div>
        <div className="vrside">
          <div className="vrstabs">
            {(["whiteboard", "chat", "notes"] as const).map((t) => (
              <div key={t} className={`vrst ${sideTab === t ? "active" : ""}`} onClick={() => setSideTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </div>
            ))}
          </div>
          {sideTab === "whiteboard" && (
            <div className="vrwb">
              <span style={{ fontSize: "1.7rem" }}>✏️</span>
              <span>Shared Whiteboard</span>
              <span style={{ fontSize: "0.68rem", textAlign: "center", maxWidth: 160, color: C.muted }}>Draw and solve together</span>
            </div>
          )}
          {sideTab === "chat" && (
            <>
              <div className="vrchat">
                {chatMsgs.map((m, i) => (
                  <div key={i} className="vrcmsg"><strong>{m.from}</strong>{m.text}</div>
                ))}
              </div>
              <div className="vrcin">
                <input
                  className="vrcinput"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Message…"
                  onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }}
                />
                <button className="btn btn-primary btn-sm" onClick={sendChat}>↑</button>
              </div>
            </>
          )}
          {sideTab === "notes" && (
            <textarea
              className="vrnotes"
              placeholder="Your private session notes…"
              style={{ flex: 1, background: "transparent", border: "none", color: "#E2EAF6", resize: "none", padding: "12px", fontSize: "0.82rem" }}
            />
          )}
        </div>
      </div>
      <div className="vrfoot">
        <button className="vrbtn vrbtn-end" onClick={onLeave}>End Session</button>
      </div>
    </div>
  );
}
