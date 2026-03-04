"use client";
import { useState, useEffect } from "react";
import { AV_COLORS, COURSES } from "@/lib/constants";
import type { QuizDTO, QuizDetailDTO, QuizAttemptDTO, UserProfile } from "@/types";
import { format } from "date-fns";

interface Props {
  profile: UserProfile;
  userId: number;
}

interface QuestionDraft {
  questionText: string;
  options: [string, string, string, string];
  correctAnswer: string; // "0" | "1" | "2" | "3"
  explanation: string;
}

type LearnerView = "browse" | "taking" | "results";

const ALL_COURSES = Object.values(COURSES)
  .flatMap((subjects) => Object.values(subjects))
  .flat()
  .map((c) => ({ code: c.code, name: c.name.split(" (")[0] }));

function getCourseName(code: string) {
  return ALL_COURSES.find((c) => c.code === code)?.name ?? code;
}

function blankQuestion(): QuestionDraft {
  return { questionText: "", options: ["", "", "", ""], correctAnswer: "0", explanation: "" };
}

export default function QuizTab({ profile, userId }: Props) {
  const [quizzes, setQuizzes] = useState<QuizDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Mentor create form
  const [showForm, setShowForm] = useState(false);
  const [fCourse, setFCourse] = useState("");
  const [fCourseSearch, setFCourseSearch] = useState("");
  const [fTitle, setFTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([blankQuestion()]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  // Learner quiz-taking
  const [learnerView, setLearnerView] = useState<LearnerView>("browse");
  const [activeQuiz, setActiveQuiz] = useState<QuizDetailDTO | null>(null);
  const [activeAttemptId, setActiveAttemptId] = useState<number | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [takingSubmitting, setTakingSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptDTO | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  async function loadQuizzes() {
    setLoading(true);
    const res = await fetch(`/api/quizzes?schoolId=${profile.school.id}`);
    if (res.ok) setQuizzes(await res.json());
    setLoading(false);
  }

  // ── Mentor: question builder helpers ────────────────────────────────────────

  function updateQuestion(i: number, patch: Partial<QuestionDraft>) {
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }

  function updateOption(qi: number, oi: number, val: string) {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qi) return q;
        const opts = [...q.options] as [string, string, string, string];
        opts[oi] = val;
        return { ...q, options: opts };
      })
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, blankQuestion()]);
  }

  function removeQuestion(i: number) {
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleCreate() {
    if (!fCourse || !fTitle.trim()) { setFormError("Course and title are required."); return; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) { setFormError(`Question ${i + 1} needs text.`); return; }
      if (q.options.some((o) => !o.trim())) { setFormError(`All 4 options in question ${i + 1} must be filled.`); return; }
    }
    setFormError("");
    setSubmitting(true);
    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentorId: userId,
        schoolId: profile.school.id,
        courseCode: fCourse,
        courseName: getCourseName(fCourse),
        title: fTitle.trim(),
        questions,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setFormError((err as { error?: string }).error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }
    const newQuiz: QuizDTO = await res.json();
    setQuizzes([newQuiz, ...quizzes]);
    setShowForm(false);
    setFCourse(""); setFCourseSearch(""); setFTitle("");
    setQuestions([blankQuestion()]);
    setSubmitting(false);
  }

  async function handleDelete(quizId: number) {
    setDeleting(quizId);
    await fetch(`/api/quizzes/${quizId}?mentorId=${userId}`, { method: "DELETE" });
    setQuizzes(quizzes.filter((q) => q.id !== quizId));
    setDeleting(null);
  }

  // ── Learner: take quiz ───────────────────────────────────────────────────────

  async function handleTakeQuiz(quizId: number) {
    const [detailRes, startRes] = await Promise.all([
      fetch(`/api/quizzes/${quizId}`),
      fetch(`/api/quizzes/${quizId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learnerId: userId }),
      }),
    ]);
    if (!detailRes.ok || !startRes.ok) return;
    const detail: QuizDetailDTO = await detailRes.json();
    const attempt: QuizAttemptDTO = await startRes.json();
    setActiveQuiz(detail);
    setActiveAttemptId(attempt.id);
    setResponses({});
    setResult(null);
    setLearnerView("taking");
  }

  async function handleSubmit() {
    if (!activeQuiz || !activeAttemptId) return;
    setTakingSubmitting(true);
    const res = await fetch(`/api/quizzes/${activeQuiz.id}/attempts/${activeAttemptId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses, learnerId: userId }),
    });
    if (!res.ok) { setTakingSubmitting(false); return; }
    const data: QuizAttemptDTO = await res.json();
    setResult(data);
    setLearnerView("results");
    setTakingSubmitting(false);
  }

  // ── Filters ──────────────────────────────────────────────────────────────────

  const filtered = quizzes.filter((q) => {
    const s = search.toLowerCase();
    return !s || q.courseCode.toLowerCase().includes(s) || q.title.toLowerCase().includes(s) || q.mentorName.toLowerCase().includes(s);
  });

  const myQuizzes = filtered.filter((q) => q.mentorId === userId);

  const grouped: Record<string, QuizDTO[]> = {};
  for (const q of filtered) {
    if (!grouped[q.courseCode]) grouped[q.courseCode] = [];
    grouped[q.courseCode].push(q);
  }

  const courseSuggestions = fCourseSearch.length >= 1
    ? ALL_COURSES.filter((c) =>
        c.code.toLowerCase().includes(fCourseSearch.toLowerCase()) ||
        c.name.toLowerCase().includes(fCourseSearch.toLowerCase())
      ).slice(0, 8)
    : [];

  const allAnswered = activeQuiz
    ? activeQuiz.questions.every((q) => responses[String(q.id)] !== undefined)
    : false;

  return (
    <div className="page">

      {/* ── Header ── */}
      <div className="page-hero">
        <div className="sch-banner">
          <span>{profile.school.emoji}</span>
          <p>{profile.school.name}</p>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 className="ph1">🧠 Practice <em>Quizzes</em></h1>
            <p className="ph1-sub">
              {profile.role === "mentor"
                ? "Create practice quizzes for students. Write your own questions and answer choices."
                : "Test your knowledge with quizzes created by your mentors."}
            </p>
          </div>
          {profile.role === "mentor" && (
            <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setFormError(""); }}>
              {showForm ? "✕ Cancel" : "+ Create Quiz"}
            </button>
          )}
          {profile.role === "learner" && learnerView !== "browse" && (
            <button className="btn btn-ghost" onClick={() => setLearnerView("browse")}>← Back</button>
          )}
        </div>
      </div>

      {/* ── Mentor: Create Quiz Form ── */}
      {showForm && profile.role === "mentor" && (
        <div className="sn-form">
          <div className="sn-form-title">New Quiz</div>

          {/* Course */}
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

          {/* Title */}
          <div className="form-row">
            <label className="form-lbl">Quiz Title</label>
            <input
              className="form-input"
              placeholder="e.g. Unit 2 Review — Quadratic Functions"
              value={fTitle}
              onChange={(e) => setFTitle(e.target.value)}
            />
          </div>

          {/* Questions */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <label className="form-lbl" style={{ margin: 0 }}>Questions ({questions.length})</label>
              <button className="btn btn-ghost btn-sm" onClick={addQuestion}>+ Add Question</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {questions.map((q, qi) => (
                <div key={qi} style={{ background: "#111928", borderRadius: 12, padding: "16px 16px 12px", border: "1px solid #1A2A40" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#637088", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                      Question {qi + 1}
                    </span>
                    {questions.length > 1 && (
                      <button className="btn btn-danger btn-sm" onClick={() => removeQuestion(qi)}>Remove</button>
                    )}
                  </div>

                  <input
                    className="form-input"
                    placeholder="Question text…"
                    value={q.questionText}
                    onChange={(e) => updateQuestion(qi, { questionText: e.target.value })}
                    style={{ marginBottom: 10 }}
                  />

                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}>
                    {q.options.map((opt, oi) => (
                      <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="radio"
                          name={`correct_${qi}`}
                          checked={q.correctAnswer === String(oi)}
                          onChange={() => updateQuestion(qi, { correctAnswer: String(oi) })}
                          title="Mark as correct answer"
                          style={{ accentColor: "#22D4C0", flexShrink: 0 }}
                        />
                        <span style={{ fontSize: "0.78rem", color: "#637088", fontWeight: 700, width: 18, flexShrink: 0 }}>
                          {String.fromCharCode(65 + oi)}.
                        </span>
                        <input
                          className="form-input"
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                          style={{ flex: 1 }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#637088", marginBottom: 8 }}>
                    ● Select the radio button next to the correct answer
                  </div>

                  <input
                    className="form-input"
                    placeholder="Explanation (optional) — shown to students after they answer"
                    value={q.explanation}
                    onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>

          {formError && <p style={{ color: "#FF4D6D", fontSize: "0.85rem", marginBottom: 12 }}>{formError}</p>}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              disabled={!fCourse || !fTitle.trim() || questions.length === 0 || submitting}
              onClick={handleCreate}
            >
              {submitting ? "Saving…" : "Save Quiz →"}
            </button>
          </div>
        </div>
      )}

      {/* ── Learner: Taking Quiz ── */}
      {profile.role === "learner" && learnerView === "taking" && activeQuiz && (
        <div className="sn-form" style={{ maxWidth: 720 }}>
          <div style={{ marginBottom: 20 }}>
            <div className="sn-form-title" style={{ marginBottom: 6 }}>{activeQuiz.title}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="sn-code-badge">{activeQuiz.courseCode}</span>
              <span style={{ color: "#637088", fontSize: "0.8rem" }}>
                {Object.keys(responses).length} / {activeQuiz.questions.length} answered
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {activeQuiz.questions.map((q, i) => (
              <div key={q.id} style={{ background: "#111928", borderRadius: 12, padding: "16px 18px", border: "1px solid #1A2A40" }}>
                <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 12, color: "#E2EAF6", lineHeight: 1.5 }}>
                  <span style={{ color: "#637088", marginRight: 8 }}>{i + 1}.</span>
                  {q.questionText}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {q.options.map((opt, idx) => {
                    const sel = responses[String(q.id)] === String(idx);
                    return (
                      <label
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          padding: "9px 13px",
                          borderRadius: 8,
                          border: `1.5px solid ${sel ? "#22D4C0" : "#1A2A40"}`,
                          background: sel ? "rgba(34,212,192,0.08)" : "transparent",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          fontSize: "0.87rem",
                          color: "#E2EAF6",
                          lineHeight: 1.5,
                        }}
                      >
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value={String(idx)}
                          checked={sel}
                          onChange={() => setResponses({ ...responses, [String(q.id)]: String(idx) })}
                          style={{ marginTop: 2, accentColor: "#22D4C0", flexShrink: 0 }}
                        />
                        <span>
                          <strong style={{ color: "#637088", marginRight: 6 }}>{String.fromCharCode(65 + idx)}.</strong>
                          {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
            <button className="btn btn-ghost" onClick={() => setLearnerView("browse")}>Cancel</button>
            <button
              className="btn btn-primary"
              disabled={!allAnswered || takingSubmitting}
              onClick={handleSubmit}
            >
              {takingSubmitting ? "Submitting…" : "Submit →"}
            </button>
          </div>
        </div>
      )}

      {/* ── Learner: Results ── */}
      {profile.role === "learner" && learnerView === "results" && result && activeQuiz && (
        <div style={{ maxWidth: 720 }}>
          <div className="sn-form" style={{ marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 8 }}>
              {result.score >= 80 ? "🎉" : result.score >= 60 ? "👍" : "📚"}
            </div>
            <div style={{
              fontFamily: "'Clash Display',sans-serif",
              fontSize: "2.2rem",
              fontWeight: 700,
              color: result.score >= 80 ? "#22D4C0" : result.score >= 60 ? "#FFBA08" : "#FF4D6D",
              marginBottom: 4,
            }}>
              {Math.round(result.score)}%
            </div>
            <div style={{ color: "#637088", fontSize: "0.88rem", marginBottom: 16 }}>
              {result.correctAnswers} of {result.totalQuestions} correct
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => handleTakeQuiz(activeQuiz.id)}>
                Retry Quiz
              </button>
              <button className="btn btn-ghost" onClick={() => setLearnerView("browse")}>
                Back to Quizzes
              </button>
            </div>
          </div>

          <div className="slist-label" style={{ marginBottom: 10 }}>Answer Review</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activeQuiz.questions.map((q, i) => {
              const given = result.responses[String(q.id)];
              const correct = q.correctAnswer;
              const isRight = given === correct;
              return (
                <div key={q.id} style={{
                  background: "#0D1219",
                  borderRadius: 12,
                  padding: "16px 18px",
                  border: `1.5px solid ${isRight ? "rgba(34,212,192,0.3)" : "rgba(255,77,109,0.3)"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{isRight ? "✅" : "❌"}</span>
                    <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "#E2EAF6", lineHeight: 1.5 }}>
                      <span style={{ color: "#637088", marginRight: 6 }}>{i + 1}.</span>
                      {q.questionText}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, marginLeft: 30 }}>
                    {q.options.map((opt, idx) => {
                      const isCorrect = String(idx) === correct;
                      const isGiven = String(idx) === given;
                      return (
                        <div key={idx} style={{
                          padding: "6px 11px",
                          borderRadius: 7,
                          fontSize: "0.84rem",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: isCorrect ? "rgba(34,212,192,0.1)" : isGiven && !isCorrect ? "rgba(255,77,109,0.1)" : "transparent",
                          color: isCorrect ? "#22D4C0" : isGiven && !isCorrect ? "#FF4D6D" : "#637088",
                        }}>
                          <strong style={{ minWidth: 18 }}>{String.fromCharCode(65 + idx)}.</strong>
                          {opt}
                          {isCorrect && <span style={{ marginLeft: "auto" }}>✓ Correct</span>}
                          {isGiven && !isCorrect && <span style={{ marginLeft: "auto" }}>✗ Your answer</span>}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div style={{ marginTop: 10, marginLeft: 30, fontSize: "0.81rem", color: "#637088", lineHeight: 1.6, borderLeft: "2px solid #1A2A40", paddingLeft: 10 }}>
                      <strong style={{ color: "#A8B8D0" }}>Note: </strong>{q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Browse / list ── */}
      {learnerView === "browse" && (
        <>
          {!showForm && (
            <div style={{ marginBottom: 20 }}>
              <input
                className="form-input"
                placeholder="🔍 Search by course, title, or mentor…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 420 }}
              />
            </div>
          )}

          {loading && <div className="empty-state">Loading quizzes…</div>}

          {/* Mentor: their quizzes */}
          {!loading && profile.role === "mentor" && !showForm && (
            myQuizzes.length === 0
              ? <div className="empty-state">No quizzes yet — create one for your students!</div>
              : (
                <section>
                  <div className="slist-label">My Quizzes</div>
                  <div className="sn-grid">
                    {myQuizzes.map((q) => (
                      <QuizCard key={q.id} quiz={q} canDelete deleting={deleting === q.id} onDelete={() => handleDelete(q.id)} />
                    ))}
                  </div>
                </section>
              )
          )}

          {/* Learner: grouped by course */}
          {!loading && profile.role === "learner" && (
            filtered.length === 0
              ? <div className="empty-state">No quizzes available yet. Check back after your mentors post some!</div>
              : Object.entries(grouped).map(([code, courseQuizzes]) => (
                <section key={code} style={{ marginBottom: 32 }}>
                  <div className="slist-label">
                    <span className="sn-code-badge">{code}</span> {courseQuizzes[0].courseName}
                  </div>
                  <div className="sn-grid">
                    {courseQuizzes.map((q) => (
                      <QuizCard key={q.id} quiz={q} onTake={() => handleTakeQuiz(q.id)} />
                    ))}
                  </div>
                </section>
              ))
          )}
        </>
      )}
    </div>
  );
}

interface QuizCardProps {
  quiz: QuizDTO;
  canDelete?: boolean;
  deleting?: boolean;
  onDelete?: () => void;
  onTake?: () => void;
}

function QuizCard({ quiz, canDelete, deleting, onDelete, onTake }: QuizCardProps) {
  const color = AV_COLORS[quiz.mentorAvatarColor] ?? "#22D4C0";
  const date = format(new Date(quiz.createdAt), "MMM d, yyyy");

  return (
    <div className="sn-card">
      <div className="sn-card-header">
        <div className="sn-card-meta">
          <span className="sn-code-badge">{quiz.courseCode}</span>
          <span className="sn-card-title">{quiz.title}</span>
        </div>
        <div className="sn-card-right">
          <div className="sn-mentor-row">
            <div className="sn-av" style={{ background: color }}>{quiz.mentorInitials}</div>
            <span className="sn-mentor-name">{quiz.mentorName}</span>
          </div>
          <span className="sn-date">{quiz.questionCount}Q</span>
          <span className="sn-date">{date}</span>
          {onTake && (
            <button className="btn btn-primary btn-sm" onClick={onTake}>Take Quiz →</button>
          )}
          {canDelete && (
            <button className="btn btn-danger btn-sm" onClick={onDelete} disabled={deleting}>
              {deleting ? "…" : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
