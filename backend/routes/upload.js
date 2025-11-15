import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { validateFile, createDocumentRecord } from '../services/validation.js'
import { addProcessingJob } from '../services/queue.js'

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
    
    // In a real app, fetch from database
    // For now, return mock response
    res.json({
      success: true,
      message: 'Result endpoint - to be implemented with database'
    })
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

export default router
