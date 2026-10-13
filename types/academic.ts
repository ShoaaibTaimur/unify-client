export interface Department {
  id: string;
  name: string;
  createdAt?: string;
}

export interface Batch {
  id: string;
  departmentId: string;
  name: string;
  createdAt?: string;
}

export interface Section {
  id: string;
  batchId: string;
  name: string;
  createdAt?: string;
}

export interface ClassSelection {
  departmentId: string;
  batchId: string;
  sectionId: string;
}
