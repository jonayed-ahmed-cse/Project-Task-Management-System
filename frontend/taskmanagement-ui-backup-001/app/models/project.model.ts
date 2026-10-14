
export type ProjectStatus =
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ON_HOLD';

export interface Project {
  id: number;
  projectCode: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: ProjectStatus;
}

export type ProjectRequest = Omit<Project, 'id'>;
