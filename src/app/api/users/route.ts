import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { school: true },
  });
  if (!user) return NextResponse.json({ error: "No account found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    initials: user.initials,
    grade: user.grade,
    role: user.role,
    avatarColor: user.avatarColor,
    school: { id: user.school.id, name: user.school.name, city: user.school.city, emoji: user.school.emoji },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, grade, role, schoolId, avatarColor, email } = body;

  if (!name || !grade || !role || !schoolId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Build initials from name
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      initials,
      grade,
      role,
      schoolId,
      avatarColor: avatarColor ?? 0,
      ...(email ? { email: email.trim().toLowerCase() } : {}),
    },
    include: { school: true },
  });

  // If mentor, create an empty profile
  if (role === "mentor") {
    await prisma.mentorProfile.create({
      data: {
        userId: user.id,
        schoolId,
        bio: "",
        rating: 0,
        sessionCount: 0,
        available: true,
      },
    });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    initials: user.initials,
    grade: user.grade,
    role: user.role,
    avatarColor: user.avatarColor,
    school: { id: user.school.id, name: user.school.name, city: user.school.city, emoji: user.school.emoji },
  }, { status: 201 });
}
