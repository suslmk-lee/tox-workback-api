import axios from 'axios';

const API_URL = 'http://localhost:31858/auth'; // API Gateway URL

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 제거
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
    
    const response = await axiosInstance.post<LoginResponse>('/login', credentials);
    console.log('Login response:', response);
    
    if (response.data && response.data.token) {
      // 토큰을 localStorage에 저장
      localStorage.setItem('token', response.data.token);
      
      // 사용자 정보도 저장
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // 페이지 새로고침하여 상태 업데이트
      window.location.reload();
      
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
    const response = await axiosInstance.post<RegisterResponse>('/register', credentials);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const validateToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // profile 엔드포인트로 토큰 유효성 검증
    await axios.get('http://localhost:31858/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};
