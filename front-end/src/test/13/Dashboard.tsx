import React from 'react';
import { Grid, Typography, Box, useTheme } from '@mui/material';
import DashboardLayout from '../13/DashboardLayout';
import StatCard from '../../components/StatCard';
import ProjectCard from '../../components/ProjectCard';
import TaskList from '../../components/TaskList';
import ChartCard from '../../components/ChartCard';
import { 
  BarChart as BarChartIcon, 
  People as PeopleIcon, 
  AttachMoney as MoneyIcon, 
  TrendingUp as TrendingUpIcon 
} from '@mui/icons-material';

// Données de démonstration pour le graphique
const chartData = [
  { name: 'Jan', value: 4000 },
  { name: 'Fév', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Avr', value: 4500 },
  { name: 'Mai', value: 6000 },
  { name: 'Juin', value: 5500 },
  { name: 'Juil', value: 7000 },
];

// Données de démonstration pour les tâches
const tasks = [
  { id: 1, title: 'Finaliser le rapport mensuel', completed: true },
  { id: 2, title: 'Réunion avec l\'équipe marketing', completed: false },
  { id: 3, title: 'Mettre à jour la documentation', completed: false },
  { id: 4, title: 'Préparer la présentation client', completed: false },
];

const Dashboard: React.FC = () => {
  const theme = useTheme();

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Tableau de bord
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenue ! Voici un aperçu de vos activités et performances.
        </Typography>
      </Box>

      {/* Cartes de statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Revenus" 
            value="12 450 €" 
            trend={4.3} 
            icon={<MoneyIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Utilisateurs" 
            value="1 230" 
            trend={6.9} 
            icon={<PeopleIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Nouveaux clients" 
            value="125" 
            trend={5.7} 
            icon={<TrendingUpIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Taux de conversion" 
            value="8.5%" 
            trend={-2.7} 
            icon={<BarChartIcon />}
          />
        </Grid>
      </Grid>

      {/* Graphique et liste de tâches */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <ChartCard 
            title="Évolution des revenus" 
            subtitle="Derniers 7 mois" 
            data={chartData} 
            dataKey="value" 
            type="area"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TaskList 
            title="Tâches récentes" 
            tasks={tasks} 
          />
        </Grid>
      </Grid>

      {/* Projets en cours */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
          Projets en cours
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <ProjectCard 
            title="Refonte du site web" 
            progress={50} 
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ProjectCard 
            title="Application mobile" 
            progress={60} 
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ProjectCard 
            title="Campagne marketing" 
            progress={35} 
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default Dashboard;
