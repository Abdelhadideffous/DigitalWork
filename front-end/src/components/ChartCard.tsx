import React from 'react';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  type?: 'line' | 'area';
  height?: number | string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  subtitle, 
  data, 
  dataKey, 
  xAxisKey = 'name',
  type = 'line',
  height = 300
}) => {
  const theme = useTheme();

  return (
    <StyledCard>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' ? (
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 5,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey={xAxisKey} 
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <YAxis 
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[3],
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={{ r: 4, fill: theme.palette.primary.main, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: theme.palette.primary.main, strokeWidth: 0 }}
                />
              </LineChart>
            ) : (
              <AreaChart
                data={data}
                margin={{
                  top: 5,
                  right: 5,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey={xAxisKey} 
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <YAxis 
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[3],
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  fill={theme.palette.primary.light}
                  fillOpacity={0.3}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default ChartCard;
