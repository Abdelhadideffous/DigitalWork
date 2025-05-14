// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Breadcrumbs,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SpeedIcon from '@mui/icons-material/Speed';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import AppLayout from '../layout/AppLayout';

// Types pour les données
interface PerformanceData {
  projects: {
    count: number;
    percentage_change: number;
  };
  tasks: {
    count: number;
    percentage_change: number;
  };
  performance: {
    percentage: number;
    percentage_change: number;
  };
  deadlines_met: {
    percentage: number;
    percentage_change: number;
  };
  key_points: string[];
}

interface ApiResponse {
  success: boolean;
  data: PerformanceData;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  borderRadius: 16,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
}));

const StatIcon = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
}));

const FlexContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  margin: theme.spacing(-1.5),
}));

const FlexItem = styled(Box)(({ theme }) => ({
  flex: '1 1 calc(25% - 24px)',
  margin: theme.spacing(1.5),
  minWidth: '220px',
}));

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PerformanceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Dans un environnement réel, utilisez l'URL réelle de votre API
        const response = await axios.get<ApiResponse>('/api/dashboard/performance-summary');
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError('Erreur lors du chargement des données');
        }
      } catch (err) {
        setError('Erreur de serveur');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Pour des besoins de démonstration, je vais simuler les données
    // Remplacez ce bloc par fetchData() lorsque votre API est prête
    setTimeout(() => {
      setData({
        projects: { count: 25, percentage_change: 15 },
        tasks: { count: 124, percentage_change: 8 },
        performance: { percentage: 89, percentage_change: 5 },
        deadlines_met: { percentage: 92, percentage_change: 12 },
        key_points: [
          "La performance globale de l'équipe a augmenté de 5% ce trimestre",
          "Le respect des délais s'est amélioré de 12%, atteignant 92%",
          "Le nombre de projets actifs a augmenté de 15%",
          "Le département technique a la meilleure performance avec 95%",
          "Le projet \"Intégration CRM\" progresse plus rapidement que prévu"
        ]
      });
      setLoading(false);
    }, 1000);

    // fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">{error || "Données non disponibles"}</Typography>
      </Box>
    );
  }

  return (
    <AppLayout>
       <Container maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', py: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" color="inherit" href="/">
                Tableau de bord
              </Link>
              <Typography sx={{ color: "text.primary" }}>Rapports</Typography>
            </Breadcrumbs>
          </Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 3 }}>
          Rapports
          </Typography>



    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Résumé des performances
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Aperçu global des performances de l'entreprise
      </Typography>

      <FlexContainer sx={{ mb: 4 }}>
        {/* Projets */}
        <FlexItem>
          <StyledPaper>
            <StatIcon sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)' }}>
              <BarChartIcon sx={{ color: '#22c55e' }} />
            </StatIcon>
            <Typography variant="subtitle1" color="text.secondary">
              Projets
            </Typography>
            <Typography variant="h3" fontWeight="bold" mt={1}>
              {data.projects.count}
            </Typography>
            <Typography 
              variant="body2"
              color="success.main"
              mt={1}
            >
              +{data.projects.percentage_change}% par rapport au trimestre précédent
            </Typography>
          </StyledPaper>
        </FlexItem>

        {/* Tâches */}
        <FlexItem>
          <StyledPaper>
            <StatIcon sx={{ bgcolor: 'rgba(14, 165, 233, 0.1)' }}>
              <AssignmentIcon sx={{ color: '#0ea5e9' }} />
            </StatIcon>
            <Typography variant="subtitle1" color="text.secondary">
              Tâches
            </Typography>
            <Typography variant="h3" fontWeight="bold" mt={1}>
              {data.tasks.count}
            </Typography>
            <Typography 
              variant="body2"
              color="success.main"
              mt={1}
            >
              +{data.tasks.percentage_change}% par rapport au trimestre précédent
            </Typography>
          </StyledPaper>
        </FlexItem>

        {/* Performance */}
        <FlexItem>
          <StyledPaper>
            <StatIcon sx={{ bgcolor: 'rgba(168, 85, 247, 0.1)' }}>
              <SpeedIcon sx={{ color: '#a855f7' }} />
            </StatIcon>
            <Typography variant="subtitle1" color="text.secondary">
              Performance
            </Typography>
            <Typography variant="h3" fontWeight="bold" mt={1}>
              {data.performance.percentage}%
            </Typography>
            <Typography 
              variant="body2"
              color="success.main"
              mt={1}
            >
              +{data.performance.percentage_change}% par rapport au trimestre précédent
            </Typography>
          </StyledPaper>
        </FlexItem>

        {/* Délais respectés */}
        <FlexItem>
          <StyledPaper>
            <StatIcon sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
              <EventAvailableIcon sx={{ color: '#10b981' }} />
            </StatIcon>
            <Typography variant="subtitle1" color="text.secondary">
              Délais respectés
            </Typography>
            <Typography variant="h3" fontWeight="bold" mt={1}>
              {data.deadlines_met.percentage}%
            </Typography>
            <Typography 
              variant="body2"
              color="success.main"
              mt={1}
            >
              +{data.deadlines_met.percentage_change}% par rapport au trimestre précédent
            </Typography>
          </StyledPaper>
        </FlexItem>
      </FlexContainer>

      {/* Points clés */}
      <StyledPaper>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Points clés
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List sx={{ p: 0 }}>
          {data.key_points.map((point, index) => (
            <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 24 }}>
                <FiberManualRecordIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary={point} />
            </ListItem>
          ))}
        </List>
      </StyledPaper>
     </Container>
     </Container>
    </AppLayout>
  );
};

export default Dashboard;