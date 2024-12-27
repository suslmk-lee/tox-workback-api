import React, { useEffect, useState } from 'react';
import { Box, Button, Container, TextField, Typography, Paper, Alert } from '@mui/material';
import { User, UserProfile, getUserProfile, updateUserProfile } from '../services/userService';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    email: '',
    password: '',
    company: '',
    department: '',
    position: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await getUserProfile();
      setUser(userData);
      setFormData({
        name: userData.name,
        email: userData.email,
        password: '',
        company: userData.company,
        department: userData.department,
        position: userData.position,
      });
    } catch (err) {
      setError('프로필을 불러오는데 실패했습니다.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData: UserProfile = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        department: formData.department,
        position: formData.position,
      };
      
      // 비밀번호가 입력된 경우에만 포함
      if (formData.password) {
        updateData.password = formData.password;
      }

      const updatedUser = await updateUserProfile(updateData);
      setUser(updatedUser);
      setEditMode(false);
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      setError('');
      
      // 프로필 정보 새로고침
      await loadUserProfile();
    } catch (err: any) {
      setError('프로필 업데이트에 실패했습니다.');
      setSuccess('');
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Typography>프로필을 불러오는 중...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            내 프로필
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {!editMode ? (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>이름:</strong> {user.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>이메일:</strong> {user.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>회사명:</strong> {user.company}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>부서명:</strong> {user.department}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>직급:</strong> {user.position}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>역할:</strong> {user.role}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>가입일:</strong> {new Date(user.created_at).toLocaleDateString()}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setEditMode(true)}
                sx={{ mt: 2 }}
              >
                프로필 수정
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="이름"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="이메일"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="회사명"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="부서명"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="직급"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="새 비밀번호"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                helperText="변경하지 않으려면 비워두세요"
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  저장
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      name: user.name,
                      email: user.email,
                      password: '',
                      company: user.company,
                      department: user.department,
                      position: user.position,
                    });
                  }}
                >
                  취소
                </Button>
              </Box>
            </form>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage;
