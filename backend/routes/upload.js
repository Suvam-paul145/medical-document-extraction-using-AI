import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { validateFile, createDocumentRecord } from '../services/validation.js'
import { addProcessingJob, getExtractionResult, getExtractionResultFormatted, getAllExtractionResults, getGatewayStats } from '../services/queue.js'

const router = express.Router()

// Ensure uploads directory exists
const uploadsDir = 'uploads'
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log('✅ Created uploads directory')
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'))
    }
  }
})

// Upload endpoint
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      })
    }

    // Get API key from form data, header, or environment
    const apiKey = req.body.apiKey || req.headers['x-api-key'] || process.env.OPENROUTER_API_KEY
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_API_KEY',
          message: 'OpenRouter API key is required. Please configure OPENROUTER_API_KEY in environment or provide it in the request.'
        }
      })
    }

    // Validate file
    const validation = validateFile(req.file)
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: validation.message,
          validationErrors: validation.errors
        }
      })
    }

    // Create document record
    const documentId = uuidv4()
    const document = createDocumentRecord(documentId, req.file)
    
    // Store API key with document for use during processing
    document.apiKey = apiKey

    // Add to processing queue
    const job = await addProcessingJob(document)

    res.json({
      success: true,
      documentId,
      jobId: job.id,
      queuePosition: await job.queue.count(),
      message: 'Document uploaded successfully and queued for processing'
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: error.message || 'Failed to upload document'
      }
    })
  }
})

// Get extraction result
router.get('/:documentId/result', async (req, res) => {
  try {
    const { documentId } = req.params
    const { format = 'json' } = req.query
    
    const result = getExtractionResult(documentId, format)
    
    if (!result || !result.success) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESULT_NOT_FOUND',
          message: `No result found for document ${documentId}. The document may still be processing or does not exist.`
        }
      })
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch extraction result'
      }
    })
  }
})

// Get formatted result for frontend display
router.get('/:documentId/formatted', async (req, res) => {
  try {
    const { documentId } = req.params
    const { format = 'table' } = req.query
    
    const result = getExtractionResultFormatted(documentId, format)
    
    if (!result || !result.success) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESULT_NOT_FOUND',
          message: 'Extraction result not found'
        }
      })
    }

    if (format === 'html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.send(result.data)
    } else {
      res.json(result)
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FORMAT_FAILED',
        message: 'Failed to format extraction result'
      }
    })
  }
})

// Get all results
router.get('/', async (req, res) => {
  try {
    const results = getAllExtractionResults()
    const stats = getGatewayStats()
    
    res.json({
      success: true,
      stats,
      resultsCount: results.length,
      results
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch results'
      }
    })
  }
})

export default router
