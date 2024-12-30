import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
} from '@mui/material';
import { Task, TaskType, TaskStatus, TaskPriority } from '../services/taskService';
import { User } from '../services/userService';
import MDEditor from '@uiw/react-md-editor';

interface TaskEditDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (editedTask: Partial<Task>) => void;
  users: User[];
  tasks: Task[];
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  open,
  onClose,
  task,
  onSave,
  users,
  tasks,
}) => {
  const [editedTask, setEditedTask] = useState<Partial<Task> | null>(null);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleChange = (field: keyof Task, value: any) => {
    if (editedTask) {
      setEditedTask({ ...editedTask, [field]: value });
    }
  };

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
    }
    onClose();
  };

  const findChildTasks = (taskId: number): number[] => {
    const childTasks: number[] = [];
    const findChildren = (id: number) => {
      const children = tasks.filter(t => t.parent_id === id);
      children.forEach(child => {
        childTasks.push(child.id);
        findChildren(child.id);
      });
    };
    findChildren(taskId);
    return childTasks;
  };

  // 선택 가능한 상위 작업 목록 필터링
  const availableParentTasks = tasks.filter(t => {
    // 자기 자신은 제외
    if (editedTask && t.id === editedTask.id) return false;
    // 현재 작업의 하위 작업들은 제외
    if (editedTask && editedTask.id && findChildTasks(editedTask.id).includes(t.id)) return false;
    return true;
  });

  if (!editedTask) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{task ? '일감 수정' : '새 일감 생성'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="제목"
                value={editedTask.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <MDEditor
                value={editedTask.description || ''}
                onChange={(value) => handleChange('description', value)}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>타입</InputLabel>
                <Select
                  value={editedTask.type || '12'}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  <MenuItem value="1">MainTask</MenuItem>
                  <MenuItem value="2">기획&설계</MenuItem>
                  <MenuItem value="3">버그</MenuItem>
                  <MenuItem value="4">샘플</MenuItem>
                  <MenuItem value="5">개발</MenuItem>
                  <MenuItem value="6">지원</MenuItem>
                  <MenuItem value="7">보안</MenuItem>
                  <MenuItem value="8">기술검토</MenuItem>
                  <MenuItem value="9">리소스</MenuItem>
                  <MenuItem value="10">테스트</MenuItem>
                  <MenuItem value="11">문서화</MenuItem>
                  <MenuItem value="12">관리</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>우선순위</InputLabel>
                <Select
                  value={editedTask.priority || 'MEDIUM'}
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  <MenuItem value="LOW">낮음</MenuItem>
                  <MenuItem value="MEDIUM">보통</MenuItem>
                  <MenuItem value="HIGH">높음</MenuItem>
                  <MenuItem value="CRITICAL">긴급</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>상태</InputLabel>
                <Select
                  value={editedTask.status || 'TODO'}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <MenuItem value="TODO">할 일</MenuItem>
                  <MenuItem value="IN_PROGRESS">진행 중</MenuItem>
                  <MenuItem value="DONE">완료</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>담당자</InputLabel>
                <Select
                  value={editedTask.assignee_id || ''}
                  onChange={(e) => handleChange('assignee_id', e.target.value)}
                >
                  <MenuItem value="">없음</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>상위 일감</InputLabel>
                <Select
                  value={editedTask.parent_id || ''}
                  onChange={(e) => handleChange('parent_id', e.target.value)}
                >
                  <MenuItem value="">없음</MenuItem>
                  {availableParentTasks.map((task) => (
                    <MenuItem key={task.id} value={task.id}>
                      {task.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="예상 시간 (시간)"
                type="number"
                value={editedTask.estimated_hours || ''}
                onChange={(e) => handleChange('estimated_hours', parseInt(e.target.value) || null)}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskEditDialog;
