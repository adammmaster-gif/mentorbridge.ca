"use client";
import { useState } from "react";
import { COURSES, TYPE_COLOR } from "@/lib/constants";
import type { CourseEntry } from "@/types";

const GRADES = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];

interface Props {
  onSelect: (course: CourseEntry) => void;
  onClose: () => void;
  initialGrade?: string;
}

export default function CourseSelectorModal({ onSelect, onClose, initialGrade }: Props) {
  const [activeGrade, setActiveGrade] = useState(initialGrade ?? "Grade 12");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CourseEntry | null>(null);

  const gradeData = COURSES[activeGrade] ?? {};
  const totalCourses = Object.values(gradeData).flat().length;

  const filteredDepts = Object.entries(gradeData).reduce<Record<string, CourseEntry[]>>((acc, [dept, courses]) => {
    const filtered = courses.filter(
      (c) =>
        !search ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        dept.toLowerCase().includes(search.toLowerCase())
    );
    if (filtered.length) acc[dept] = filtered;
    return acc;
  }, {});

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="course-modal">
        <div className="cm-header">
          <h2>Select a Course</h2>
          <p className="cm-sub">
            All Ontario Ministry of Education courses, Grades 9–12 · {totalCourses} courses in {activeGrade}
          </p>
        </div>
        <div className="cm-grade-tabs">
          {GRADES.map((g) => (
            <button
              key={g}
              className={`grade-tab ${activeGrade === g ? "active" : ""}`}
              onClick={() => { setActiveGrade(g); setSearch(""); setSelected(null); }}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="cm-search-bar">
          <div className="cm-search-wrap">
            <span className="cm-search-ico">🔍</span>
            <input
              className="cm-search"
              placeholder="Search by course code or name (e.g. MCV4U, Biology, French)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="cm-body">
          {Object.entries(filteredDepts).length === 0 ? (
            <div className="empty-state" style={{ padding: "32px" }}>No courses found for "{search}"</div>
          ) : (
            Object.entries(filteredDepts).map(([dept, courses]) => (
              <div key={dept} className="dept-section">
                <div className="dept-title">{dept}</div>
                <div className="course-grid">
                  {courses.map((c) => {
                    const tc = TYPE_COLOR[c.type] ?? "#6B7A99";
                    return (
                      <div
                        key={c.code}
                        className={`course-row ${selected?.code === c.code ? "sel" : ""}`}
                        onClick={() => setSelected(c)}
                      >
                        <span className="course-code">{c.code}</span>
                        <span className="course-name">
                          {c.name.replace(` (${c.type})`, "").replace(` (${c.type.split("/")[0]})`, "")}
                        </span>
                        <span
                          className="type-badge"
                          style={{ background: `${tc}18`, color: tc, border: `1px solid ${tc}30` }}
                        >
                          {c.type}
                        </span>
                        {selected?.code === c.code && <span style={{ color: "#22D4C0", fontSize: "1rem" }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="cm-footer">
          <div className="sel-course-preview">
            {selected
              ? <><strong>{selected.code}</strong> — {selected.name.split(" (")[0]}</>
              : <span>Select a course above</span>}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-primary btn-sm"
              disabled={!selected}
              onClick={() => selected && onSelect(selected)}
            >
              Confirm Course →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
