import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    type SxProps,
    type Theme,
} from '@mui/material';
import { ArrowRight, Edit, Eye, Filter, MoreHorizontal, Plus, Trash } from 'lucide-react';
import type React from 'react';

interface Project {
    id: number;
    title: string;
    status?: { name: string };
    status_id?: number;
    priority?: { name: string };
    priority_id?: number;
    progress?: number;
    end_date?: string;
}

interface RecentProjectsProps {
    projects: Project[];
    sx?: SxProps<Theme>;
}

const RecentProjects: React.FC<RecentProjectsProps> = ({ projects, sx }) => {
    // Fonction pour obtenir la couleur du statut
    const getStatusColor = (statut: string) => {
        switch (statut) {
            case 'À démarrer':
                return { bg: '#fff8e1', text: '#ff9800' };
            case 'En cours':
                return { bg: '#e3f2fd', text: '#1976d2' };
            case 'Terminé':
                return { bg: '#e8f5e9', text: '#4caf50' };
            case 'En retard':
                return { bg: '#ffebee', text: '#f44336' };
            default:
                return { bg: '#f5f5f5', text: '#757575' };
        }
    };

    // Fonction pour obtenir la couleur de la priorité
    const getPriorityColor = (priorite: string) => {
        switch (priorite) {
            case 'Haute':
                return { bg: '#ffebee', text: '#f44336' };
            case 'Moyenne':
                return { bg: '#fff8e1', text: '#ff9800' };
            case 'Basse':
                return { bg: '#e8f5e9', text: '#4caf50' };
            default:
                return { bg: '#f5f5f5', text: '#757575' };
        }
    };

    // Fonction pour obtenir la couleur de la progression
    const getProgressColor = (progress: number) => {
        if (progress === 100) return '#4caf50';
        if (progress < 30) return '#f44336';
        return '#2196f3';
    };

    // Fonction pour formater les données du projet
    const formatProjectData = (project: Project) => {
        const statusName = project.status?.name || 'Inconnu';
        const priorityName = project.priority?.name || 'Moyenne';
        const progress = project.progress || 0;
        const dueDate = project.end_date ? new Date(project.end_date).toLocaleDateString('fr-FR') : 'Non défini';

        return {
            id: project.id,
            title: project.title,
            status: statusName,
            priority: priorityName,
            progress,
            dueDate,
        };
    };

    const formattedProjects = projects.map(formatProjectData);

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
                        Projets récents
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Filter size={16} />}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 1.5,
                                borderColor: 'rgba(0,0,0,0.1)',
                                color: 'text.secondary',
                                '&:hover': { borderColor: 'rgba(0,0,0,0.2)' },
                            }}
                        >
                            Filtrer
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Plus size={16} />}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 1.5,
                                bgcolor: '#16A249',
                                '&:hover': { bgcolor: '#138a3c' },
                            }}
                        >
                            Ajouter
                        </Button>
                        <IconButton size="small">
                            <MoreHorizontal size={18} />
                        </IconButton>
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Titre</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Priorité</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Progression</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Date limite</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="right">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {formattedProjects.length > 0 ? (
                                formattedProjects.map((project) => {
                                    const statusColor = getStatusColor(project.status);
                                    const priorityColor = getPriorityColor(project.priority);
                                    const progressColor = getProgressColor(project.progress);

                                    return (
                                        <TableRow key={project.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {project.title}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={project.status}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: statusColor.bg,
                                                        color: statusColor.text,
                                                        fontWeight: 600,
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={project.priority}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: priorityColor.bg,
                                                        color: priorityColor.text,
                                                        fontWeight: 600,
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={project.progress}
                                                        sx={{
                                                            width: 80,
                                                            height: 6,
                                                            borderRadius: 3,
                                                            bgcolor: 'rgba(0,0,0,0.05)',
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: progressColor,
                                                                borderRadius: 3,
                                                            },
                                                        }}
                                                    />
                                                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                                                        {project.progress}%
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                                    {project.dueDate}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <Tooltip title="Voir les détails">
                                                        <IconButton size="small" sx={{ mr: 0.5 }}>
                                                            <Eye size={16} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Modifier">
                                                        <IconButton size="small" sx={{ mr: 0.5 }}>
                                                            <Edit size={16} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Supprimer">
                                                        <IconButton size="small" color="error">
                                                            <Trash size={16} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Aucun projet trouvé
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <Button
                        endIcon={<ArrowRight size={16} />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            color: '#16A249',
                            '&:hover': { bgcolor: 'rgba(22, 162, 73, 0.05)' },
                        }}
                    >
                        Voir tous les projets
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default RecentProjects;
