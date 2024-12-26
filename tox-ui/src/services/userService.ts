import axios from 'axios';

const API_URL = 'http://localhost:31858/api';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('인증이 필요합니다.');
    }

    const response = await axios.get<{ status: string; data: User[] }>(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Users fetch error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      if (!error.response) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
      throw new Error(error.response.data.error || '사용자 목록을 불러오는데 실패했습니다.');
    }
    
    throw new Error('사용자 목록을 불러오는데 실패했습니다.');
  }
};

export const getUser = async (id: number): Promise<User> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('인증이 필요합니다.');
    }

    const response = await axios.get<{ status: string; data: User }>(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('User fetch error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      if (error.response?.status === 404) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }
      if (!error.response) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
      throw new Error(error.response.data.error || '사용자 정보를 불러오는데 실패했습니다.');
    }
    
    throw new Error('사용자 정보를 불러오는데 실패했습니다.');
  }
};

export const updateUser = async (id: number, data: UserUpdateData): Promise<User> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('인증이 필요합니다.');
    }

    const response = await axios.put<{ status: string; data: User }>(
      `${API_URL}/users/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('User update error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      if (error.response?.status === 403) {
        throw new Error('다른 사용자의 정보를 수정할 수 없습니다.');
      }
      if (error.response?.status === 404) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }
      if (!error.response) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
      throw new Error(error.response.data.error || '사용자 정보 수정에 실패했습니다.');
    }
    
    throw new Error('사용자 정보 수정에 실패했습니다.');
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('인증이 필요합니다.');
    }

    await axios.delete(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    console.error('User delete error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      if (error.response?.status === 403) {
        throw new Error('다른 사용자의 계정을 삭제할 수 없습니다.');
      }
      if (error.response?.status === 404) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }
      if (!error.response) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
      throw new Error(error.response.data.error || '사용자 삭제에 실패했습니다.');
    }
    
    throw new Error('사용자 삭제에 실패했습니다.');
  }
};
