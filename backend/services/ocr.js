import Tesseract from 'tesseract.js'
import fs from 'fs/promises'

/**
 * Extract text from an image using OCR
 * @param {string} imagePath - Path to the image file
 * @param {Function} onProgress - Callback for progress updates (0-100)
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromImage(imagePath, onProgress = null) {
  try {
    // Check if file exists
    await fs.access(imagePath)

    // Set timeout for OCR (30 seconds max)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OCR timeout after 30 seconds')), 30000)
    })

    // Perform OCR with better error handling
    const ocrPromise = Tesseract.recognize(
      imagePath,
      'eng', // Language: English
      {
        logger: (info) => {
          // Suppress Tesseract internal warnings (like "TT: undefined function")
          // These are harmless and can be ignored
          if (info.status === 'recognizing text' && onProgress) {
            const progress = Math.min(100, Math.round((info.progress || 0) * 100))
            onProgress(progress)
          }
          // Ignore other Tesseract internal messages
          if (info.status && info.status !== 'recognizing text') {
            // Suppress warnings
            return
          }
        },
        // Optimize OCR settings for speed
        tessedit_pageseg_mode: '1' // Automatic page segmentation (faster)
      }
    )

    // Race between OCR and timeout
    const { data: { text } } = await Promise.race([ocrPromise, timeoutPromise])

    const extractedText = text ? text.trim() : ''
    
    if (!extractedText || extractedText.length < 5) {
      throw new Error('OCR extracted insufficient text. The image may be too blurry or contain no readable text.')
    }

    return extractedText
  } catch (error) {
    console.error('OCR Error:', error.message)
    // Provide more helpful error message
    if (error.message.includes('timeout')) {
      throw new Error('OCR is taking too long. The image may be too large or complex. Try a smaller or clearer image.')
    }
    throw new Error(`Failed to extract text from image: ${error.message}`)
  }
}

/**
 * Check if a file is an image
 * @param {string} mimeType - MIME type of the file
 * @returns {boolean}
 */
export function isImage(mimeType) {
  return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'].includes(mimeType)
}
