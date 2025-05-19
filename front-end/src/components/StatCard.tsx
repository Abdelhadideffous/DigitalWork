import React from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[3],
  },
}));

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, trend, icon }) => {
  const isPositive = trend && trend > 0;
  const trendColor = isPositive ? 'success.main' : 'error.main';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <StyledCard>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {icon && (
            <Box sx={{ 
              backgroundColor: 'primary.light', 
              borderRadius: '50%', 
              width: 40, 
              height: 40, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'primary.main'
            }}>
              {icon}
            </Box>
          )}
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
          {value}
        </Typography>
        {(subtitle || trend) && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', color: trendColor, mr: 1 }}>
                <TrendIcon fontSize="small" />
                <Typography variant="body2" component="span" sx={{ fontWeight: 'medium', ml: 0.5 }}>
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default StatCard;
