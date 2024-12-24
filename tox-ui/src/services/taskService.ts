import axios from 'axios';

const API_URL = 'http://localhost:31858/api/tasks';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  created_at: string;
  updated_at: string;
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
