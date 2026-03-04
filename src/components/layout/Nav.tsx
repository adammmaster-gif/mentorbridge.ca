"use client";
import { useEffect, useState } from "react";
import { AV_COLORS, C } from "@/lib/constants";
import type { UserProfile } from "@/types";

type Tab = "overview" | "explore" | "sessions" | "calendar" | "hours" | "messages" | "study" | "quiz" | "profile";

const LABEL: Record<Tab, string> = {
  overview: "Overview",
  explore: "Explore",
  sessions: "Sessions",
  calendar: "Calendar",
  hours: "Hours",
  messages: "Messages",
  study: "Study",
  quiz: "Quizzes",
  profile: "Profile",
};

interface Props {
  tab: Tab;
  setTab: (t: Tab) => void;
  profile: UserProfile;
  totalHours: string;
  userId: number;
}

export default function Nav({ tab, setTab, profile, totalHours, userId }: Props) {
  const uColor = AV_COLORS[profile.avatarColor] ?? C.teal;
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      const res = await fetch(`/api/messages/unread?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUnread(data.count ?? 0);
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [userId]);

  const tabs: Tab[] = profile.role === "mentor"
    ? ["overview", "sessions", "calendar", "hours", "messages", "study", "quiz", "profile"]
    : ["explore", "sessions", "calendar", "messages", "study", "quiz", "profile"];

  return (
    <nav className="nav">
      <div className="nav-logo"><span>🍁</span>Mentor<em>Bridge</em></div>
      <div className="nav-tabs">
        {tabs.map((t) => (
          <button key={t} className={`nav-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {LABEL[t]}
            {t === "messages" && unread > 0 && (
              <span className="nav-badge">{unread}</span>
            )}
          </button>
        ))}
      </div>
      <div className="nav-right">
        <div className="sch-chip">
          <span>{profile.school.emoji}</span>
          <span className="sch-chip-nm">{profile.school.name}</span>
        </div>
        <div className="hrs-chip">⏱ {totalHours} hrs</div>
        <div className="uav" style={{ background: uColor }}>{profile.initials}</div>
      </div>
    </nav>
  );
}
