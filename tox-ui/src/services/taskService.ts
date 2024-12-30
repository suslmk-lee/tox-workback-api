import axios from 'axios';

const API_URL = 'http://localhost:31858/api/tasks';

export type TaskType = string;
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaskHierarchy {
  task: Task;
  sub_tasks?: TaskHierarchy[];
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  start_time: number;
  due_date?: number;
  estimated_hours?: number;
  assignee_id?: number;
  parent_id?: number;
  progress: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  start_time: number;
  due_date?: number;
  estimated_hours?: number;
  assignee_id?: number;
  parent_id?: number;
}

export const getTypeText = (type: TaskType): string => {
  const typeTexts: { [key: string]: string } = {
    '1': 'MainTask',
    '2': '기획&설계',
    '3': '버그',
    '4': '샘플',
    '5': '개발',
    '6': '지원',
    '7': '보안',
    '8': '기술검토',
    '9': '리소스',
    '10': '테스트',
    '11': '문서화',
    '12': '관리'
  };
  return typeTexts[type] || '기타';
};

export const getTypeColor = (type: TaskType): string => {
  const colors: { [key: string]: string } = {
    '1': '#1976d2',  // 파랑
    '2': '#9c27b0',  // 보라
    '3': '#d32f2f',  // 빨강
    '4': '#ed6c02',  // 주황
    '5': '#2e7d32',  // 초록
    '6': '#0288d1',  // 하늘
    '7': '#c2185b',  // 분홍
    '8': '#7b1fa2',  // 진보라
    '9': '#1565c0',  // 진파랑
    '10': '#827717', // 올리브
    '11': '#4527a0', // 남색
    '12': '#00796b'  // 청록
  };
  return colors[type] || '#757575';
};

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'TODO':
      return '#757575';
    case 'IN_PROGRESS':
      return '#1976d2';
    case 'DONE':
      return '#2e7d32';
    default:
      return '#757575';
  }
};

export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'LOW':
      return '#757575';
    case 'MEDIUM':
      return '#1976d2';
    case 'HIGH':
      return '#ed6c02';
    case 'CRITICAL':
      return '#d32f2f';
    default:
      return '#757575';
  }
};

export const getTasks = async (): Promise<Task[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map((task: any) => ({
      ...task,
      start_time: task.start_time,
      due_date: task.due_date,
      progress: task.progress || 0,
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const createTask = async (taskData: CreateTaskRequest): Promise<Task> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    // Convert dates to Unix timestamps if they aren't already
    const start_time = typeof taskData.start_time === 'number' 
      ? taskData.start_time 
      : Math.floor(new Date(taskData.start_time).getTime() / 1000);

    const due_date = taskData.due_date 
      ? (typeof taskData.due_date === 'number' 
        ? taskData.due_date 
        : Math.floor(new Date(taskData.due_date).getTime() / 1000))
      : undefined;

    const requestData = {
      ...taskData,
      start_time,
      due_date,
      estimated_hours: taskData.estimated_hours || 0,
      progress: 0,
    };

    console.log('Creating task with data:', requestData);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Failed to create task: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    return {
      ...data,
      start_time: data.start_time,
      due_date: data.due_date,
      progress: data.progress || 0,
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (taskId: number, taskData: Partial<Task>): Promise<Task> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const response = await fetch(`${API_URL}/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...taskData,
        start_time: taskData.start_time,
        due_date: taskData.due_date,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error(`Failed to update task: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      ...data,
      start_time: data.start_time,
      due_date: data.due_date,
      progress: data.progress || 0,
    };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: number): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const response = await fetch(`${API_URL}/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error(`Failed to delete task: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};
