import React from 'react';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

interface InfoCardProps {
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  variant?: 'default' | 'outlined';
}

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'cardColor' && prop !== 'variant',
})<{ cardColor?: string; variant?: string }>(({ theme, cardColor, variant }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius,
  boxShadow: variant === 'outlined' ? 'none' : theme.shadows[1],
  border: variant === 'outlined' ? `1px solid ${theme.palette.divider}` : 'none',
  overflow: 'hidden',
  position: 'relative',
  '&::before': cardColor ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    backgroundColor: cardColor,
  } : {},
}));

const IconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<{ bgColor?: string }>(({ theme, bgColor }) => ({
  backgroundColor: bgColor ? `${bgColor}20` : theme.palette.primary.light,
  color: bgColor || theme.palette.primary.main,
  borderRadius: '50%',
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const InfoCard: React.FC<InfoCardProps> = ({ 
  title, 
  content, 
  icon, 
  color,
  variant = 'default'
}) => {
  const theme = useTheme();
  const cardColor = color || theme.palette.primary.main;

  return (
    <StyledCard cardColor={cardColor} variant={variant}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
          {icon && (
            <IconWrapper bgColor={cardColor}>
              {icon}
            </IconWrapper>
          )}
        </Box>
        <Box>
          {typeof content === 'string' ? (
            <Typography variant="body2">{content}</Typography>
          ) : (
            content
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default InfoCard;
