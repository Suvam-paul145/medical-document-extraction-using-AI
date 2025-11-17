import express from 'express'
import { getExtractionResult } from '../services/queue.js'
import dataGateway from '../services/dataGateway.js'

const router = express.Router()

router.get('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params
    const { format = 'json' } = req.query

    // Get the extraction result using the data gateway
    const result = getExtractionResult(documentId, format)
    
    if (!result || !result.success) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found or still processing'
        }
      })
    }

    let fileData, filename, contentType

    switch (format.toLowerCase()) {
      case 'csv':
        fileData = result.data
        filename = `extraction_${documentId}.csv`
        contentType = 'text/csv; charset=utf-8'
        break
      case 'xml':
        fileData = result.data
        filename = `extraction_${documentId}.xml`
        contentType = 'application/xml; charset=utf-8'
        break
      case 'html':
        fileData = result.data
        filename = `extraction_${documentId}.html`
        contentType = 'text/html; charset=utf-8'
        break
      case 'json':
      default:
        fileData = result.data
        filename = `extraction_${documentId}.json`
        contentType = 'application/json; charset=utf-8'
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

// Export all documents
router.get('/', async (req, res) => {
  try {
    const { format = 'json' } = req.query
    
    const documents = dataGateway.getAllDocuments()
    
    if (documents.length === 0) {
      return res.json({
        success: true,
        message: 'No documents to export',
        documents: []
      })
    }

    const exported = documents.map(doc => {
      const result = getExtractionResult(doc.documentId, format)
      return {
        documentId: doc.documentId,
        contentType: doc.contentType,
        timestamp: doc.timestamp,
        exported: new Date().toISOString(),
        data: result ? result.data : null
      }
    })

    res.json({
      success: true,
      format,
      exportedCount: exported.length,
      exported
    })
  } catch (error) {
    console.error('Export all error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPORT_FAILED',
        message: 'Failed to export documents'
      }
    })
  }
})

export default router
