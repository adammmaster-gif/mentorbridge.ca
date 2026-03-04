"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RoleStep from "@/components/onboard/RoleStep";
import SchoolStep from "@/components/onboard/SchoolStep";
import ProfileStep from "@/components/onboard/ProfileStep";
import SignInStep from "@/components/onboard/SignInStep";
import type { School } from "@/types";

type Step = "role" | "school" | "profile" | "signin";

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<"learner" | "mentor" | null>(null);
  const [school, setSchool] = useState<School | null>(null);

  function handleComplete(
    userId: number,
    profile: { name: string; initials: string; grade: string; role: string; avatarColor: number; school: School }
  ) {
    localStorage.setItem("mb_user_id", String(userId));
    localStorage.setItem("mb_profile", JSON.stringify(profile));
    router.replace("/dashboard");
  }

  if (step === "signin") {
    return <SignInStep onComplete={handleComplete} onBack={() => setStep("role")} />;
  }

  if (step === "role") {
    return (
      <RoleStep
        role={role}
        onSelect={setRole}
        onNext={() => setStep("school")}
        onSignIn={() => setStep("signin")}
      />
    );
  }

  if (step === "school") {
    return (
      <SchoolStep
        school={school}
        onSelect={setSchool}
        onNext={() => setStep("profile")}
        onBack={() => setStep("role")}
      />
    );
  }

  return (
    <ProfileStep
      role={role!}
      school={school!}
      onComplete={handleComplete}
      onBack={() => setStep("school")}
    />
  );
}
