'use client';

import { Box, useTheme } from '@mui/material';
import type React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ChartData {
    name: string;
    value: number;
}

interface ProjectsChartProps {
    data: ChartData[];
}

const ProjectsChart: React.FC<ProjectsChartProps> = ({ data }) => {
    const theme = useTheme();

    // Couleurs pour les différents statuts
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'À démarrer':
                return '#ff9800';
            case 'En cours':
                return '#1976d2';
            case 'Terminé':
                return '#4caf50';
            case 'En retard':
                return '#f44336';
            default:
                return '#757575';
        }
    };

    // Formater les données pour le graphique
    const chartData = data.map((item) => ({
        name: item.name,
        value: item.value,
        color: getStatusColor(item.name),
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
                    <Box sx={{ fontWeight: 600, mb: 0.5 }}>{label}</Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: payload[0].payload.color,
                            }}
                        />
                        <Box>{`${payload[0].value} projets`}</Box>
                    </Box>
                </Box>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                barSize={40}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <XAxis
                    dataKey="name"
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                    tickLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                />
                <YAxis
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                    tickLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ paddingTop: 10 }}
                    formatter={(value) => <span style={{ color: theme.palette.text.primary, fontSize: 12 }}>{value}</span>}
                />
                <Bar dataKey="value" name="Nombre de projets" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1000}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ProjectsChart;
