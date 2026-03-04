-- CreateTable
CREATE TABLE "study_groups" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mentorId" INTEGER NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "location" TEXT NOT NULL,
    "maxStudents" INTEGER NOT NULL DEFAULT 4,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "study_groups_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "study_group_members" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studyGroupId" INTEGER NOT NULL,
    "learnerId" INTEGER NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "study_group_members_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "study_groups" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "study_group_members_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "study_group_members_studyGroupId_learnerId_key" ON "study_group_members"("studyGroupId", "learnerId");
