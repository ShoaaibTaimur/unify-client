export const ACTIVITY_TYPES = {
  "class-test": { label: "Class Test", isExam: false, color: "var(--activity-class-test)" },
  "lab-test": { label: "Lab Test", isExam: false, color: "var(--activity-lab-test)" },
  viva: { label: "Viva", isExam: false, color: "var(--activity-viva)" },
  assignment: { label: "Assignment", isExam: false, color: "var(--activity-assignment)" },
  presentation: { label: "Presentation", isExam: false, color: "var(--activity-presentation)" },
  quiz: { label: "Quiz", isExam: false, color: "var(--activity-quiz)" },
  "mid-exam": { label: "Mid Exam", isExam: true, color: "var(--activity-mid-exam)" },
  "final-exam": { label: "Final Exam", isExam: true, color: "var(--activity-final-exam)" },
  "extra-class": { label: "Extra Class", isExam: false, color: "var(--activity-extra-class)" },
} as const;

export type ActivityType = keyof typeof ACTIVITY_TYPES;

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
  date?: string;
  startDate?: string;
  endDate?: string;
  time?: string;
}

export interface ActivityFilter {
  departmentId?: string;
  batchId?: string;
  sectionId?: string;
  activityType?: ActivityType;
  status?: "all" | "upcoming" | "completed";
}

export type ActivityStatusFilter = "all" | "upcoming" | "completed";
