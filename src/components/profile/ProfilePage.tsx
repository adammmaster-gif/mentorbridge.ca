"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AV_COLORS } from "@/lib/constants";
import SubjectEditor from "@/components/mentor/SubjectEditor";
import type { HoursData, UserProfile } from "@/types";

interface Props {
  profile: UserProfile;
  userId: number;
  hoursData: HoursData | null;
  onShowToast: (msg: string) => void;
}

export default function ProfilePage({ profile, userId, hoursData, onShowToast }: Props) {
  const router  = useRouter();
  const uColor  = AV_COLORS[profile.avatarColor] ?? "#22D4C0";
  const slug    = profile.name.toLowerCase().replace(/ /g, "-");
  const shareUrl = `mentorbridge.ca/dpcdsb/${profile.school.id}/${slug}`;

  // Bio editor state (mentor only)
  const [bio,        setBio]        = useState("");
  const [bioEditing, setBioEditing] = useState(false);
  const [bioSaving,  setBioSaving]  = useState(false);

  useEffect(() => {
    if (profile.role !== "mentor") return;
    fetch(`/api/mentors/me?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => setBio(d.bio ?? ""))
      .catch(() => {});
  }, [userId, profile.role]);

  async function saveBio() {
    setBioSaving(true);
    const res = await fetch(`/api/mentors/me?userId=${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjects: [], bio }),
    });
    // Re-fetch subjects so we don't lose them — patch sent empty array which would wipe subjects
    // Instead, fetch current subjects first then patch with bio
    setBioSaving(false);
    if (res.ok) { setBioEditing(false); onShowToast("✅ Bio updated!"); }
  }

  async function saveBioOnly() {
    setBioSaving(true);
    // Fetch current subjects first so we don't wipe them
    const meRes = await fetch(`/api/mentors/me?userId=${userId}`);
    const me = meRes.ok ? await meRes.json() : { subjects: [] };
    const res = await fetch(`/api/mentors/me?userId=${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjects: me.subjects ?? [], bio }),
    });
    setBioSaving(false);
    if (res.ok) { setBioEditing(false); onShowToast("✅ Bio updated!"); }
  }

  function copyLink() {
    navigator.clipboard.writeText(`https://${shareUrl}`)
      .then(() => onShowToast("🔗 Link copied to clipboard!"))
      .catch(() => onShowToast("🔗 Copy: " + shareUrl));
  }

  function handleLogout() {
    localStorage.removeItem("mb_user_id");
    localStorage.removeItem("mb_profile");
    router.replace("/onboard");
  }

  return (
    <div className="page">
      <div style={{ paddingTop: "28px" }}>

        {/* Hero */}
        <div className="prof-hero">
          <div className="prof-av" style={{ background: uColor }}>{profile.initials}</div>
          <div className="prof-info">
            <h2>{profile.name}</h2>
            <p>{profile.grade} · {profile.school.name} · DPCDSB</p>
            <div className="tags">
              <span className="tag">DPCDSB</span>
              <span className="tag-am tag">{profile.role === "mentor" ? "Mentor" : "Student"}</span>
            </div>
          </div>
          <div className="prof-stats">
            <div>
              <div className="ps-n">{hoursData?.totalHours ?? "0.0"}</div>
              <div className="ps-l">{profile.role === "mentor" ? "Hours" : "Hrs tracked"}</div>
            </div>
            <div>
              <div className="ps-n">{hoursData?.log.length ?? 0}</div>
              <div className="ps-l">Sessions</div>
            </div>
          </div>
        </div>

        {/* Bio editor — mentor only */}
        {profile.role === "mentor" && (
          <div className="pp" style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <div className="ppt" style={{ marginBottom: 0 }}>My Bio</div>
              {!bioEditing && (
                <button className="btn btn-ghost btn-sm" onClick={() => setBioEditing(true)}>Edit</button>
              )}
            </div>
            {bioEditing ? (
              <>
                <textarea
                  className="form-input"
                  rows={3}
                  style={{ width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
                  placeholder="Tell students about yourself — your grade, strong subjects, tutoring style…"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button className="btn btn-primary btn-sm" disabled={bioSaving} onClick={saveBioOnly}>
                    {bioSaving ? "Saving…" : "Save Bio"}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setBioEditing(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <p style={{ color: bio ? "#A8B8D0" : "#637088", fontSize: "0.84rem", lineHeight: 1.55 }}>
                {bio || "No bio yet — click Edit to add one."}
              </p>
            )}
          </div>
        )}

        <div className="prof-grid" style={{ marginTop: "20px" }}>
          {/* Shareable profile — mentor only */}
          {profile.role === "mentor" && (
            <div className="pp">
              <div className="ppt">Shareable Profile</div>
              <div className="surl">{shareUrl}</div>
              <button className="btn btn-primary btn-sm btn-full" style={{ marginBottom: "7px" }} onClick={copyLink}>
                Copy Link
              </button>
              <button className="btn btn-amber btn-sm btn-full" onClick={() => onShowToast("📄 OSSD Certificate exported!")}>
                Export OSSD Certificate
              </button>
            </div>
          )}

          {/* Account info — everyone */}
          <div className="pp">
            <div className="ppt">Account</div>
            <div className="avrow"><span>Name</span><span className="avt">{profile.name}</span></div>
            <div className="avrow"><span>School</span><span className="avt">{profile.school.name}</span></div>
            <div className="avrow"><span>Grade</span><span className="avt">{profile.grade}</span></div>
            <div className="avrow"><span>Role</span><span className="avt" style={{ textTransform: "capitalize" }}>{profile.role}</span></div>
          </div>
        </div>

        {/* Courses I Can Teach — mentor only */}
        {profile.role === "mentor" && (
          <div className="pp" style={{ marginTop: "20px" }}>
            <div className="ppt">Courses I Can Teach</div>
            <SubjectEditor userId={userId} onSaved={() => onShowToast("✅ Courses updated!")} />
          </div>
        )}

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <button className="btn btn-ghost btn-sm" style={{ color: "#FF4D6D", borderColor: "#FF4D6D" }} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
