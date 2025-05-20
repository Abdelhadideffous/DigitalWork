'use client';

import { Box, useTheme } from '@mui/material';
import type React from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartData {
    name: string;
    value: number;
}

interface TasksChartProps {
    data: ChartData[];
}

const TasksChart: React.FC<TasksChartProps> = ({ data }) => {
    const theme = useTheme();

    // Couleurs pour les différentes priorités
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Haute':
                return '#f44336';
            case 'Moyenne':
                return '#ff9800';
            case 'Basse':
                return '#4caf50';
            default:
                return '#757575';
        }
    };

    // Formater les données pour le graphique
    const chartData = data.map((item) => ({
        name: item.name,
        value: item.value,
        color: getPriorityColor(item.name),
    }));

    // Personnalisation du tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        p: 1.5,
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                >
                    <Box sx={{ fontWeight: 600, mb: 0.5 }}>{payload[0].name}</Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: payload[0].payload.color,
                            }}
                        />
                        <Box>{`${payload[0].value} tâches`}</Box>
                    </Box>
                </Box>
            );
        }
        return null;
    };

    // Rendu personnalisé pour le label
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={1000}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: 20 }}
                    formatter={(value) => <span style={{ color: theme.palette.text.primary, fontSize: 12 }}>{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default TasksChart;
