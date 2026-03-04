import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { SCHOOLS, MOCK_MENTORS } from "../src/lib/constants";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Schools
  for (const s of SCHOOLS) {
    await prisma.school.upsert({
      where: { id: s.id },
      update: {},
      create: { id: s.id, name: s.name, city: s.city, emoji: s.emoji },
    });
  }
  console.log(`✓ ${SCHOOLS.length} schools seeded`);

  // 2. Mentor users + profiles
  for (const m of MOCK_MENTORS) {
    const user = await prisma.user.upsert({
      where: { email: `${m.initials.toLowerCase()}@dpcdsb.org` },
      update: {},
      create: {
        name: m.name,
        initials: m.initials,
        grade: m.year,
        role: "mentor",
        email: `${m.initials.toLowerCase()}@dpcdsb.org`,
        avatarColor: m.avatarColor,
        schoolId: "st_marcellinus",
      },
    });

    const profile = await prisma.mentorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        schoolId: "st_marcellinus",
        bio: m.bio,
        rating: m.rating,
        sessionCount: m.sessions,
        available: m.available,
      },
    });

    // subjects
    await prisma.mentorSubject.deleteMany({ where: { mentorProfileId: profile.id } });
    await prisma.mentorSubject.createMany({
      data: m.subjects.map((code) => ({ mentorProfileId: profile.id, courseCode: code })),
    });
  }
  console.log(`✓ ${MOCK_MENTORS.length} mentor profiles seeded`);

  // 3. Test learner
  const learner = await prisma.user.upsert({
    where: { email: "alexkim@dpcdsb.org" },
    update: {},
    create: {
      name: "Alex Kim",
      initials: "AK",
      grade: "Grade 12",
      role: "learner",
      email: "alexkim@dpcdsb.org",
      avatarColor: 3,
      schoolId: "st_marcellinus",
    },
  });
  console.log(`✓ Test learner seeded (id: ${learner.id})`);

  // 4. Get mentor profile IDs for sessions
  const aisha = await prisma.mentorProfile.findFirst({ where: { user: { name: "Aisha Mahmoud" } } });
  const ryan  = await prisma.mentorProfile.findFirst({ where: { user: { name: "Ryan Patel" } } });
  const sophie = await prisma.mentorProfile.findFirst({ where: { user: { name: "Sophie Tremblay" } } });
  const karan = await prisma.mentorProfile.findFirst({ where: { user: { name: "Karan Dhaliwal" } } });

  if (!aisha || !ryan || !sophie || !karan) {
    throw new Error("Could not find mentor profiles for seeding sessions");
  }

  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const mar5 = new Date("2026-03-05T17:00:00");
  const feb26 = new Date("2026-02-26T16:30:00");
  const feb22 = new Date("2026-02-22T15:00:00");

  const sessionsData = [
    { mentorProfileId: aisha.id,  courseCode: "MCV4U", courseName: "Calculus & Vectors", scheduledDate: new Date(now.setHours(16,0,0,0)),  durationMinutes: 60, status: "live",      notes: "Going through limits" },
    { mentorProfileId: ryan.id,   courseCode: "SCH4U", courseName: "Chemistry",           scheduledDate: new Date(tomorrow.setHours(15,30,0,0)), durationMinutes: 45, status: "upcoming",  notes: "" },
    { mentorProfileId: sophie.id, courseCode: "ENG4U", courseName: "English",             scheduledDate: mar5,  durationMinutes: 60, status: "upcoming",  notes: "" },
    { mentorProfileId: karan.id,  courseCode: "ICS4U", courseName: "Computer Science",    scheduledDate: feb26, durationMinutes: 52, status: "completed", notes: "OOP review" },
    { mentorProfileId: aisha.id,  courseCode: "MHF4U", courseName: "Advanced Functions",  scheduledDate: feb22, durationMinutes: 48, status: "completed", notes: "Trig identities" },
  ];

  for (const s of sessionsData) {
    const existing = await prisma.session.findFirst({
      where: { learnerId: learner.id, courseCode: s.courseCode, scheduledDate: s.scheduledDate },
    });
    if (!existing) {
      const session = await prisma.session.create({
        data: { ...s, learnerId: learner.id },
      });

      // Create volunteer hour for completed sessions
      if (s.status === "completed") {
        const mentor = await prisma.mentorProfile.findUnique({
          where: { id: s.mentorProfileId },
          include: { user: true },
        });
        if (mentor) {
          await prisma.volunteerHour.create({
            data: {
              mentorId: mentor.userId,
              sessionId: session.id,
              durationMinutes: s.durationMinutes,
              status: "confirmed",
            },
          });
        }
      }
    }
  }
  console.log(`✓ Sessions and volunteer hours seeded`);

  console.log("\nDone! Database is ready.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
