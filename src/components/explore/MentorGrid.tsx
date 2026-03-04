"use client";
import { useState } from "react";
import { useMentors } from "@/hooks/useMentors";
import StatsStrip from "./StatsStrip";
import MentorCard from "./MentorCard";
import type { MentorProfile, UserProfile } from "@/types";

interface Props {
  profile: UserProfile;
  onBook: (m: MentorProfile) => void;
  onDemo: (m: MentorProfile) => void;
  onBrowseCourses: () => void;
}

export default function MentorGrid({ profile, onBook, onDemo, onBrowseCourses }: Props) {
  const [search, setSearch] = useState("");
  const { mentors, loading } = useMentors(profile.school.id, search);

  return (
    <div className="page">
      <div className="page-hero">
        <div className="sch-banner">
          <span>{profile.school.emoji}</span>
          <p>Mentors from <strong>{profile.school.name}</strong> · {profile.school.city} · DPCDSB</p>
        </div>
        <h1 className="ph1">Find a senior who<br /><em>took your course</em></h1>
        <p className="ph1-sub">
          Every mentor goes to {profile.school.name}. They know your teachers, your course codes, and exactly what DPCDSB exams look like.
        </p>
      </div>

      <StatsStrip mentors={mentors} />

      <div className="top-bar">
        <div className="sbox">
          <span style={{ color: "#637088" }}>🔍</span>
          <input
            placeholder="Search mentor name or course code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onBrowseCourses}>
          📋 Browse All Courses
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Loading mentors…</div>
      ) : mentors.length === 0 ? (
        <div className="empty-state">No mentors found{search ? ` for "${search}"` : ""}.</div>
      ) : (
        <div className="mgrid">
          {mentors.map((m) => (
            <MentorCard
              key={m.id}
              mentor={m}
              schoolName={profile.school.name}
              onBook={onBook}
              onDemo={onDemo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
