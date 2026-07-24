export type ActivityType =
  | "class-test"
  | "lab-test"
  | "viva"
  | "assignment"
  | "presentation"
  | "quiz"
  | "mid-exam"
  | "final-exam"
  | "extra-class";

export const ACTIVITY_TYPES: { value: ActivityType; label: string; isExam: boolean }[] = [
  { value: "class-test", label: "Class Test", isExam: false },
  { value: "lab-test", label: "Lab Test", isExam: false },
  { value: "viva", label: "Viva", isExam: false },
  { value: "assignment", label: "Assignment", isExam: false },
  { value: "presentation", label: "Presentation", isExam: false },
  { value: "quiz", label: "Quiz", isExam: false },
  { value: "mid-exam", label: "Mid Exam", isExam: true },
  { value: "final-exam", label: "Final Exam", isExam: true },
  { value: "extra-class", label: "Extra Class", isExam: false },
];

export const ACTIVITY_COLOR: Record<ActivityType, string> = {
  "class-test": "var(--activity-class-test)",
  "lab-test": "var(--activity-lab-test)",
  "viva": "var(--activity-viva)",
  "assignment": "var(--activity-assignment)",
  "presentation": "var(--activity-presentation)",
  "quiz": "var(--activity-quiz)",
  "mid-exam": "var(--activity-mid-exam)",
  "final-exam": "var(--activity-final-exam)",
  "extra-class": "var(--activity-extra-class)",
};

export interface Department {
  id: string;
  name: string;
}
export interface Batch {
  id: string;
  departmentId: string;
  name: string;
}
export interface Section {
  id: string;
  batchId: string;
  name: string;
}
export type Role = "student" | "cr" | "teacher" | "admin";
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  batchId?: string;
  sectionId?: string;
  mustChangePassword: boolean;
}
export interface Activity {
  id: string;
  departmentId: string;
  batchId: string;
  sectionId: string;
  activityType: ActivityType;
  title: string;
  subject: string;
  room?: string;
  description?: string;
  /** For normal activities: single date (ISO). */
  date?: string;
  /** For exam periods. */
  startDate?: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSelection {
  departmentId: string;
  batchId: string;
  sectionId: string;
}
