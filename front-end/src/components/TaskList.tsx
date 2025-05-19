import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, Checkbox, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface TaskListProps {
  title: string;
  tasks: Task[];
  onToggleComplete?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    '& .task-actions': {
      opacity: 1,
    },
  },
}));

const TaskList: React.FC<TaskListProps> = ({ 
  title, 
  tasks, 
  onToggleComplete = () => {}, 
  onEdit = () => {}, 
  onDelete = () => {} 
}) => {
  return (
    <StyledCard>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <List sx={{ pt: 1 }}>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <StyledListItem
                key={task.id}
                disablePadding
                secondaryAction={
                  <Box className="task-actions" sx={{ opacity: { xs: 1, sm: 0 }, transition: 'opacity 0.2s' }}>
                    <IconButton edge="end" aria-label="edit" size="small" onClick={() => onEdit(task.id)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" size="small" onClick={() => onDelete(task.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
                sx={{ py: 0.5, px: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Checkbox
                    edge="start"
                    checked={task.completed}
                    onChange={() => onToggleComplete(task.id)}
                    sx={{
                      color: 'primary.main',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={task.title}
                  sx={{
                    '& .MuiTypography-root': {
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? 'text.secondary' : 'text.primary',
                    },
                  }}
                />
              </StyledListItem>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              Aucune tâche à afficher
            </Typography>
          )}
        </List>
      </CardContent>
    </StyledCard>
  );
};

export default TaskList;
