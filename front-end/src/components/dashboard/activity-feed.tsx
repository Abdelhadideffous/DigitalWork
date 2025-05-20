import { Avatar, Box, Button, Card, CardContent, Divider, IconButton, List, ListItem, Typography, type SxProps, type Theme } from '@mui/material';
import { CheckSquare, ClipboardCheck, FolderPlus, MessageSquare, MoreHorizontal, RefreshCw, ThumbsUp, UserPlus } from 'lucide-react';
import React from 'react';

interface Activity {
    id: number;
    type: string;
    user: string;
    content: string;
    target: string;
    time: string;
    avatar: string;
}

interface ActivityFeedProps {
    activities: Activity[];
    sx?: SxProps<Theme>;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, sx }) => {
    // Fonction pour obtenir l'icône en fonction du type d'activité
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'project_created':
                return <FolderPlus size={16} color="#1976d2" />;
            case 'task_completed':
                return <CheckSquare size={16} color="#4caf50" />;
            case 'comment_added':
                return <MessageSquare size={16} color="#ff9800" />;
            case 'user_joined':
                return <UserPlus size={16} color="#9c27b0" />;
            case 'edb_approved':
                return <ClipboardCheck size={16} color="#16A249" />;
            default:
                return <MessageSquare size={16} color="#607d8b" />;
        }
    };

    return (
        <Card
            sx={{
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
                ...sx,
            }}
        >
            <CardContent sx={{ p: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Activités récentes
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                            <RefreshCw size={18} />
                        </IconButton>
                        <IconButton size="small">
                            <MoreHorizontal size={18} />
                        </IconButton>
                    </Box>
                </Box>

                <Divider />

                <List sx={{ py: 0 }}>
                    {activities.map((activity, index) => (
                        <React.Fragment key={activity.id}>
                            <ListItem
                                sx={{
                                    py: 2,
                                    px: 2,
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                                }}
                            >
                                <Box sx={{ display: 'flex', width: '100%' }}>
                                    <Avatar src={activity.avatar} alt={activity.user} sx={{ width: 40, height: 40, mr: 2 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                                                {activity.user}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: 'rgba(0,0,0,0.04)',
                                                    p: 0.5,
                                                    borderRadius: 1,
                                                    mr: 1,
                                                }}
                                            >
                                                {getActivityIcon(activity.type)}
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            {activity.content} <strong>{activity.target}</strong>
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {activity.time}
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                            <Button
                                                size="small"
                                                startIcon={<ThumbsUp size={14} />}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontSize: '0.75rem',
                                                    color: 'text.secondary',
                                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
                                                }}
                                            >
                                                J'aime
                                            </Button>
                                            <Button
                                                size="small"
                                                startIcon={<MessageSquare size={14} />}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontSize: '0.75rem',
                                                    color: 'text.secondary',
                                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
                                                }}
                                            >
                                                Commenter
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            </ListItem>
                            {index < activities.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>

                <Divider />

                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Button
                        variant="text"
                        sx={{
                            textTransform: 'none',
                            color: '#16A249',
                            '&:hover': { bgcolor: 'rgba(22, 162, 73, 0.05)' },
                        }}
                    >
                        Voir toutes les activités
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ActivityFeed;
