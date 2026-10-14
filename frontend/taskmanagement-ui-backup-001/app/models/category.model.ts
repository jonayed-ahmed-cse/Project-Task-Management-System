
export interface TaskCategory {
  id: number;
  name: string;
  description: string | null;
}

export type CategoryRequest = Omit<TaskCategory, 'id'>;
