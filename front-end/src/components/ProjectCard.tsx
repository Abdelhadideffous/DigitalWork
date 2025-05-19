import React from 'react';
import { Box, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ProjectCardProps {
  title: string;
  progress: number;
  color?: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  transition: 'box-shadow 0.3s',
  '&:hover': {
    boxShadow: theme.shadows[3],
  },
}));

const ProjectCard: React.FC<ProjectCardProps> = ({ title, progress, color = 'primary.main' }) => {
  return (
    <StyledCard>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1" fontWeight="medium">
            {title}
          </Typography>
          <Typography variant="body2" fontWeight="bold" color={color}>
            {progress}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
            }
          }} 
        />
      </CardContent>
    </StyledCard>
  );
};

export default ProjectCard;
