"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Checkbox,
  FormGroup,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material"
import { FileText, FileSpreadsheet, Download } from "lucide-react"
import type { ExportOptions } from "../../utils/exportUtils"

interface ExportModalProps {
  open: boolean
  onClose: () => void
  onExport: (format: "pdf" | "excel", options: ExportOptions) => void
  title: string
  loading?: boolean
}

const ExportModal: React.FC<ExportModalProps> = ({ open, onClose, onExport, title, loading = false }) => {
  const [format, setFormat] = useState<"pdf" | "excel">("pdf")
  const [options, setOptions] = useState<ExportOptions>({
    title: title,
    author: "",
    subject: "Rapport de données",
    includeDate: true,
    includeHeader: true,
    orientation: "landscape",
    format: "a4",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target
    setOptions({
      ...options,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target
    if (name) {
      setOptions({
        ...options,
        [name]: value,
      })
    }
  }

  const handleExport = () => {
    onExport(format, options)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Exporter les données</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Format d'exportation
          </Typography>
          <RadioGroup row name="format" value={format} onChange={(e) => setFormat(e.target.value as "pdf" | "excel")}>
            <FormControlLabel
              value="pdf"
              control={<Radio />}
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FileText size={18} style={{ marginRight: 8 }} />
                  PDF
                </Box>
              }
            />
            <FormControlLabel
              value="excel"
              control={<Radio />}
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FileSpreadsheet size={18} style={{ marginRight: 8 }} />
                  Excel
                </Box>
              }
            />
          </RadioGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          Options du document
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Titre du rapport"
          name="title"
          value={options.title}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Auteur"
          name="author"
          value={options.author}
          onChange={handleChange}
          placeholder="Votre nom"
        />

        {format === "pdf" && (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Sujet"
              name="subject"
              value={options.subject}
              onChange={handleChange}
            />

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="orientation-label">Orientation</InputLabel>
                <Select
                  labelId="orientation-label"
                  name="orientation"
                  value={options.orientation}
                  label="Orientation"
                  onChange={handleSelectChange as any}
                >
                  <MenuItem value="portrait">Portrait</MenuItem>
                  <MenuItem value="landscape">Paysage</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel id="format-label">Format</InputLabel>
                <Select
                  labelId="format-label"
                  name="format"
                  value={options.format}
                  label="Format"
                  onChange={handleSelectChange as any}
                >
                  <MenuItem value="a4">A4</MenuItem>
                  <MenuItem value="a3">A3</MenuItem>
                  <MenuItem value="letter">Letter</MenuItem>
                  <MenuItem value="legal">Legal</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </>
        )}

        <FormGroup sx={{ mt: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={options.includeDate} onChange={handleChange} name="includeDate" />}
            label="Inclure la date d'exportation"
          />
          <FormControlLabel
            control={<Checkbox checked={options.includeHeader} onChange={handleChange} name="includeHeader" />}
            label="Inclure l'en-tête"
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Annuler
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          color="success"
          startIcon={loading ? <CircularProgress color="success" size={20} /> : <Download size={20} />}
          disabled={loading}
        >
          {loading ? "Exportation en cours..." : "Exporter"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ExportModal
