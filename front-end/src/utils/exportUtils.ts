import type React from "react"
import jsPDF from "jspdf"
import * as XLSX from "xlsx"
import html2canvas from "html2canvas"
import { saveAs } from "file-saver"

// Types pour les options d'exportation
export interface ExportOptions {
  title: string
  author?: string
  subject?: string
  includeDate?: boolean
  includeHeader?: boolean
  orientation?: "portrait" | "landscape"
  format?: string
}

// Type pour les données à exporter
export interface ExportData {
  headers: string[]
  rows: any[][]
}

// Fonction pour exporter des données en Excel
export const exportToExcel = (data: ExportData, options: ExportOptions) => {
  const { title, author = "DigitalWork", includeDate = true } = options

  // Créer un nouveau classeur
  const wb = XLSX.utils.book_new()

  // Ajouter des informations sur le document
  wb.Props = {
    Title: title,
    Author: author,
    CreatedDate: new Date(),
  }

  // Préparer les données pour l'export
  const wsData = [data.headers, ...data.rows]

  // Si on inclut la date, l'ajouter en haut du document
  if (includeDate) {
    wsData.unshift([`Exporté le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`])
  }

  // Créer une feuille de calcul
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Ajouter la feuille au classeur
  XLSX.utils.book_append_sheet(wb, ws, "Données")

  // Générer le fichier Excel
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })

  // Convertir en Blob et télécharger
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  saveAs(blob, `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`)
}

// Fonction pour exporter un graphique en PDF
export const exportChartToPDF = async (chartRef: React.RefObject<HTMLDivElement>, options: ExportOptions) => {
  if (!chartRef.current) return

  const {
    title,
    author = "DigitalWork",
    subject = "Rapport de données",
    includeDate = true,
    includeHeader = true,
    orientation = "landscape",
    format = "a4",
  } = options

  try {
    // Capturer le graphique en tant qu'image
    const canvas = await html2canvas(chartRef.current, {
      scale: 2, // Meilleure qualité
      logging: false,
      useCORS: true,
      allowTaint: true,
    })

    // Créer un nouveau document PDF
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
    })

    // Ajouter des métadonnées
    pdf.setProperties({
      title,
      author,
      subject,
      keywords: "dashboard, chart, report",
      creator: "DigitalWork Dashboard",
    })

    // Ajouter un en-tête si demandé
    if (includeHeader) {
      pdf.setFontSize(18)
      pdf.text(title, 14, 22)

      if (includeDate) {
        pdf.setFontSize(10)
        pdf.text(`Exporté le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`, 14, 30)
      }

      pdf.setLineWidth(0.5)
      pdf.line(14, 35, pdf.internal.pageSize.getWidth() - 14, 35)
    }

    // Calculer les dimensions pour l'image
    const imgWidth = pdf.internal.pageSize.getWidth() - 28
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Ajouter l'image au PDF
    const imgData = canvas.toDataURL("image/png")
    pdf.addImage(imgData, "PNG", 14, includeHeader ? 45 : 14, imgWidth, imgHeight)

    // Télécharger le PDF
    pdf.save(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`)
  } catch (error) {
    console.error("Erreur lors de l'exportation en PDF:", error)
    alert("Une erreur est survenue lors de l'exportation en PDF. Veuillez réessayer.")
  }
}

// Fonction pour exporter plusieurs graphiques et données en un seul PDF
export const exportDashboardToPDF = async (
  chartRefs: React.RefObject<HTMLDivElement>[],
  data: ExportData[],
  options: ExportOptions,
) => {
  const {
    title,
    author = "DigitalWork",
    subject = "Rapport de tableau de bord",
    includeDate = true,
    includeHeader = true,
    orientation = "landscape",
    format = "a4",
  } = options

  try {
    // Créer un nouveau document PDF
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
    })

    // Ajouter des métadonnées
    pdf.setProperties({
      title,
      author,
      subject,
      keywords: "dashboard, report, charts, data",
      creator: "DigitalWork Dashboard",
    })

    // Ajouter un en-tête
    if (includeHeader) {
      pdf.setFontSize(18)
      pdf.text(title, 14, 22)

      if (includeDate) {
        pdf.setFontSize(10)
        pdf.text(`Exporté le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`, 14, 30)
      }

      pdf.setLineWidth(0.5)
      pdf.line(14, 35, pdf.internal.pageSize.getWidth() - 14, 35)
    }

    let yPosition = includeHeader ? 45 : 14

    // Ajouter chaque graphique au PDF
    for (let i = 0; i < chartRefs.length; i++) {
      const chartRef = chartRefs[i]

      if (!chartRef.current) continue

      // Capturer le graphique en tant qu'image
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      // Calculer les dimensions pour l'image
      const imgWidth = pdf.internal.pageSize.getWidth() - 28
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Vérifier si on a besoin d'une nouvelle page
      if (yPosition + imgHeight > pdf.internal.pageSize.getHeight() - 14) {
        pdf.addPage()
        yPosition = 14
      }

      // Ajouter l'image au PDF
      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 14, yPosition, imgWidth, imgHeight)

      yPosition += imgHeight + 20
    }

    // Ajouter les données tabulaires si fournies
    if (data.length > 0) {
      for (const tableData of data) {
        // Ajouter une nouvelle page pour chaque tableau
        pdf.addPage()

        // Titre du tableau
        pdf.setFontSize(14)
        pdf.text("Données détaillées", 14, 20)

        // Créer le tableau
        const startY = 30
        const cellWidth = (pdf.internal.pageSize.getWidth() - 28) / tableData.headers.length
        const cellHeight = 10

        // En-têtes du tableau
        pdf.setFillColor(240, 240, 240)
        pdf.rect(14, startY, pdf.internal.pageSize.getWidth() - 28, cellHeight, "F")
        pdf.setFontSize(10)
        pdf.setTextColor(0, 0, 0)

        tableData.headers.forEach((header, index) => {
          pdf.text(header, 14 + index * cellWidth + 2, startY + 7)
        })

        // Lignes du tableau
        let rowY = startY + cellHeight

        tableData.rows.forEach((row, rowIndex) => {
          // Vérifier si on a besoin d'une nouvelle page
          if (rowY + cellHeight > pdf.internal.pageSize.getHeight() - 14) {
            pdf.addPage()
            rowY = 14

            // Répéter les en-têtes sur la nouvelle page
            pdf.setFillColor(240, 240, 240)
            pdf.rect(14, rowY, pdf.internal.pageSize.getWidth() - 28, cellHeight, "F")

            tableData.headers.forEach((header, index) => {
              pdf.text(header, 14 + index * cellWidth + 2, rowY + 7)
            })

            rowY += cellHeight
          }

          // Alterner les couleurs de fond pour les lignes
          if (rowIndex % 2 === 1) {
            pdf.setFillColor(250, 250, 250)
            pdf.rect(14, rowY, pdf.internal.pageSize.getWidth() - 28, cellHeight, "F")
          }

          // Données de la ligne
          row.forEach((cell, cellIndex) => {
            pdf.text(String(cell), 14 + cellIndex * cellWidth + 2, rowY + 7)
          })

          rowY += cellHeight
        })
      }
    }

    // Télécharger le PDF
    pdf.save(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`)
  } catch (error) {
    console.error("Erreur lors de l'exportation du tableau de bord en PDF:", error)
    alert("Une erreur est survenue lors de l'exportation en PDF. Veuillez réessayer.")
  }
}
