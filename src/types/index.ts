export interface School {
  id: string;
  name: string;
  city: string;
  emoji: string;
}

export interface MentorProfile {
  id: number;
  name: string;
  year: string;
  initials: string;
  avatarColor: number;
  subjects: string[];
  rating: number;
  sessions: number;
  available: boolean;
  bio: string;
  school: School;
}

export interface CourseEntry {
  code: string;
  name: string;
  type: string;
}

export type CoursesData = Record<string, Record<string, CourseEntry[]>>;

export interface SessionRow {
  id: number;
  courseCode: string;
  courseName: string;
  mentorName: string;
  learnerName: string;
  scheduledDate: string;
  durationMinutes: number;
  status: "pending" | "live" | "upcoming" | "completed" | "cancelled";
  location: string;
}

export interface HourEntry {
  date: string;
  subject: string;
  learnerName: string;
  durationMinutes: number;
  status: "confirmed" | "pending";
}

export interface UserProfile {
  id: number;
  name: string;
  initials: string;
  grade: string;
  role: "learner" | "mentor";
  avatarColor: number;
  school: School;
}

export interface HoursData {
  totalMinutes: number;
  totalHours: string;
  percentage: number;
  log: HourEntry[];
}

export interface Message {
  id: number;
  senderId: number;
  text: string;
  isSystem: boolean;
  read: boolean;
  createdAt: string;
}

export interface StudyGroup {
  id: number;
  mentorId: number;
  mentorName: string;
  mentorInitials: string;
  mentorAvatarColor: number;
  courseCode: string;
  courseName: string;
  title: string;
  scheduledDate: string;
  durationMinutes: number;
  location: string;
  maxStudents: number;
  memberCount: number;
  alreadyJoined: boolean;
}

export interface Conversation {
  id: number;
  otherUser: { id: number; name: string; initials: string; avatarColor: number; role: string };
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

export interface StudyNote {
  id: number;
  mentorId: number;
  mentorName: string;
  mentorInitials: string;
  mentorAvatarColor: number;
  courseCode: string;
  courseName: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface QuizQuestionDTO {
  id: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  order: number;
}

export interface QuizDTO {
  id: number;
  mentorId: number;
  mentorName: string;
  mentorInitials: string;
  mentorAvatarColor: number;
  courseCode: string;
  courseName: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  sourceNoteId: number | null;
  questionCount: number;
  attemptCount: number;
  createdAt: string;
}

export interface QuizDetailDTO extends QuizDTO {
  questions: QuizQuestionDTO[];
}

export interface QuizAttemptDTO {
  id: number;
  quizId: number;
  quizTitle: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completed: boolean;
  completedAt: string | null;
  startedAt: string;
  responses: Record<string, string>;
  nextQuizId?: number;
}
