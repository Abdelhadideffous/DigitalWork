'use client';

import { Box, Chip, Paper, Typography, useTheme } from '@mui/material';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    count: number;
    trend: string;
    trendUp: boolean;
    bgColor: string;
    textColor: string;
}

const StatsCard: React.FC<StatCardProps> = ({ icon, label, count, trend, trendUp, bgColor, textColor }) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2,
                padding: 2.5,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                },
            }}
        >
            <Box
                sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    backgroundColor: bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 2,
                    color: textColor,
                }}
            >
                {icon}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {count}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                        {label}
                    </Typography>
                    <Chip
                        icon={trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        label={trend}
                        size="small"
                        sx={{
                            backgroundColor: trendUp ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                            color: trendUp ? '#4caf50' : '#f44336',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 22,
                            '& .MuiChip-icon': {
                                marginLeft: 0.5,
                                marginRight: -0.5,
                            },
                        }}
                    />
                </Box>
            </Box>
        </Paper>
    );
};

export default StatsCard;
