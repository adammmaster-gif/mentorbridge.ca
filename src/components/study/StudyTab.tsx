"use client";
import { useState, useEffect } from "react";
import { AV_COLORS, COURSES } from "@/lib/constants";
import type { StudyNote, UserProfile } from "@/types";
import { format } from "date-fns";

interface Props {
  profile: UserProfile;
  userId: number;
}

// Flatten COURSES into a searchable list of {code, name}
const ALL_COURSES = Object.values(COURSES)
  .flatMap((subjects) => Object.values(subjects))
  .flat()
  .map((c) => ({ code: c.code, name: c.name.split(" (")[0] }));

function getCourseName(code: string) {
  return ALL_COURSES.find((c) => c.code === code)?.name ?? code;
}

export default function StudyTab({ profile, userId }: Props) {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Form state (mentor only)
  const [fCourse, setFCourse] = useState("");
  const [fCourseSearch, setFCourseSearch] = useState("");
  const [fTitle, setFTitle] = useState("");
  const [fContent, setFContent] = useState("");
  const [fSubmitting, setFSubmitting] = useState(false);
  const [fError, setFError] = useState("");

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    setLoading(true);
    const res = await fetch(`/api/study-notes?schoolId=${profile.school.id}`);
    if (res.ok) setNotes(await res.json());
    setLoading(false);
  }

  async function handlePost() {
    if (!fCourse || !fTitle.trim() || !fContent.trim()) return;
    setFSubmitting(true);
    setFError("");
    const courseName = getCourseName(fCourse);
    const res = await fetch("/api/study-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentorId: userId,
        schoolId: profile.school.id,
        courseCode: fCourse,
        courseName,
        title: fTitle.trim(),
        content: fContent.trim(),
      }),
    });
    if (!res.ok) {
      setFError("Something went wrong. Try again.");
      setFSubmitting(false);
      return;
    }
    const newNote = await res.json();
    setNotes([newNote, ...notes]);
    setFCourse("");
    setFCourseSearch("");
    setFTitle("");
    setFContent("");
    setShowForm(false);
    setFSubmitting(false);
  }

  async function handleDelete(noteId: number) {
    setDeleting(noteId);
    await fetch(`/api/study-notes/${noteId}?mentorId=${userId}`, { method: "DELETE" });
    setNotes(notes.filter((n) => n.id !== noteId));
    setDeleting(null);
  }

  const filteredNotes = notes.filter((n) => {
    const q = search.toLowerCase();
    return !q || n.courseCode.toLowerCase().includes(q) || n.courseName.toLowerCase().includes(q) || n.title.toLowerCase().includes(q) || n.mentorName.toLowerCase().includes(q);
  });

  // Group by courseCode for student view
  const grouped: Record<string, StudyNote[]> = {};
  for (const n of filteredNotes) {
    if (!grouped[n.courseCode]) grouped[n.courseCode] = [];
    grouped[n.courseCode].push(n);
  }

  // Mentor's own notes for the "My Notes" section
  const myNotes = filteredNotes.filter((n) => n.mentorId === userId);
  const otherNotes = filteredNotes.filter((n) => n.mentorId !== userId);

  // Filtered course suggestions for the form
  const courseSuggestions = fCourseSearch.length >= 1
    ? ALL_COURSES.filter((c) =>
        c.code.toLowerCase().includes(fCourseSearch.toLowerCase()) ||
        c.name.toLowerCase().includes(fCourseSearch.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <div className="page">
      {/* Header */}
      <div className="page-hero">
        <div className="sch-banner">
          <span>{profile.school.emoji}</span>
          <p>{profile.school.name}</p>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 className="ph1">📖 Study <em>Notes</em></h1>
            <p className="ph1-sub">
              {profile.role === "mentor"
                ? "Share your knowledge — post study guides, notes, and tips for the courses you've taken."
                : "Explore study guides and notes posted by mentors at your school."}
            </p>
          </div>
          {profile.role === "mentor" && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? "✕ Cancel" : "+ Post Note"}
            </button>
          )}
        </div>
      </div>

      {/* Post Note Form (mentor only) */}
      {showForm && profile.role === "mentor" && (
        <div className="sn-form">
          <div className="sn-form-title">New Study Note</div>

          {/* Course selector */}
          <div className="form-row" style={{ position: "relative" }}>
            <label className="form-lbl">Course</label>
            {fCourse ? (
              <div className="sn-course-sel">
                <span className="sn-course-code">{fCourse}</span>
                <span className="sn-course-name">{getCourseName(fCourse)}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => { setFCourse(""); setFCourseSearch(""); }}>Change</button>
              </div>
            ) : (
              <>
                <input
                  className="form-input"
                  placeholder="Search by course code or name…"
                  value={fCourseSearch}
                  onChange={(e) => setFCourseSearch(e.target.value)}
                  autoFocus
                />
                {courseSuggestions.length > 0 && (
                  <div className="sn-suggest">
                    {courseSuggestions.map((c) => (
                      <div key={c.code} className="sn-suggest-item" onClick={() => { setFCourse(c.code); setFCourseSearch(""); }}>
                        <span className="sn-course-code">{c.code}</span>
                        <span className="sn-suggest-name">{c.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="form-row">
            <label className="form-lbl">Title</label>
            <input
              className="form-input"
              placeholder="e.g. Unit 3 — Quadratic Functions Summary"
              value={fTitle}
              onChange={(e) => setFTitle(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label className="form-lbl">Content</label>
            <textarea
              className="form-input"
              placeholder="Write your notes here… (supports plain text)"
              value={fContent}
              onChange={(e) => setFContent(e.target.value)}
              rows={8}
              style={{ resize: "vertical", lineHeight: 1.7 }}
            />
          </div>

          {fError && <p style={{ color: "#FF4D6D", fontSize: "0.85rem", marginBottom: 12 }}>{fError}</p>}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              disabled={!fCourse || !fTitle.trim() || !fContent.trim() || fSubmitting}
              onClick={handlePost}
            >
              {fSubmitting ? "Posting…" : "Post Note →"}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          className="form-input"
          placeholder="🔍 Search by course, title, or mentor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 420 }}
        />
      </div>

      {loading && <div className="empty-state">Loading notes…</div>}

      {!loading && filteredNotes.length === 0 && (
        <div className="empty-state">
          {profile.role === "mentor"
            ? "No notes yet — be the first to share your knowledge!"
            : "No study notes posted yet. Check back later!"}
        </div>
      )}

      {/* Mentor view: My Notes + Other Notes */}
      {!loading && profile.role === "mentor" && filteredNotes.length > 0 && (
        <>
          {myNotes.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <div className="slist-label">My Notes</div>
              <div className="sn-grid">
                {myNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    expanded={expandedId === note.id}
                    onToggle={() => setExpandedId(expandedId === note.id ? null : note.id)}
                    canDelete
                    deleting={deleting === note.id}
                    onDelete={() => handleDelete(note.id)}
                  />
                ))}
              </div>
            </section>
          )}
          {otherNotes.length > 0 && (
            <section>
              <div className="slist-label">All School Notes</div>
              <div className="sn-grid">
                {otherNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    expanded={expandedId === note.id}
                    onToggle={() => setExpandedId(expandedId === note.id ? null : note.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Student view: grouped by course */}
      {!loading && profile.role === "learner" && filteredNotes.length > 0 && (
        <>
          {Object.entries(grouped).map(([code, courseNotes]) => (
            <section key={code} style={{ marginBottom: 32 }}>
              <div className="slist-label">
                <span className="sn-code-badge">{code}</span> {courseNotes[0].courseName}
              </div>
              <div className="sn-grid">
                {courseNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    expanded={expandedId === note.id}
                    onToggle={() => setExpandedId(expandedId === note.id ? null : note.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}

interface NoteCardProps {
  note: StudyNote;
  expanded: boolean;
  onToggle: () => void;
  canDelete?: boolean;
  deleting?: boolean;
  onDelete?: () => void;
}

function NoteCard({ note, expanded, onToggle, canDelete, deleting, onDelete }: NoteCardProps) {
  const color = AV_COLORS[note.mentorAvatarColor] ?? "#22D4C0";
  const date = format(new Date(note.createdAt), "MMM d, yyyy");

  return (
    <div className={`sn-card ${expanded ? "expanded" : ""}`}>
      <div className="sn-card-header" onClick={onToggle}>
        <div className="sn-card-meta">
          <span className="sn-code-badge">{note.courseCode}</span>
          <span className="sn-card-title">{note.title}</span>
        </div>
        <div className="sn-card-right">
          <div className="sn-mentor-row">
            <div className="sn-av" style={{ background: color }}>{note.mentorInitials}</div>
            <span className="sn-mentor-name">{note.mentorName}</span>
          </div>
          <span className="sn-date">{date}</span>
          <span className="sn-chevron">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="sn-content">
          <pre className="sn-pre">{note.content}</pre>
          {canDelete && (
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn-danger btn-sm"
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete Note"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
