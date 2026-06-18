export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  PARENT = "parent",
  ADMIN = "admin"
}

export enum Difficulty {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard",
  EXAM_STANDARD = "Exam Standard",
  EXAMINER_CHALLENGE = "Examiner Challenge"
}

export enum PaperType {
  PAPER_1 = "Paper 1 (MCQ Core)",
  PAPER_2 = "Paper 2 (MCQ Extended)",
  PAPER_3 = "Paper 3 (Structured Core)",
  PAPER_4 = "Paper 4 (Structured Extended)",
  PAPER_6 = "Paper 6 (Alternative to Practical)"
}

export interface Subject {
  id: string;
  name: string;
  category: "Sciences" | "Mathematics" | "Languages" | "Humanities" | "ICT & Technology" | "Commerce";
  syllabusCode: string;
  icon: string;
  topics: {
    id: string;
    name: string;
    subtopics: string[];
  }[];
}

export interface ResourceItem {
  id: string;
  title: string;
  subjectId: string;
  topicId: string;
  subtopic: string;
  syllabusCode: string;
  difficulty: Difficulty;
  resourceType: "Notes" | "Worksheet" | "Revision Guide" | "Flash Cards" | "Practical Guide" | "Formula Sheet";
  content: string; // Markdown or text
  author: string;
  year?: string;
  tags: string[];
}

export interface Question {
  id: string;
  subjectId: string;
  topicId: string;
  subtopic: string;
  paperType: PaperType;
  difficulty: Difficulty;
  marks: number;
  timeEstimate: number; // in minutes
  questionText: string;
  options?: string[]; // for MCQs
  correctOptionIndex?: number; // for MCQs (0-3)
  learningObjective: string;
  modelAnswer: string;
  studentFriendlyExplanation: string;
  commonMistakes: string[];
  improvementSuggestions: string[];
  markScheme: {
    points: string[];
    alternativeAnswers?: string[];
    examinerComments: string;
  };
}

export interface StudentProgress {
  userId: string;
  level: number;
  xp: number;
  xpNeededForNextLevel: number;
  completedQuizzes: string[]; // question ids
  badges: string[]; // Badge IDs earned
  streakDays: number;
  lastActiveDate: string;
  completedModules: { [subjectId: string]: string[] }; // Subject -> Completed Topic IDs
  scores: { [questionId: string]: { score: number; maxScore: number; submittedAt: string; answerText?: string } };
}

export interface Assignment {
  id: string;
  title: string;
  teacherId: string;
  subjectId: string;
  dueDate: string;
  questions: Question[];
  submissions: {
    studentId: string;
    studentName: string;
    submittedAt: string;
    answers: { [questionId: string]: string }; // questionId -> student response text
    graded: boolean;
    score?: number;
    maxScore: number;
    teacherFeedback?: string;
    gradedAt?: string;
  }[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
}

export interface ForumPost {
  id: string;
  subjectId?: string; // empty means general study tips
  title: string;
  content: string;
  authorName: string;
  authorRole: UserRole;
  createdAt: string;
  likes: number;
  likedBy: string[];
  replies: {
    id: string;
    authorName: string;
    authorRole: UserRole;
    content: string;
    createdAt: string;
  }[];
}
