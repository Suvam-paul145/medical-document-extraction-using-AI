import express from 'express'
import { exportToJSON, exportToCSV, exportToPDF } from '../services/export.js'

const router = express.Router()

router.get('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params
    const { format = 'json' } = req.query

    // In real app, fetch extraction result from database
    const mockResult = {
      documentId,
      patientInfo: {
        name: 'John Doe',
        dateOfBirth: '1980-05-15',
        patientId: 'P12345',
        confidence: 0.95
      },
      medications: [],
      diagnoses: [],
      labResults: [],
      vitalSigns: [],
      extractedAt: new Date().toISOString(),
      processingTime: 5000
    }

    let fileData, filename, contentType

    switch (format) {
      case 'csv':
        fileData = exportToCSV(mockResult)
        filename = `extraction_${documentId}.csv`
        contentType = 'text/csv'
        break
      case 'pdf':
        fileData = await exportToPDF(mockResult)
        filename = `extraction_${documentId}.pdf`
        contentType = 'application/pdf'
        break
      default:
        fileData = exportToJSON(mockResult)
        filename = `extraction_${documentId}.json`
        contentType = 'application/json'
    }

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(fileData)
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPORT_FAILED',
        message: 'Failed to export data'
      }
    })
  }
})

export default router
