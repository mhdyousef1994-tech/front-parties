import jsPDF from 'jspdf'
import { toPng, toJpeg } from 'html-to-image'

/**
 * PDF Generation utilities
 * For Arabic text support, you may need to add Arabic fonts to jsPDF
 */

// Export HTML node to PDF
export async function exportNodeToPdf(node, filename = 'document.pdf', options = {}) {
  try {
    const {
      format = 'PNG',
      quality = 0.95,
      orientation = 'portrait',
      unit = 'mm',
      format: pageFormat = 'a4'
    } = options

    // Convert node to image
    const imageConverter = format === 'JPEG' ? toJpeg : toPng
    const dataUrl = await imageConverter(node, { quality })

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit,
      format: pageFormat
    })

    // Calculate dimensions to fit page
    const imgProps = pdf.getImageProperties(dataUrl)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(dataUrl, format, 0, 0, pdfWidth, pdfHeight)
    pdf.save(filename)

    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

// Generate invitation PDF
export async function generateInvitationPDF(invitation, template) {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Add template image if available
    if (template?.imageUrl) {
      try {
        pdf.addImage(template.imageUrl, 'JPEG', 0, 0, 210, 297)
      } catch (e) {
        console.warn('Could not add template image:', e)
      }
    }

    // Add invitation details (basic text - for Arabic you need to add font)
    const pageWidth = pdf.internal.pageSize.getWidth()

    pdf.setFontSize(20)
    pdf.text(invitation.guestName || '', pageWidth / 2, 40, { align: 'center' })

    pdf.setFontSize(14)
    pdf.text(`Number of Guests: ${invitation.numOfPeople || 0}`, pageWidth / 2, 60, { align: 'center' })

    if (invitation.qrCodeImage) {
      try {
        pdf.addImage(invitation.qrCodeImage, 'PNG', pageWidth / 2 - 25, 80, 50, 50)
      } catch (e) {
        console.warn('Could not add QR code:', e)
      }
    }

    const filename = `invitation-${invitation._id || Date.now()}.pdf`
    pdf.save(filename)

    return true
  } catch (error) {
    console.error('Error generating invitation PDF:', error)
    throw error
  }
}

// Generate invoice PDF
export async function generateInvoicePDF(invoice) {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    let yPos = 20

    // Header
    pdf.setFontSize(20)
    pdf.text('INVOICE', pageWidth / 2, yPos, { align: 'center' })
    yPos += 10

    pdf.setFontSize(12)
    pdf.text(`Invoice #: ${invoice.invoiceNumber || ''}`, 20, yPos)
    yPos += 7
    pdf.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, yPos)
    yPos += 7
    pdf.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, yPos)
    yPos += 15

    // Client info
    pdf.setFontSize(14)
    pdf.text('Bill To:', 20, yPos)
    yPos += 7
    pdf.setFontSize(11)
    if (invoice.clientId?.name) {
      pdf.text(invoice.clientId.name, 20, yPos)
      yPos += 6
    }
    if (invoice.clientId?.phone) {
      pdf.text(invoice.clientId.phone, 20, yPos)
      yPos += 10
    }

    // Items table
    yPos += 5
    pdf.setFontSize(10)
    pdf.text('Description', 20, yPos)
    pdf.text('Qty', 120, yPos)
    pdf.text('Price', 145, yPos)
    pdf.text('Total', 170, yPos)
    yPos += 5
    pdf.line(20, yPos, 190, yPos)
    yPos += 7

    // Items
    if (invoice.items && Array.isArray(invoice.items)) {
      invoice.items.forEach(item => {
        pdf.text(item.description || '', 20, yPos)
        pdf.text(String(item.quantity || 0), 120, yPos)
        pdf.text(String(item.unitPrice || 0), 145, yPos)
        pdf.text(String(item.total || 0), 170, yPos)
        yPos += 6
      })
    }

    yPos += 5
    pdf.line(20, yPos, 190, yPos)
    yPos += 7

    // Totals
    pdf.text('Subtotal:', 145, yPos)
    pdf.text(String(invoice.subtotal || 0), 170, yPos)
    yPos += 6

    if (invoice.tax) {
      pdf.text('Tax:', 145, yPos)
      pdf.text(String(invoice.tax), 170, yPos)
      yPos += 6
    }

    if (invoice.discount) {
      pdf.text('Discount:', 145, yPos)
      pdf.text(String(invoice.discount), 170, yPos)
      yPos += 6
    }

    pdf.setFontSize(12)
    pdf.text('Total:', 145, yPos)
    pdf.text(String(invoice.totalAmount || 0), 170, yPos)
    yPos += 6

    if (invoice.paidAmount) {
      pdf.text('Paid:', 145, yPos)
      pdf.text(String(invoice.paidAmount), 170, yPos)
      yPos += 6

      const balance = (invoice.totalAmount || 0) - (invoice.paidAmount || 0)
      pdf.text('Balance:', 145, yPos)
      pdf.text(String(balance), 170, yPos)
    }

    // Notes
    if (invoice.notes) {
      yPos += 15
      pdf.setFontSize(10)
      pdf.text('Notes:', 20, yPos)
      yPos += 6
      pdf.text(invoice.notes, 20, yPos, { maxWidth: 170 })
    }

    const filename = `invoice-${invoice.invoiceNumber || Date.now()}.pdf`
    pdf.save(filename)

    return true
  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    throw error
  }
}

// Export data to CSV
export function exportToCSV(data, filename = 'export.csv', headers = null) {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export')
    }

    // Get headers from first object if not provided
    const csvHeaders = headers || Object.keys(data[0])

    // Create CSV content
    const csvRows = []

    // Add headers
    csvRows.push(csvHeaders.map(h => `"${h}"`).join(','))

    // Add data rows
    data.forEach(row => {
      const values = csvHeaders.map(header => {
        const value = row[header]
        return `"${value !== null && value !== undefined ? String(value).replace(/"/g, '""') : ''}"`
      })
      csvRows.push(values.join(','))
    })

    // Create CSV string with BOM for UTF-8
    const bom = '\ufeff'
    const csvContent = bom + csvRows.join('\r\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()

    return true
  } catch (error) {
    console.error('Error exporting to CSV:', error)
    throw error
  }
}
