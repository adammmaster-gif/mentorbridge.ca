"use client";
import { useEffect, useState } from "react";
import type { School } from "@/types";

const CITIES = ["All Cities", "Mississauga", "Brampton", "Caledon"];

interface Props {
  school: School | null;
  onSelect: (s: School) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SchoolStep({ school, onSelect, onNext, onBack }: Props) {
  const [schools, setSchools] = useState<School[]>([]);
  const [cityFilter, setCityFilter] = useState("All Cities");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/schools")
      .then((r) => r.json())
      .then(setSchools);
  }, []);

  const filtered = schools.filter((s) => {
    const mc = cityFilter === "All Cities" || s.city === cityFilter;
    const ms = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  return (
    <div className="onboard">
      <div className="og" />
      <div className="og2" />
      <div className="logo"><span>🍁</span>Mentor<em>Bridge</em></div>
      <div className="ob-card">
        <div className="spill"><div className="sdot" /><span className="stxt">Step 2 of 3 — Select your school</span></div>
        <h1>Your <em>DPCDSB</em> school</h1>
        <p>All 26 Dufferin-Peel Catholic secondary schools — Mississauga, Brampton, and Caledon. You'll only see mentors from your own school.</p>
        <div className="city-tabs">
          {CITIES.map((c) => (
            <button key={c} className={`ct ${cityFilter === c ? "active" : ""}`} onClick={() => setCityFilter(c)}>{c}</button>
          ))}
        </div>
        <div className="sch-wrap">
          <span className="sch-ico">🔍</span>
          <input className="sch-in" placeholder="Search school name…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="sch-list">
          {filtered.map((s) => (
            <div key={s.id} className={`sch-item ${school?.id === s.id ? "sel" : ""}`} onClick={() => onSelect(s)}>
              <div className="sch-emo">{s.emoji}</div>
              <div className="sch-det">
                <h4>{s.name}</h4>
                <p>DPCDSB</p>
                <span className="city-badge">{s.city}</span>
              </div>
              {school?.id === s.id && <span className="chk">✓</span>}
            </div>
          ))}
        </div>
        <div className="ob-acts">
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
          <button className="btn btn-primary" disabled={!school} onClick={onNext}>Continue →</button>
        </div>
      </div>
    </div>
  );
}
