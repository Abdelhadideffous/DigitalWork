import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';

interface PdfExportProps {
    edbId: number;
}

const PdfExport: React.FC<PdfExportProps> = ({ edbId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExportPdf = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`/api/edbs/${edbId}/export-pdf`, {
                responseType: 'blob',
            });

            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(pdfBlob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `edb-${edbId}.pdf`);
            document.body.appendChild(link);
            link.click();

            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Erreur lors de l'exportation du PDF:", err);
            setError("Une erreur est survenue lors de l'exportation du PDF");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 4, maxWidth: 500, mx: 'auto', my: 4, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom align="center">
                Test d'exportation PDF
            </Typography>

            <Typography variant="body1" paragraph align="center">
                Cliquez sur le bouton ci-dessous pour exporter l'EDB #{edbId} en PDF.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
                    onClick={handleExportPdf}
                    disabled={loading}
                    sx={{ py: 1.5, px: 3, borderRadius: 2 }}
                >
                    {loading ? 'Génération en cours...' : 'Exporter en PDF'}
                </Button>
            </Box>

            {error && (
                <Typography color="error" align="center" sx={{ mt: 2 }}>
                    {error}
                </Typography>
            )}
        </Paper>
    );
};

export default PdfExport;
