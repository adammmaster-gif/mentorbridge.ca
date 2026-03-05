"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/layout/Nav";
import MentorGrid from "@/components/explore/MentorGrid";
import MentorOverview from "@/components/mentor/MentorOverview";
import SessionList from "@/components/sessions/SessionList";
import HoursProgress from "@/components/hours/HoursProgress";
import HoursTable from "@/components/hours/HoursTable";
import ProfilePage from "@/components/profile/ProfilePage";
import CalendarTab from "@/components/calendar/CalendarTab";
import WaitlistPanel from "@/components/explore/WaitlistPanel";
import StudyGroupsSection from "@/components/explore/StudyGroupsSection";
import MessagesTab from "@/components/messages/MessagesTab";
import StudyTab from "@/components/study/StudyTab";
import QuizTab from "@/components/quiz/QuizTab";
import BookingModal from "@/components/modals/BookingModal";
import CourseSelectorModal from "@/components/modals/CourseSelectorModal";
import VideoRoom from "@/components/modals/VideoRoom";
import Toast from "@/components/ui/Toast";
import { useHours } from "@/hooks/useHours";
import type { MentorProfile, UserProfile } from "@/types";

type Tab = "overview" | "explore" | "sessions" | "calendar" | "hours" | "messages" | "study" | "quiz" | "profile";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("explore");
  const [booking, setBooking] = useState<MentorProfile | null>(null);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [inSession, setInSession] = useState(false);
  const [sessMentor, setSessMentor] = useState<MentorProfile | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data: hoursData } = useHours(userId);

  useEffect(() => {
    const id = localStorage.getItem("mb_user_id");
    const raw = localStorage.getItem("mb_profile");
    if (!id || !raw) {
      router.replace("/onboard");
      return;
    }
    const parsed: UserProfile = JSON.parse(raw);
    setUserId(Number(id));
    setProfile(parsed);
    // Land mentors on their overview, learners on explore
    setTab(parsed.role === "mentor" ? "overview" : "explore");
  }, [router]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  function handleBook(mentor: MentorProfile) {
    setBooking(mentor);
  }

  function handleDemo(mentor: MentorProfile) {
    setSessMentor(mentor);
    setInSession(true);
  }

  if (!profile || userId === null) return null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav
        tab={tab}
        setTab={setTab}
        profile={profile}
        totalHours={hoursData?.totalHours ?? "0.0"}
        userId={userId}
      />

      {tab === "overview" && profile.role === "mentor" && (
        <MentorOverview profile={profile} userId={userId} hoursData={hoursData ?? null} />
      )}

      {tab === "explore" && (
        <>
          <MentorGrid
            profile={profile}
            onBook={handleBook}
            onDemo={handleDemo}
            onBrowseCourses={() => setShowCoursePicker(true)}
          />
          {profile.role === "learner" && <StudyGroupsSection userId={userId} />}
          {profile.role === "learner" && <WaitlistPanel userId={userId} />}
        </>
      )}

      {tab === "sessions" && (
        <SessionList
          profile={profile}
          userId={userId}
          onBookNew={() => setTab("explore")}
          onJoinLive={() => { setSessMentor(null); setInSession(true); }}
        />
      )}

      {tab === "hours" && profile.role === "mentor" && (
        <div className="page">
          <div className="sec-hd">
            <div className="sec-ttl">Volunteer <em>Hours</em></div>
            <button className="btn btn-amber btn-sm" onClick={() => showToast("📄 OSSD Certificate downloaded!")}>
              Export PDF
            </button>
          </div>
          {hoursData ? (
            <>
              <HoursProgress data={hoursData} profile={profile} onExport={() => showToast("📄 OSSD Certificate exported!")} />
              <HoursTable log={hoursData.log} />
            </>
          ) : (
            <div className="empty-state">No volunteer hours logged yet.</div>
          )}
        </div>
      )}

      {tab === "calendar" && (
        <CalendarTab profile={profile} userId={userId} />
      )}

      {tab === "messages" && (
        <div className="page">
          <MessagesTab profile={profile} userId={userId} />
        </div>
      )}

      {tab === "study" && (
        <StudyTab profile={profile} userId={userId} />
      )}

      {tab === "quiz" && (
        <QuizTab profile={profile} userId={userId} />
      )}

      {tab === "profile" && (
        <ProfilePage profile={profile} userId={userId} hoursData={hoursData} onShowToast={showToast} />
      )}

      {/* Course Picker */}
      {showCoursePicker && !booking && (
        <CourseSelectorModal
          initialGrade={profile.grade}
          onSelect={(c) => { setShowCoursePicker(false); showToast(`📚 Course selected: ${c.code} — ${c.name.split(" (")[0]}`); }}
          onClose={() => setShowCoursePicker(false)}
        />
      )}

      {/* Booking Modal */}
      {booking && (
        <BookingModal
          mentor={booking}
          profile={profile}
          onClose={() => setBooking(null)}
          onConfirm={(msg) => { setBooking(null); showToast(msg); }}
        />
      )}

      {/* Video Room */}
      {inSession && (
        <VideoRoom
          mentor={sessMentor}
          profile={profile}
          onLeave={() => { setInSession(false); setSessMentor(null); showToast("Session ended. Hours logged!"); }}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}
