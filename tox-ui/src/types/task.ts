export interface Task {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  assignee_id?: number;
  start_time?: string;
  due_date?: string;
  progress: number;
  estimated_hours: number;
  user_id: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
}

export interface TaskHierarchy {
  task: Task;
  sub_tasks?: TaskHierarchy[];
}
