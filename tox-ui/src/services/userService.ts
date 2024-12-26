import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API_URL = 'http://localhost:31858'; // API Gateway URL

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  company: string;
  department: string;
  position: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  name: string;
  email: string;
  password?: string;
  company: string;
  department: string;
  position: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
  company?: string;
  department?: string;
  position?: string;
}

// 프로필 조회
export const getUserProfile = async (): Promise<User> => {
  const token = getAuthToken();
  const response = await axios.get(`${API_URL}/api/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};

// 프로필 업데이트
export const updateUserProfile = async (data: UserProfile): Promise<User> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  // 비밀번호가 비어있으면 제외
  const updateData = { ...data };
  if (!updateData.password) {
    delete updateData.password;
  }

  const response = await axios.put(`${API_URL}/users/profile`, updateData, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.data.data;
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('인증이 필요합니다.');
    }

    const response = await axios.get<{ status: string; data: User[] }>(`${API_URL}/api/users`, {
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
    const token = getAuthToken();
    if (!token) {
      throw new Error('인증이 필요합니다.');
    }

    const response = await axios.get<{ status: string; data: User }>(`${API_URL}/api/users/${id}`, {
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
    const token = getAuthToken();
    if (!token) {
      throw new Error('인증이 필요합니다.');
    }

    const response = await axios.put<{ status: string; data: User }>(
      `${API_URL}/api/users/${id}`,
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
    const token = getAuthToken();
    if (!token) {
      throw new Error('인증이 필요합니다.');
    }

    await axios.delete(`${API_URL}/api/users/${id}`, {
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
