import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { User, getUsers, deleteUser } from '../services/userService';

const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      setError('');
    } catch (err: any) {
      setError('사용자 목록을 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('정말 이 사용자를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteUser(id);
      setSuccess('사용자가 성공적으로 삭제되었습니다.');
      setError('');
      loadUsers(); // 목록 새로고침
    } catch (err: any) {
      setError('사용자 삭제에 실패했습니다.');
      setSuccess('');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          사용자 관리
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>이름</TableCell>
              <TableCell>이메일</TableCell>
              <TableCell>회사명</TableCell>
              <TableCell>부서명</TableCell>
              <TableCell>직급</TableCell>
              <TableCell>역할</TableCell>
              <TableCell>가입일</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.company}</TableCell>
                <TableCell>{user.department}</TableCell>
                <TableCell>{user.position}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    삭제
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default UserListPage;
