"use client";
import { AV_COLORS } from "@/lib/constants";
import type { MentorProfile } from "@/types";

interface Props {
  mentor: MentorProfile;
  schoolName: string;
  onBook: (m: MentorProfile) => void;
  onDemo: (m: MentorProfile) => void;
}

export default function MentorCard({ mentor, schoolName, onBook, onDemo }: Props) {
  const color = AV_COLORS[mentor.avatarColor] ?? "#22D4C0";

  return (
    <div className="mc">
      <div className="mc-top">
        <div className="mc-av" style={{ background: color }}>{mentor.initials}</div>
        <div>
          <div className="mc-nm">{mentor.name}</div>
          <div className="mc-yr">{mentor.year}</div>
          <div className="mc-schl">{schoolName}</div>
        </div>
      </div>
      <div className="tags">
        {mentor.subjects.map((s) => <span key={s} className="tag">{s}</span>)}
      </div>
      <p className="mc-bio">{mentor.bio}</p>
      <div className="mc-foot">
        <span className="mc-rat">★ {mentor.rating}</span>
        <span className="mc-ct">{mentor.sessions} sessions</span>
      </div>
      <div className="av-row2">
        <div className={`dot ${mentor.available ? "dot-g" : "dot-r"}`} />
        {mentor.available ? "Available this week" : "Fully booked"}
      </div>
      <div className="mc-btns">
        <button
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
          disabled={!mentor.available}
          onClick={() => onBook(mentor)}
        >
          {mentor.available ? "Book Session" : "Unavailable"}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onDemo(mentor)}>
          ▶ Demo
        </button>
      </div>
    </div>
  );
}
