-- CreateTable
CREATE TABLE "course_waitlists" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "learnerId" INTEGER NOT NULL,
    "courseCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "course_waitlists_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "course_waitlists_learnerId_courseCode_key" ON "course_waitlists"("learnerId", "courseCode");
