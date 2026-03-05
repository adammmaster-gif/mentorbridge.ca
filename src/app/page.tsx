"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("mb_user_id");
    if (userId) {
      router.replace("/dashboard");
    } else {
      router.replace("/onboard");
    }
  }, [router]);

  return null;
}
