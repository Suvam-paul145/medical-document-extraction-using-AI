import Queue from 'bull'
import { processDocument } from './extraction.js'

let processingQueue
let ioInstance
let inMemoryQueue = []
let isProcessing = false

export function initializeQueue(io) {
  ioInstance = io
  
  // Try to create queue with Redis, fallback to in-memory if Redis is not available
  try {
    processingQueue = new Queue('document-processing', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy: () => null // Don't retry if Redis is unavailable
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

    processingQueue.on('error', (error) => {
      console.warn('⚠️  Redis connection failed, falling back to in-memory queue:', error.message)
      processingQueue = null
      // Start in-memory processing when Redis fails
      if (!isProcessing) {
        processInMemoryQueue()
      }
    })

    console.log('✅ Job queue initialized (will use Redis if available)')
  } catch (error) {
    console.warn('⚠️  Redis not available, using in-memory queue:', error.message)
    processingQueue = null
  }

  // Start processing in-memory queue if Redis is not available
  if (!processingQueue) {
    console.log('📦 Using in-memory job queue (no Redis required for demo)')
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

    // Emit completion
    emitToDocument(document.id, 'processing:completed', result)

    return result
  } catch (error) {
    console.error('Processing error:', error)
    
    // Emit error
    emitToDocument(document.id, 'processing:error', {
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
