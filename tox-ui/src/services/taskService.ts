import axios from 'axios';

const API_URL = 'http://localhost:31858/api/tasks';

export type TaskType = 'BUG' | 'FEATURE' | 'IMPROVEMENT' | 'TASK';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: number;
  start_time?: string;
  due_date?: string;
  progress: number;
  estimated_hours: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  assignee_id?: number;
  start_time?: string;
  due_date?: string;
  estimated_hours?: number;
}

export const getTasks = async (): Promise<Task[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('인증이 필요합니다.');
    }

    const response = await axios.get<Task[]>(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Tasks fetch error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      if (!error.response) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
    }
    
    throw new Error('작업 목록을 불러오는데 실패했습니다.');
  }
};

export const createTask = async (data: CreateTaskRequest): Promise<Task> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('인증이 필요합니다.');
    }

    const response = await axios.post<Task>(API_URL, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Task creation error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      if (!error.response) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
      throw new Error(error.response.data.error || '작업 생성에 실패했습니다.');
    }
    
    throw new Error('작업 생성에 실패했습니다.');
  }
};
