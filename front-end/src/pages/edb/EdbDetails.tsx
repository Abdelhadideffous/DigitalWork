'use client';

import {
    Alert,
    Avatar,
    Badge,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    LinearProgress,
    Link,
    Paper,
    Snackbar,
    Tab,
    Tabs,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AlertTriangle,
    ArrowLeft,
    BarChart4,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileText,
    FileUp,
    Paperclip,
    Plus,
    Trash2,
    Upload,
    XCircle,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { getCurrentUser } from '../login/api';
import { edbApi, type Attachment, type Edb, type Priority, type Status } from './apiedb';

interface EdbDetailsProps {
    edb: Edb;
    onBack: () => void;
    onApprove: (edbId: number) => Promise<void>;
    onReject: (edbId: number) => Promise<void>;
    statuses: Status[];
    priorities: Priority[];
}

const EdbDetails: React.FC<EdbDetailsProps> = ({ edb, onBack, onApprove, onReject, statuses, priorities }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAttachmentId, setSelectedAttachmentId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // État pour l'utilisateur connecté
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info' | 'warning',
    });

    // Récupérer l'utilisateur connecté au chargement du composant
    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    // Fonction pour charger les pièces jointes
    const fetchAttachments = async () => {
        if (!edb?.id) return;

        try {
            setLoading(true);
            const attachmentsData = await edbApi.getEdbAttachments(edb.id);
            setAttachments(attachmentsData);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des pièces jointes:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des pièces jointes',
                severity: 'error',
            });
            setLoading(false);
        }
    };

    // Charger les pièces jointes au chargement du composant et lorsque l'onglet change
    useEffect(() => {
        fetchAttachments()
      }, [edb?.id])

    // Fonction pour changer d'onglet
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    // Fonction pour approuver l'EDB
    const handleApprove = async () => {
        if (!edb?.id) return;
        try {
            setLoading(true);
            await onApprove(edb.id);
            setSnackbar({
                open: true,
                message: 'EDB approuvée avec succès',
                severity: 'success',
            });
            setLoading(false);
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Erreur lors de l'approbation de l'EDB",
                severity: 'error',
            });
            setLoading(false);
        }
    };

    // Fonction pour rejeter l'EDB
    const handleReject = async () => {
        if (!edb?.id) return;
        try {
            setLoading(true);
            await onReject(edb.id);
            setSnackbar({
                open: true,
                message: 'EDB rejetée avec succès',
                severity: 'success',
            });
            setLoading(false);
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Erreur lors du rejet de l'EDB",
                severity: 'error',
            });
            setLoading(false);
        }
    };

    // Fonction pour ouvrir le dialogue d'upload
    const handleUploadDialogOpen = () => {
        setUploadDialogOpen(true);
        setSelectedFiles([]);
    };

    // Fonction pour fermer le dialogue d'upload
    const handleUploadDialogClose = () => {
        setUploadDialogOpen(false);
        setSelectedFiles([]);
    };

    // Fonction pour gérer la sélection de fichiers
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(Array.from(event.target.files));
        }
    };

    // Fonction pour uploader les fichiers
    const handleUploadFiles = async () => {
        if (!edb?.id || selectedFiles.length === 0) return;

        try {
            setLoading(true);
            await edbApi.uploadAttachments(edb.id, selectedFiles);
            await fetchAttachments();
            handleUploadDialogClose();
            setSnackbar({
                open: true,
                message: 'Fichiers téléversés avec succès',
                severity: 'success',
            });
            setLoading(false);
        } catch (error) {
            console.error("Erreur lors de l'upload des fichiers:", error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du téléversement des fichiers',
                severity: 'error',
            });
            setLoading(false);
        }
    };

    // Fonction pour ouvrir le dialogue de suppression
    const handleDeleteDialogOpen = (attachmentId: number) => {
        setSelectedAttachmentId(attachmentId);
        setDeleteDialogOpen(true);
    };

    // Fonction pour fermer le dialogue de suppression
    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
        setSelectedAttachmentId(null);
    };

    // Fonction pour supprimer une pièce jointe
    const handleDeleteAttachment = async () => {
        if (!edb?.id || !selectedAttachmentId) return;

        try {
            setLoading(true);
            await edbApi.deleteAttachment(edb.id, selectedAttachmentId);
            await fetchAttachments();
            handleDeleteDialogClose();
            setSnackbar({
                open: true,
                message: 'Pièce jointe supprimée avec succès',
                severity: 'success',
            });
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors de la suppression de la pièce jointe:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors de la suppression de la pièce jointe',
                severity: 'error',
            });
            setLoading(false);
        }
    };

    // Fonction pour prévisualiser une pièce jointe
    const handlePreviewAttachment = (attachmentId: number) => {
        const url = `http://localhost:8000/api/edbs/${edb.id}/attachments/${attachmentId}`;
        window.open(url, '_blank');
    };

    // Fonction pour fermer la prévisualisation
    const handlePreviewDialogClose = () => {
        setPreviewDialogOpen(false);
        setPreviewUrl('');
    };

    // Fonction pour télécharger une pièce jointe
    const handleDownloadAttachment = (attachmentId: number, fileName: string) => {
        const link = document.createElement('a');
        link.href = `http://localhost:8000/api/edbs/${edb.id}/attachments/${attachmentId}/download`;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Fonction pour obtenir le nom du statut à partir de l'ID
    const getStatusName = (statusId: number) => {
        const status = statuses.find((s) => s.id === statusId);
        return status ? status.name : 'Inconnu';
    };

    // Fonction pour obtenir le nom de la priorité à partir de l'ID
    const getPriorityName = (priorityId: number) => {
        const priority = priorities.find((p) => p.id === priorityId);
        return priority ? priority.name : 'Inconnue';
    };

    // Fonction pour formater la date pour l'affichage
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Fonction pour obtenir la couleur du statut
    const getStatusColor = (statusName: string) => {
        switch (statusName.toLowerCase()) {
            case 'en cours':
                return '#2196f3';
            case 'en attente':
                return '#ff9800';
            case 'validé':
                return '#4caf50';
            case 'rejeté':
                return '#f44336';
            default:
                return '#757575';
        }
    };

    // Fonction pour obtenir la couleur de la priorité
    const getPriorityColor = (priorityName: string) => {
        switch (priorityName.toLowerCase()) {
            case 'haute':
                return '#f44336';
            case 'moyenne':
                return '#ff9800';
            case 'basse':
                return '#4caf50';
            default:
                return '#757575';
        }
    };

    // Fonction pour obtenir l'icône du type de fichier
    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return <FileText size={24} color="#f44336" />;
            case 'doc':
            case 'docx':
                return <FileText size={24} color="#2196f3" />;
            case 'xls':
            case 'xlsx':
                return <FileText size={24} color="#4caf50" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
                return <FileText size={24} color="#ff9800" />;
            default:
                return <FileText size={24} color="#757575" />;
        }
    };

    // Fonction pour fermer la notification
    const handleSnackbarClose = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // Fonction pour obtenir les initiales d'un nom
    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <>
            {/* Indicateur de chargement */}
            {loading && <LinearProgress color="success" sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999 }} />}

            {/* Snackbar pour feedback utilisateur */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} onClose={handleSnackbarClose} sx={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* En-tête avec fil d'Ariane */}
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link
                        underline="hover"
                        color="inherit"
                        href="/1"
                        onClick={(e) => {
                            e.preventDefault();
                            onBack();
                        }}
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        Tableau de bord
                    </Link>
                    <Link
                        underline="hover"
                        color="inherit"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            onBack();
                        }}
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        Expressions de Besoin
                    </Link>
                    <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                        EDB-{edb?.id}
                    </Typography>
                </Breadcrumbs>

                {/* Bouton retour et titre */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowLeft size={18} />}
                        onClick={onBack}
                        sx={{
                            mr: 2,
                            borderRadius: '8px',
                            borderColor: 'rgba(0,0,0,0.12)',
                            color: 'text.primary',
                            '&:hover': {
                                borderColor: 'rgba(0,0,0,0.24)',
                                bgcolor: 'rgba(0,0,0,0.04)',
                            },
                        }}
                    >
                        Retour
                    </Button>
                    <Typography variant="h4" component="h1" fontWeight="bold" sx={{ flexGrow: 1 }}>
                        {edb?.title}
                    </Typography>
                </Box>

                {/* Carte d'en-tête avec informations clés */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: '16px',
                        border: '1px solid rgba(0,0,0,0.08)',
                        background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        mb: 3,
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                        <Box sx={{ flex: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: '#16A249',
                                        width: 48,
                                        height: 48,
                                        mr: 2,
                                        boxShadow: '0 4px 8px rgba(22, 162, 73, 0.2)',
                                    }}
                                >
                                    {getInitials(edb?.user?.name || 'User')}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Demandeur
                                    </Typography>
                                    <Typography variant="h6" fontWeight="medium">
                                        {edb?.user?.name || 'Utilisateur non spécifié'}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Calendar size={20} color="#16A249" style={{ marginRight: 8 }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Date de demande
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {formatDate(edb?.date_demande)}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Clock size={20} color="#16A249" style={{ marginRight: 8 }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Dernière mise à jour
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {formatDate(edb?.updated_at || '')}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Paperclip size={20} color="#16A249" style={{ marginRight: 8 }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Pièces jointes
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {attachments.length || 0}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mb: 2 }}>
                                <Chip
                                    label={edb?.status?.name || getStatusName(edb?.status_id)}
                                    sx={{
                                        fontWeight: 'bold',
                                        color: 'white',
                                        bgcolor: getStatusColor(edb?.status?.name || getStatusName(edb?.status_id)),
                                        fontSize: '0.9rem',
                                        py: 2.5,
                                        px: 1,
                                        '& .MuiChip-label': { px: 2 },
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                <Chip
                                    label={`Priorité ${edb?.priority?.name || getPriorityName(edb?.priority_id)}`}
                                    sx={{
                                        fontWeight: 'medium',
                                        color: 'white',
                                        bgcolor: getPriorityColor(edb?.priority?.name || getPriorityName(edb?.priority_id)),
                                        fontSize: '0.85rem',
                                        py: 1.5,
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                {/* Boutons d'action */}
                {currentUser && currentUser.role === 'admin' && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Button
                            variant="contained"
                            onClick={handleApprove}
                            startIcon={<CheckCircle size={18} />}
                            disabled={loading || edb?.status?.name === 'Validé'}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                px: 3,
                                py: 1.2,
                                backgroundColor: '#16A249',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(22, 162, 73, 0.2)',
                                '&:hover': { backgroundColor: '#138a3c', boxShadow: '0 6px 16px rgba(22, 162, 73, 0.3)' },
                            }}
                        >
                            Approuver
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleReject}
                            startIcon={<XCircle size={18} />}
                            disabled={loading || edb?.status?.name === 'Rejeté'}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                px: 3,
                                py: 1.2,
                                backgroundColor: '#f44336',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)',
                                '&:hover': { backgroundColor: '#d32f2f', boxShadow: '0 6px 16px rgba(244, 67, 54, 0.3)' },
                            }}
                        >
                            Rejeter
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Onglets */}
            <Box sx={{ width: '100%', mb: 4 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    aria-label="edb tabs"
                    sx={{
                        mb: 3,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 'medium',
                            fontSize: '1rem',
                            minWidth: 120,
                            px: 3,
                        },
                        '& .Mui-selected': {
                            color: '#16A249 !important',
                            fontWeight: 'bold',
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#16A249',
                            height: 3,
                            borderRadius: '3px 3px 0 0',
                        },
                    }}
                >
                    <Tab label="Détails" icon={<FileText size={18} />} iconPosition="start" sx={{ borderRadius: '8px 8px 0 0' }} />
                    <Tab
                        label={
                            <Badge badgeContent={attachments.length} color="success" sx={{ '& .MuiBadge-badge': { fontWeight: 'bold' } }}>
                                Pièces jointes
                            </Badge>
                        }
                        icon={<Paperclip size={18} />}
                        iconPosition="start"
                        sx={{ borderRadius: '8px 8px 0 0' }}
                    />
                </Tabs>

                {/* Contenu de l'onglet Détails */}
                {activeTab === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                        {/* Colonne de gauche - Description */}
                        <Box sx={{ flex: '2', width: '100%' }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: '16px',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    background: 'white',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    height: '100%',
                                }}
                            >
                                <Typography variant="h6" fontWeight="bold" color="#16A249" gutterBottom>
                                    Description du besoin
                                </Typography>
                                <Divider sx={{ mb: 3, borderColor: 'rgba(22, 162, 73, 0.2)' }} />
                                <Typography
                                    variant="body1"
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: 1.7,
                                        color: 'text.primary',
                                        mb: 4,
                                    }}
                                >
                                    {edb?.description || 'Aucune description fournie.'}
                                </Typography>

                                <Typography variant="h6" fontWeight="bold" color="#16A249" gutterBottom sx={{ mt: 4 }}>
                                    Objectifs
                                </Typography>
                                <Divider sx={{ mb: 3, borderColor: 'rgba(22, 162, 73, 0.2)' }} />
                                <Typography
                                    variant="body1"
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: 1.7,
                                        color: 'text.primary',
                                        mb: 4,
                                    }}
                                >
                                    {edb?.objectif || 'Aucun objectif spécifié.'}
                                </Typography>

                                <Typography variant="h6" fontWeight="bold" color="#16A249" gutterBottom sx={{ mt: 4 }}>
                                    Contraintes
                                </Typography>
                                <Divider sx={{ mb: 3, borderColor: 'rgba(22, 162, 73, 0.2)' }} />
                                <Typography
                                    variant="body1"
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: 1.7,
                                        color: 'text.primary',
                                    }}
                                >
                                    {edb?.contrainte || 'Aucune contrainte spécifiée.'}
                                </Typography>
                            </Paper>
                        </Box>

                        {/* Colonne de droite - Informations et statistiques */}
                        <Box sx={{ flex: '1', width: '100%' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: '16px',
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        background: 'white',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    }}
                                >
                                    <Typography variant="h6" fontWeight="bold" color="#16A249" gutterBottom>
                                        Informations
                                    </Typography>
                                    <Divider sx={{ mb: 3, borderColor: 'rgba(22, 162, 73, 0.2)' }} />

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                ID
                                            </Typography>
                                            <Typography variant="body1" fontWeight="medium">
                                                EDB-{edb?.id}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Créé le
                                            </Typography>
                                            <Typography variant="body1" fontWeight="medium">
                                                {formatDate(edb?.created_at || '')}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Mis à jour le
                                            </Typography>
                                            <Typography variant="body1" fontWeight="medium">
                                                {formatDate(edb?.updated_at || '')}
                                            </Typography>
                                        </Box>

                                        <Divider sx={{ my: 1 }} />

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Statut
                                            </Typography>
                                            <Chip
                                                label={edb?.status?.name || getStatusName(edb?.status_id)}
                                                size="small"
                                                sx={{
                                                    fontWeight: 'medium',
                                                    color: 'white',
                                                    bgcolor: getStatusColor(edb?.status?.name || getStatusName(edb?.status_id)),
                                                }}
                                            />
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Priorité
                                            </Typography>
                                            <Chip
                                                label={edb?.priority?.name || getPriorityName(edb?.priority_id)}
                                                size="small"
                                                sx={{
                                                    fontWeight: 'medium',
                                                    color: 'white',
                                                    bgcolor: getPriorityColor(edb?.priority?.name || getPriorityName(edb?.priority_id)),
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Paper>

                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: '16px',
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    }}
                                >
                                    <Typography variant="h6" fontWeight="bold" color="#16A249" gutterBottom>
                                        Demandeur
                                    </Typography>
                                    <Divider sx={{ mb: 3, borderColor: 'rgba(22, 162, 73, 0.2)' }} />

                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: '#16A249',
                                                width: 48,
                                                height: 48,
                                                mr: 2,
                                            }}
                                        >
                                            {getInitials(edb?.user?.name || 'User')}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body1" fontWeight="medium">
                                                {edb?.user?.name || 'Utilisateur non spécifié'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Demandeur
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>

                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: '16px',
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        background: 'linear-gradient(135deg, #e8f5e9, #ffffff)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="bold" color="#16A249">
                                            Actions rapides
                                        </Typography>
                                        <BarChart4 size={20} color="#16A249" />
                                    </Box>
                                    <Divider sx={{ mb: 3, borderColor: 'rgba(22, 162, 73, 0.2)' }} />

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<FileUp size={18} />}
                                            onClick={() => setActiveTab(1)}
                                            sx={{
                                                textTransform: 'none',
                                                borderRadius: '8px',
                                                borderColor: '#16A249',
                                                color: '#16A249',
                                                '&:hover': {
                                                    borderColor: '#138a3c',
                                                    bgcolor: 'rgba(22, 162, 73, 0.05)',
                                                },
                                            }}
                                        >
                                            Gérer les pièces jointes
                                        </Button>

                                        {currentUser && currentUser.role === 'admin' && edb?.status?.name !== 'Validé' && (
                                            <Button
                                                variant="contained"
                                                startIcon={<CheckCircle size={18} />}
                                                onClick={handleApprove}
                                                disabled={loading}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: '8px',
                                                    backgroundColor: '#16A249',
                                                    color: 'white',
                                                    '&:hover': { backgroundColor: '#138a3c' },
                                                }}
                                            >
                                                Approuver l'EDB
                                            </Button>
                                        )}

                                        {currentUser && currentUser.role === 'admin' && edb?.status?.name !== 'Rejeté' && (
                                            <Button
                                                variant="outlined"
                                                startIcon={<XCircle size={18} />}
                                                onClick={handleReject}
                                                disabled={loading}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: '8px',
                                                    borderColor: '#f44336',
                                                    color: '#f44336',
                                                    '&:hover': {
                                                        borderColor: '#d32f2f',
                                                        bgcolor: 'rgba(244, 67, 54, 0.05)',
                                                    },
                                                }}
                                            >
                                                Rejeter l'EDB
                                            </Button>
                                        )}
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Contenu de l'onglet Pièces jointes */}
                {activeTab === 1 && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: '16px',
                            border: '1px solid rgba(0,0,0,0.08)',
                            background: 'white',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" fontWeight="bold" color="#16A249">
                                Pièces jointes
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Plus size={18} />}
                                onClick={handleUploadDialogOpen}
                                disabled={loading}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    backgroundColor: '#16A249',
                                    color: 'white',
                                    boxShadow: '0 4px 12px rgba(22, 162, 73, 0.2)',
                                    '&:hover': { backgroundColor: '#138a3c', boxShadow: '0 6px 16px rgba(22, 162, 73, 0.3)' },
                                }}
                            >
                                Ajouter des fichiers
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 3, borderColor: 'rgba(22, 162, 73, 0.2)' }} />

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress size={40} sx={{ color: '#16A249' }} />
                            </Box>
                        ) : attachments.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {attachments.map((attachment) => (
                                    <Box key={attachment.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 8px)' } }}>
                                        <Card
                                            elevation={0}
                                            sx={{
                                                borderRadius: '12px',
                                                border: '1px solid rgba(0,0,0,0.08)',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                },
                                            }}
                                        >
                                            <CardContent sx={{ p: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    {getFileIcon(attachment.file_name)}
                                                    <Box sx={{ ml: 2, flex: 1, overflow: 'hidden' }}>
                                                        <Typography
                                                            variant="subtitle1"
                                                            fontWeight="medium"
                                                            sx={{
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {attachment.file_name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Ajouté le {formatDate(attachment.created_at || '')}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Divider sx={{ my: 2 }} />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Tooltip title="Prévisualiser">
                                                        <IconButton
                                                            onClick={() => handlePreviewAttachment(attachment.id)}
                                                            size="small"
                                                            sx={{
                                                                color: '#16A249',
                                                                '&:hover': { bgcolor: 'rgba(22, 162, 73, 0.1)' },
                                                            }}
                                                        >
                                                            <Eye size={20} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Télécharger">
                                                        <IconButton
                                                            onClick={() => handleDownloadAttachment(attachment.id, attachment.file_name)}
                                                            size="small"
                                                            sx={{
                                                                color: '#2196f3',
                                                                '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.1)' },
                                                            }}
                                                        >
                                                            <Download size={20} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Supprimer">
                                                        <IconButton
                                                            onClick={() => handleDeleteDialogOpen(attachment.id)}
                                                            size="small"
                                                            sx={{
                                                                color: '#f44336',
                                                                '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' },
                                                            }}
                                                        >
                                                            <Trash2 size={20} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    py: 6,
                                    bgcolor: 'rgba(0,0,0,0.02)',
                                    borderRadius: '12px',
                                }}
                            >
                                <Paperclip size={48} color="#9e9e9e" style={{ marginBottom: 16, opacity: 0.5 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Aucune pièce jointe
                                </Typography>
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3, maxWidth: 400 }}>
                                    Aucun fichier n'a été attaché à cette expression de besoin. Cliquez sur le bouton ci-dessous pour ajouter des
                                    fichiers.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<Upload size={18} />}
                                    onClick={handleUploadDialogOpen}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        borderColor: '#16A249',
                                        color: '#16A249',
                                        '&:hover': {
                                            borderColor: '#138a3c',
                                            bgcolor: 'rgba(22, 162, 73, 0.05)',
                                        },
                                    }}
                                >
                                    Ajouter des fichiers
                                </Button>
                            </Box>
                        )}
                    </Paper>
                )}
            </Box>

            {/* Dialogue d'upload de fichiers */}
            <Dialog
                open={uploadDialogOpen}
                onClose={handleUploadDialogClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    elevation: 0,
                    sx: {
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    },
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Ajouter des pièces jointes
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pb: 1 }}>
                    <Box
                        sx={{
                            mt: 2,
                            p: 3,
                            border: '2px dashed rgba(22, 162, 73, 0.3)',
                            borderRadius: '12px',
                            bgcolor: 'rgba(22, 162, 73, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                                borderColor: '#16A249',
                                bgcolor: 'rgba(22, 162, 73, 0.08)',
                            },
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            hidden
                            multiple
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        />
                        <Upload size={40} color="#16A249" style={{ marginBottom: 16, opacity: 0.8 }} />
                        <Typography variant="body1" fontWeight="medium" color="#16A249" gutterBottom>
                            Cliquez pour sélectionner des fichiers
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                            ou glissez-déposez vos fichiers ici
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                            Formats acceptés: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG
                        </Typography>
                    </Box>

                    {selectedFiles.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                                Fichiers sélectionnés ({selectedFiles.length})
                            </Typography>
                            <Box
                                sx={{
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    mt: 1,
                                    pr: 1,
                                    '&::-webkit-scrollbar': {
                                        width: '8px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: 'rgba(0,0,0,0.2)',
                                        borderRadius: '4px',
                                    },
                                }}
                            >
                                {selectedFiles.map((file, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 1.5,
                                            mb: 1,
                                            borderRadius: '8px',
                                            bgcolor: 'rgba(0,0,0,0.03)',
                                        }}
                                    >
                                        {getFileIcon(file.name)}
                                        <Box sx={{ ml: 1.5, flex: 1, overflow: 'hidden' }}>
                                            <Typography
                                                variant="body2"
                                                fontWeight="medium"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {file.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                                            }}
                                            sx={{ color: '#f44336' }}
                                        >
                                            <Trash2 size={16} />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={handleUploadDialogClose}
                        sx={{
                            textTransform: 'none',
                            color: 'text.secondary',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleUploadFiles}
                        variant="contained"
                        disabled={selectedFiles.length === 0 || loading}
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Upload size={16} />}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            backgroundColor: '#16A249',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(22, 162, 73, 0.2)',
                            '&:hover': { backgroundColor: '#138a3c', boxShadow: '0 6px 16px rgba(22, 162, 73, 0.3)' },
                        }}
                    >
                        {loading ? 'Téléversement...' : 'Téléverser'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialogue de prévisualisation */}
            <Dialog
                open={previewDialogOpen}
                onClose={handlePreviewDialogClose}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    elevation: 0,
                    sx: {
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        height: '80vh',
                    },
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                        Prévisualisation du document
                    </Typography>
                    <IconButton onClick={handlePreviewDialogClose}>
                        <XCircle size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ height: 'calc(100% - 64px)', p: 0 }}>
                    <iframe
                        src={previewUrl}
                        title="Document Preview"
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        sandbox="allow-same-origin allow-scripts"
                    />
                </DialogContent>
            </Dialog>

            {/* Dialogue de confirmation de suppression */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteDialogClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    },
                }}
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight="bold">
                        Confirmer la suppression
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AlertTriangle size={24} color="#f44336" style={{ marginRight: 12 }} />
                        <Typography variant="body1">
                            Êtes-vous sûr de vouloir supprimer cette pièce jointe ? Cette action est irréversible.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={handleDeleteDialogClose}
                        sx={{
                            textTransform: 'none',
                            color: 'text.secondary',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleDeleteAttachment}
                        variant="contained"
                        color="error"
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Trash2 size={16} />}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)',
                            '&:hover': { boxShadow: '0 6px 16px rgba(244, 67, 54, 0.3)' },
                        }}
                    >
                        {loading ? 'Suppression...' : 'Supprimer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EdbDetails;
