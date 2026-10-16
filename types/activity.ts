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

export interface ActivityTypeOption {
  value: ActivityType;
  label: string;
  isExam: boolean;
}

export const ACTIVITY_TYPES: ActivityTypeOption[] = [
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

export interface Activity {
  id: string;
  departmentId: string;
  batchId: string;
  sectionId?: string;
  activityType: ActivityType;
  title: string;
  subject: string;
  room?: string;
  description?: string;
  /** For normal activities: single date (ISO string or YYYY-MM-DD). */
  date?: string;
  /** For multi-day periods (e.g. exams). */
  startDate?: string;
  endDate?: string;
  /** Optional time string e.g. "10:00 AM" or "09:00" */
  time?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityFilter {
  departmentId?: string;
  batchId?: string;
  sectionId?: string;
  activityType?: ActivityType;
  status?: "all" | "upcoming" | "completed";
  search?: string;
}

export type ActivityStatusFilter = "all" | "upcoming" | "completed";
