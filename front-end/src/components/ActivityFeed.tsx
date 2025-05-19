import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';

interface ActivityItem {
  id: number;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  time: string;
}

interface ActivityFeedProps {
  title: string;
  activities: ActivityItem[];
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const TimeStamp = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  marginTop: theme.spacing(0.5),
}));

const ActivityFeed: React.FC<ActivityFeedProps> = ({ title, activities }) => {
  return (
    <StyledCard>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <List sx={{ py: 0 }}>
          {activities.length > 0 ? (
            activities.map((activity) => (
              <StyledListItem key={activity.id} alignItems="flex-start" disablePadding>
                <ListItemAvatar>
                  <Avatar 
                    alt={activity.user.name} 
                    src={activity.user.avatar}
                    sx={{ width: 40, height: 40 }}
                  >
                    {!activity.user.avatar && activity.user.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2">
                      <Typography component="span" fontWeight="bold">
                        {activity.user.name}
                      </Typography>{' '}
                      {activity.action}{' '}
                      <Typography component="span" fontWeight="medium" color="primary.main">
                        {activity.target}
                      </Typography>
                    </Typography>
                  }
                  secondary={
                    <TimeStamp>
                      <AccessTimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                      {activity.time}
                    </TimeStamp>
                  }
                />
              </StyledListItem>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              Aucune activité récente
            </Typography>
          )}
        </List>
      </CardContent>
    </StyledCard>
  );
};

export default ActivityFeed;
