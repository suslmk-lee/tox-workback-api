// 토큰 저장
export const setAuthToken = (token: string): void => {
    localStorage.setItem('token', token);
};

// 토큰 가져오기
export const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};

// 토큰 제거
export const removeAuthToken = (): void => {
    localStorage.removeItem('token');
};

// 인증 상태 확인
export const isAuthenticated = (): boolean => {
    const token = getAuthToken();
    return !!token;
};

// 토큰 디코딩 (JWT)
export const decodeToken = (token: string): any => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
};

// 토큰에서 사용자 ID 가져오기
export const getUserIdFromToken = (): number | null => {
    const token = getAuthToken();
    if (!token) return null;
    
    const decoded = decodeToken(token);
    return decoded?.user_id || null;
};

// 토큰 만료 확인
export const isTokenExpired = (): boolean => {
    const token = getAuthToken();
    if (!token) return true;
    
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
};
