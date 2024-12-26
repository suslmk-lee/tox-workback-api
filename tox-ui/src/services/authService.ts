import axios from 'axios';

const API_URL = 'http://localhost:31858/auth'; // API Gateway URL

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword?: string;
}

export interface RegisterResponse {
  status: string;
  message: string;
  data: {
    email: string;
  };
}

export interface LoginResponse {
  token: string;
  user?: {
    email: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    console.log('Sending login request:', credentials);
    
    const response = await axios.post<LoginResponse>(`${API_URL}/login`, credentials);
    console.log('Login response:', response);
    
    if (response.data && response.data.token) {
      // 토큰을 localStorage에 저장
      localStorage.setItem('token', response.data.token);
      
      // 사용자 정보도 저장
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    }
    
    throw new Error('로그인에 실패했습니다.');
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
  try {
    const response = await axios.post<RegisterResponse>(`${API_URL}/register`, credentials);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
