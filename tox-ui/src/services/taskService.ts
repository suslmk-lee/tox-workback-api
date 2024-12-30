import axios from 'axios';

const API_URL = 'http://localhost:31858/api/tasks';

export type TaskType = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaskHierarchy {
  task: Task;
  sub_tasks?: TaskHierarchy[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: number;
  parent_id?: string;
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

export const getTypeText = (type: TaskType) => {
  switch (type) {
    case '1':
      return 'MainTask';
    case '2':
      return '기획&설계';
    case '3':
      return '버그';
    case '4':
      return '샘플개발';
    case '5':
      return '개발';
    case '6':
      return '지원';
    case '7':
      return '보안';
    case '8':
      return '기술검토';
    case '9':
      return '리소스관리';
    case '10':
      return '테스트';
    case '11':
      return '문서화&보고';
    case '12':
      return '프로젝트관리';
    default:
      return type;
  }
};

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
