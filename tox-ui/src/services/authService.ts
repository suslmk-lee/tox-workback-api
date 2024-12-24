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
    
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      if (!error.response) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
      
      switch (error.response.status) {
        case 401:
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        case 500:
          throw new Error('서버 내부 오류가 발생했습니다.');
        default:
          throw new Error('로그인에 실패했습니다.');
      }
    }
    
    throw new Error('로그인 중 오류가 발생했습니다.');
  }
};

export const register = async (credentials: RegisterCredentials) => {
  try {
    const { confirmPassword, ...registerData } = credentials;
    console.log('Sending registration request:', registerData);
    
    const response = await axios.post<RegisterResponse>(`${API_URL}/register`, registerData);
    console.log('Registration response:', response.data);
    
    if (response.data.status === 'success') {
      return response.data;
    }
    
    throw new Error('회원가입에 실패했습니다.');
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      if (!error.response) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
      
      if (error.response.status === 409) {
        throw new Error('이미 등록된 이메일입니다.');
      }
    }
    
    throw new Error('회원가입 중 오류가 발생했습니다.');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};
