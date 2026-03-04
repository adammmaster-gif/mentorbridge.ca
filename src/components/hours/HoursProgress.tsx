"use client";
import type { HoursData, UserProfile } from "@/types";

interface Props {
  data: HoursData;
  profile: UserProfile;
  onExport: () => void;
}

export default function HoursProgress({ data, profile, onExport }: Props) {
  const remaining   = Math.max(0, 40 - Number(data.totalHours)).toFixed(1);
  const isEligible  = Number(data.totalHours) >= 40;
  const isHalfway   = Number(data.totalHours) >= 20;

  return (
    <div className="hp">
      <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", marginBottom: "16px" }}>
        <div className="hbig">{data.totalHours}</div>
        <div className="hsub">
          hours done<br />
          <span style={{ fontSize: "0.7rem" }}>Goal: 40 hrs · DPCDSB · {profile.school.name}</span>
        </div>
      </div>
      <div className="pt"><div className="pf" style={{ width: `${data.percentage}%` }} /></div>
      <div className="pl">
        <span>{data.totalHours} completed</span>
        <span>{isEligible ? "🎉 Goal reached!" : `${remaining} remaining`}</span>
      </div>
      {(isEligible || isHalfway) && (
        <div className="tags" style={{ marginTop: "13px" }}>
          {isEligible && <span className="tag">🏆 OSSD Eligible — 40 hrs reached</span>}
          {isHalfway && !isEligible && <span className="tag-am tag">⭐ Halfway there — keep going!</span>}
        </div>
      )}
    </div>
  );
}
