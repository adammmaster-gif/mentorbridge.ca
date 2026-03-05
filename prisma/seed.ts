import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { SCHOOLS } from "../src/lib/constants";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  for (const s of SCHOOLS) {
    await prisma.school.upsert({
      where: { id: s.id },
      update: {},
      create: { id: s.id, name: s.name, city: s.city, emoji: s.emoji },
    });
  }
  console.log(`✓ ${SCHOOLS.length} schools seeded`);

  console.log("\nDone! Database is ready.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
