import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Description as DescriptionIcon,
    TableChart as ExcelIcon,
    InsertDriveFile as FileIcon,
    Image as ImageIcon,
    PictureAsPdf as PdfIcon,
    Visibility as VisibilityIcon,
    Article as WordIcon,
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Fade,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Paper,
    Snackbar,
    Tooltip,
    Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';

// Types
interface Attachment {
    id: number;
    file_path: string;
    file_name: string;
    created_at: string;
}

interface Props {
    edbId: number;
}

// Styles
const DropZone = styled('div')(({ theme }) => ({
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(4),
    textAlign: 'center',
    backgroundColor: theme.palette.background.default,
    cursor: 'pointer',
    transition: 'border 0.3s ease, background-color 0.3s ease',
    marginBottom: theme.spacing(3),
    '&:hover': {
        borderColor: theme.palette.primary.dark,
        backgroundColor: theme.palette.action.hover,
    },
}));

const UploadIcon = styled(CloudUploadIcon)(({ theme }) => ({
    fontSize: 48,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
}));

const SelectedFilesList = styled(List)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
}));

const FileListContainer = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(4),
    overflow: 'hidden',
}));

const FileListHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
}));

const EmptyStateMessage = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const HiddenInput = styled('input')({
    display: 'none',
});

// Composant principal
const EDBDetail: React.FC<Props> = ({ edbId }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [uploading, setUploading] = useState<boolean>(false);
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info';
    }>({
        open: false,
        message: '',
        severity: 'info',
    });

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Récupérer les pièces jointes existantes
    const fetchAttachments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8000/api/edbs/${edbId}/attachments`);

            if (response.data.success) {
                setAttachments(response.data.data);
            } else {
                showNotification('Impossible de récupérer les pièces jointes', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des pièces jointes:', error);
            showNotification('Erreur de connexion au serveur', 'error');
        } finally {
            setLoading(false);
        }
    }, [edbId]);

    useEffect(() => {
        fetchAttachments();
    }, [fetchAttachments]);

    // Afficher une notification
    const showNotification = (message: string, severity: 'success' | 'error' | 'info') => {
        setNotification({
            open: true,
            message,
            severity,
        });
    };

    const handleCloseNotification = () => {
        setNotification({
            ...notification,
            open: false,
        });
    };

    // Gestion de l'ouverture du sélecteur de fichiers
    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Gestion du changement de fichiers par input
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
        }
    };

    // Gestion du drag & drop natif
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // Validation des types de fichiers
            const acceptedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'image/jpeg',
                'image/png',
            ];

            const maxSize = 20971520; // 20 MB

            const newFiles = Array.from(e.dataTransfer.files).filter((file) => {
                if (!acceptedTypes.includes(file.type)) {
                    showNotification(`Le type de fichier "${file.type}" n'est pas accepté`, 'error');
                    return false;
                }

                if (file.size > maxSize) {
                    showNotification(`Le fichier "${file.name}" dépasse la taille maximale de 20 Mo`, 'error');
                    return false;
                }

                return true;
            });

            if (newFiles.length > 0) {
                setFiles((prev) => [...prev, ...newFiles]);
            }
        }
    };

    // Supprimer un fichier de la liste
    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Uploader les fichiers
    const handleUpload = async () => {
        if (files.length === 0) {
            showNotification('Veuillez sélectionner au moins un fichier', 'error');
            return;
        }

        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });

        try {
            setUploading(true);
            const response = await axios.post(`http://localhost:8000/api/edbs/${edbId}/attachments`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Réinitialiser et rafraîchir
            setFiles([]);
            showNotification('Fichiers envoyés avec succès', 'success');
            fetchAttachments();
        } catch (error) {
            console.error("Erreur lors de l'upload:", error);
            showNotification("Erreur lors de l'envoi des fichiers", 'error');
        } finally {
            setUploading(false);
        }
    };

    // Supprimer une pièce jointe
    const handleDeleteAttachment = async (attachmentId: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8000/api/edbs/${edbId}/attachments/${attachmentId}`);

            // Mettre à jour l'état local
            setAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId));
            showNotification('Fichier supprimé avec succès', 'success');
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            showNotification('Erreur lors de la suppression du fichier', 'error');
        }
    };

    // Obtenir l'icône appropriée selon le type de fichier
    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();

        switch (extension) {
            case 'pdf':
                return <PdfIcon color="error" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <ImageIcon color="primary" />;
            case 'doc':
            case 'docx':
                return <WordIcon color="info" />;
            case 'xls':
            case 'xlsx':
                return <ExcelIcon color="success" />;
            default:
                return <FileIcon />;
        }
    };

    // Formater la date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    // Formater la taille du fichier
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' octets';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' Ko';
        else return (bytes / 1048576).toFixed(1) + ' Mo';
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', my: 4, px: 2 }}>
            {/* Titre */}
            <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
                Gestion des pièces jointes
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Vous pouvez ajouter des documents à cette demande (PDF, Word, Excel, Images)
            </Typography>

            {/* Zone de dépôt de fichiers */}
            <Paper elevation={3} sx={{ mb: 4, overflow: 'hidden' }}>
                <Box sx={{ p: 3 }}>
                    <DropZone
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={handleBrowseClick}
                        sx={{
                            borderColor: dragActive ? 'primary.dark' : 'primary.main',
                            backgroundColor: dragActive ? 'action.hover' : 'background.default',
                        }}
                    >
                        <HiddenInput
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        />
                        <UploadIcon />
                        <Typography variant="h6" gutterBottom>
                            {dragActive ? 'Déposez les fichiers ici...' : 'Glissez et déposez vos fichiers ici'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ou
                        </Typography>
                        <Button variant="outlined" color="primary" sx={{ mt: 2 }} disabled={uploading}>
                            Parcourir les fichiers
                        </Button>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                            Formats acceptés: PDF, DOCX, XLSX, JPG, PNG (max 20 Mo)
                        </Typography>
                    </DropZone>

                    {/* Liste des fichiers sélectionnés */}
                    {files.length > 0 && (
                        <>
                            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                                Fichiers sélectionnés ({files.length})
                            </Typography>
                            <SelectedFilesList>
                                {files.map((file, index) => (
                                    <React.Fragment key={`file-${index}`}>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar>{getFileIcon(file.name)}</Avatar>
                                            </ListItemAvatar>
                                            <ListItemText primary={file.name} secondary={formatFileSize(file.size)} />
                                            <ListItemSecondaryAction>
                                                <IconButton edge="end" color="error" onClick={() => handleRemoveFile(index)} disabled={uploading}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        {index < files.length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                ))}
                            </SelectedFilesList>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                                onClick={handleUpload}
                                disabled={uploading}
                                fullWidth
                            >
                                {uploading ? 'Envoi en cours...' : 'Envoyer les fichiers'}
                            </Button>
                        </>
                    )}
                </Box>
            </Paper>

            {/* Liste des pièces jointes existantes */}
            <FileListContainer elevation={3}>
                <FileListHeader>
                    <Typography variant="h6">
                        Fichiers disponibles
                        {attachments.length > 0 && (
                            <Chip label={attachments.length} size="small" color="default" sx={{ ml: 1, bgcolor: 'white', color: 'primary.main' }} />
                        )}
                    </Typography>
                </FileListHeader>

                {loading ? (
                    <EmptyStateMessage sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={40} />
                    </EmptyStateMessage>
                ) : attachments.length === 0 ? (
                    <EmptyStateMessage>
                        <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="subtitle1">Aucune pièce jointe disponible</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Les fichiers que vous ajouterez apparaîtront ici
                        </Typography>
                    </EmptyStateMessage>
                ) : (
                    <List>
                        {attachments.map((attachment, index) => {
                            const fileName = attachment.file_name || attachment.file_path.split('/').pop() || `Fichier ${index + 1}`;

                            return (
                                <React.Fragment key={`attachment-${attachment.id}`}>
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar>{getFileIcon(fileName)}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={fileName} secondary={`Ajouté le ${formatDate(attachment.created_at)}`} />
                                        <ListItemSecondaryAction>
                                            <Tooltip title="Visualiser">
                                                <IconButton
                                                    edge="end"
                                                    color="primary"
                                                    href={`http://localhost:8000/storage/${attachment.file_path}`}
                                                    target="_blank"
                                                    sx={{ mr: 1 }}
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Supprimer">
                                                <IconButton edge="end" color="error" onClick={() => handleDeleteAttachment(attachment.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {index < attachments.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
            </FileListContainer>

            {/* Notification */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                TransitionComponent={Fade}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default EDBDetail;
