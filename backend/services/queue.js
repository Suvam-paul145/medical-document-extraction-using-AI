import Queue from 'bull'
import { processDocument } from './extraction.js'
import dataGateway from './dataGateway.js'

let processingQueue
let ioInstance
let inMemoryQueue = []
let isProcessing = false

// Store extraction results in memory (for demo purposes)
const extractionResults = new Map()

export function initializeQueue(io) {
  ioInstance = io
  
  // For demo purposes, skip Redis entirely and use in-memory queue by default
  // This avoids connection errors and makes the system work out of the box
  // Only use Redis if explicitly enabled via environment variable
  const useRedis = process.env.USE_REDIS === 'true'
  
  if (useRedis && process.env.REDIS_HOST) {
    // Only try Redis if explicitly enabled
    try {
      processingQueue = new Queue('document-processing', {
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          retryStrategy: () => null,
          connectTimeout: 2000, // Fast timeout
          lazyConnect: false
        },
        settings: {
          maxStalledCount: 3,
          stalledInterval: 30000
        }
      })

      // Process jobs
      processingQueue.process(async (job) => {
        return await processJob(job.data)
      })

      // Handle job events
      processingQueue.on('failed', (job, err) => {
        console.error(`Job ${job.id} failed:`, err.message)
      })

      processingQueue.on('completed', (job) => {
        console.log(`Job ${job.id} completed successfully`)
      })

      // Handle connection errors gracefully
      processingQueue.on('error', (error) => {
        // Suppress the error, we'll use in-memory queue
        console.warn('⚠️  Redis connection failed, using in-memory queue')
        processingQueue = null
        if (!isProcessing) {
          processInMemoryQueue()
        }
      })

      console.log('✅ Attempting to use Redis queue...')
    } catch (error) {
      console.warn('⚠️  Redis initialization failed, using in-memory queue:', error.message)
      processingQueue = null
    }
  } else {
    console.log('📦 Using in-memory job queue (Redis disabled - perfect for demo!)')
    processingQueue = null
  }

  // Always start in-memory queue processing
  if (!processingQueue) {
    processInMemoryQueue()
  }
}

async function processJob(jobData) {
  const { document } = jobData
  
  try {
    // Emit processing started
    emitToDocument(document.id, 'processing:started', {
      documentId: document.id,
      stage: 'ocr',
      progress: 0
    })

    // Process the document
    const result = await processDocument(document, (update) => {
      // Emit progress updates
      emitToDocument(document.id, 'processing:stage', update)
    }, (itemData) => {
      // Emit item extracted events
      emitToDocument(document.id, 'processing:item-extracted', itemData)
    })

    // Store result using intelligent data gateway
    const storageResult = dataGateway.storeData(document.id, result, {
      filename: document.originalname,
      fileType: document.fileType,
      processingTime: result.processingTime || 0,
      apiKey: document.apiKey ? 'configured' : 'missing'
    })

    // Store result for later retrieval
    extractionResults.set(document.id, {
      documentId: document.id,
      result,
      storageId: storageResult.storageId,
      timestamp: new Date().toISOString(),
      processingTime: result.processingTime || 0
    })

    // Emit completion with storage info
    emitToDocument(document.id, 'processing:completed', {
      ...result,
      storageId: storageResult.storageId,
      contentType: storageResult.contentType
    })


    return result
  } catch (error) {
    console.error('Processing error:', error)
    
    // Store error result
    extractionResults.set(jobData.document.id, {
      documentId: jobData.document.id,
      error: error.message,
      timestamp: new Date().toISOString(),
      success: false
    })
    
    // Emit error
    emitToDocument(jobData.document.id, 'processing:error', {
      code: 'PROCESSING_FAILED',
      message: error.message,
      retryable: true
    })

    throw error
  }
}

async function processInMemoryQueue() {
  if (isProcessing || inMemoryQueue.length === 0) {
    return
  }

  isProcessing = true
  const jobData = inMemoryQueue.shift()

  try {
    await processJob(jobData)
  } catch (error) {
    console.error('In-memory job processing error:', error)
  } finally {
    isProcessing = false
    // Process next job
    setTimeout(() => processInMemoryQueue(), 100)
  }
}

export async function addProcessingJob(document) {
  const jobData = { document }

  if (processingQueue) {
    // Use Redis queue if available
    const job = await processingQueue.add(
      jobData,
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: false,
        removeOnFail: false
      }
    )
    return job
  } else {
    // Fallback to in-memory queue
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    inMemoryQueue.push(jobData)
    
    // Start processing if not already processing
    processInMemoryQueue()
    
    return {
      id: jobId,
      queue: {
        count: async () => inMemoryQueue.length
      }
    }
  }
}

function emitToDocument(documentId, event, data) {
  if (ioInstance) {
    ioInstance.to(`document:${documentId}`).emit(event, data)
  }
}

export function getExtractionResult(documentId, format = 'json') {
  const result = extractionResults.get(documentId)
  if (!result) return null
  
  // Use data gateway to format the result
  return dataGateway.retrieveData(documentId, format)
}

export function getExtractionResultFormatted(documentId, format = 'table') {
  const result = extractionResults.get(documentId)
  if (!result) return null
  
  return dataGateway.retrieveData(documentId, format)
}

export function getAllExtractionResults(format = 'json') {
  const results = Array.from(extractionResults.values())
  return results.map(r => ({
    documentId: r.documentId,
    storageId: r.storageId,
    timestamp: r.timestamp,
    processingTime: r.processingTime,
    formats: {
      json: dataGateway.retrieveData(r.documentId, 'json'),
      table: dataGateway.retrieveData(r.documentId, 'table'),
      html: dataGateway.retrieveData(r.documentId, 'html')
    }
  }))
}

export function clearExtractionResult(documentId) {
  extractionResults.delete(documentId)
  dataGateway.deleteData(documentId)
}

export function getGatewayStats() {
  return dataGateway.getStats()
}
