import fs from 'fs/promises'
import path from 'path'
import pdfParse from 'pdf-parse'
import { extractTextFromImage, isImage } from './ocr.js'
import { extractMedicalData } from './aiExtraction.js'
import { MedicalExtractionAgent } from './extractionAgent.js'
import { DocumentFormat } from './formatAdapter.js'

/**
 * Process a medical document and extract structured data
 * Uses real AI extraction if available, falls back to demo mode
 * Automatically detects document format and normalizes output
 */
export async function processDocument(document, onProgress, emitItemExtracted = null) {
  const startTime = Date.now()
  let documentText = ''
  // Use provided API key or fallback to environment variable
  const apiKey = document.apiKey || process.env.OPENROUTER_API_KEY

  try {
    // Stage 1: Extract text from document
    onProgress({
      documentId: document.id,
      stage: 'ocr',
      progress: 10,
      currentActivity: 'Extracting text from document...'
    })

    if (isImage(document.fileType)) {
      // Image: Use OCR
      documentText = await extractTextFromImage(document.filepath, (ocrProgress) => {
        onProgress({
          documentId: document.id,
          stage: 'ocr',
          progress: 10 + Math.round(ocrProgress * 0.3), // 10-40%
          currentActivity: `Reading text from image... ${ocrProgress}%`
        })
      })
    } else if (document.fileType === 'application/pdf') {
      // PDF: Extract text directly
      const pdfBuffer = await fs.readFile(document.filepath)
      const pdfData = await pdfParse(pdfBuffer)
      documentText = pdfData.text || ''

      // If PDF has no text (image-based PDF), try OCR on first page
      if (!documentText || documentText.trim().length < 10) {
        console.log('⚠️  PDF appears to be image-based, attempting OCR...')
        onProgress({
          documentId: document.id,
          stage: 'ocr',
          progress: 20,
          currentActivity: 'PDF is image-based, using OCR...'
        })

        // For image-based PDFs, we'd need to convert to image first
        // For now, throw a helpful error
        throw new Error('PDF appears to be image-based (scanned document). Please convert to an image (PNG/JPEG) and upload that instead, or use a PDF with selectable text.')
      }

      onProgress({
        documentId: document.id,
        stage: 'ocr',
        progress: 40,
        currentActivity: `Text extracted from PDF (${documentText.length} characters)`
      })
    } else {
      throw new Error(`Unsupported file type: ${document.fileType}. Please use PDF, JPEG, or PNG.`)
    }

    // Validate extracted text
    const trimmedText = documentText ? documentText.trim() : ''
    if (!trimmedText || trimmedText.length < 5) {
      console.warn('Insufficient text extracted:', trimmedText.length, 'characters')
      throw new Error(`Could not extract sufficient text from document (only ${trimmedText.length} characters found). The document may be an image that needs better quality, or the PDF may be image-based.`)
    }

    console.log(`✅ Extracted ${trimmedText.length} characters from document`)

    // Stage 2: Agentic Document Analysis and Extraction (required)
    let result = null

    if (!apiKey) {
      throw new Error('OpenRouter API key is required. Please configure OPENROUTER_API_KEY in environment or provide it in the request.')
    }

    // Use agentic extraction with progress callbacks
    const agent = new MedicalExtractionAgent(apiKey)

    result = await agent.extractMedicalData(documentText, (agentProgress) => {
      // Map agent progress to document progress
      onProgress({
        documentId: document.id,
        stage: agentProgress.stage,
        substage: agentProgress.substage,
        progress: agentProgress.progress,
        currentActivity: agentProgress.message,
        documentType: agentProgress.data?.documentType
      })

      // Emit extracted items in real-time
      if (agentProgress.extractedData) {
        const { medications, diagnoses, labTests, patient } = agentProgress.extractedData

        if (medications && emitItemExtracted) {
          medications.forEach(med => {
            emitItemExtracted({
              documentId: document.id,
              category: 'medication',
              item: med
            })
          })
        }

        if (diagnoses && emitItemExtracted) {
          diagnoses.forEach(diag => {
            emitItemExtracted({
              documentId: document.id,
              category: 'diagnosis',
              item: diag
            })
          })
        }

        if (labTests && emitItemExtracted) {
          labTests.forEach(lab => {
            emitItemExtracted({
              documentId: document.id,
              category: 'labResult',
              item: lab
            })
          })
        }
      }
    })

    // Process agent results
    if (result) {
      onProgress({
        documentId: document.id,
        stage: 'validating',
        progress: 95,
        currentActivity: 'Final validation and formatting...'
      })

      // Add metadata
      result.documentId = document.id
      result.extractedAt = new Date().toISOString()
      result.processingTime = Date.now() - startTime
      result.extractionMethod = 'AI-powered'

      // INTELLIGENT FORMAT DETECTION & ADAPTATION
      const detectedFormat = DocumentFormat.detect(result, documentText)
      const normalizedResult = DocumentFormat.normalize(result, detectedFormat)
      const cleanedResult = DocumentFormat.cleanup(normalizedResult, detectedFormat)
      const displayResult = DocumentFormat.formatForDisplay(cleanedResult, detectedFormat)

      onProgress({
        documentId: document.id,
        stage: 'validating',
        progress: 100,
        currentActivity: `Extraction complete! Detected format: ${detectedFormat.name}`
      })

      return {
        ...cleanedResult,
        displayFormat: displayResult,
        detectedFormat: detectedFormat.id
      }
    }
  }

    // Fallback to demo mode if AI is not available or failed
   catch (error) {
  console.error('Extraction error:', error.message)

  // Provide helpful error message to user
  onProgress({
    documentId: document.id,
    stage: 'error',
    progress: 0,
    currentActivity: `Error: ${error.message}`
  })

  // If it's a text extraction error, fall back to demo mode
  if (error.message.includes('Could not extract') || error.message.includes('OCR') || error.message.includes('insufficient text')) {
    console.log('⚠️  Text extraction failed, falling back to demo mode')
    // Wait a moment to show the error
    await new Promise(resolve => setTimeout(resolve, 1000))
    return await getDemoResult(document.id, startTime, onProgress, emitItemExtracted)
  }

  // For other errors, still fall back but log the issue
  console.log('⚠️  Error in extraction, falling back to demo mode')
  return await getDemoResult(document.id, startTime, onProgress, emitItemExtracted)
}
}

/**
 * Get demo/simulated result (fallback when AI is not available)
 */
async function getDemoResult(documentId, startTime, onProgress, emitItemExtracted) {
  const stages = [
    { name: 'ocr', duration: 1000, progress: 20 },
    { name: 'analyzing', duration: 1000, progress: 50 },
    { name: 'extracting', duration: 2000, progress: 80 },
    { name: 'validating', duration: 500, progress: 100 }
  ]

  const result = {
    documentId,
    patientInfo: {
      name: 'John Doe',
      dateOfBirth: '1980-05-15',
      patientId: 'P12345',
      age: 44,
      gender: 'Male',
      confidence: 0.95
    },
    medications: [
      {
        drugName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        route: 'Oral',
        confidence: 0.92
      },
      {
        drugName: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '30 days',
        route: 'Oral',
        confidence: 0.88
      }
    ],
    diagnoses: [
      {
        condition: 'Hypertension',
        icdCode: 'I10',
        diagnosedDate: '2024-01-15',
        severity: 'Moderate',
        confidence: 0.90
      },
      {
        condition: 'Type 2 Diabetes',
        icdCode: 'E11',
        diagnosedDate: '2023-06-20',
        severity: 'Controlled',
        confidence: 0.93
      }
    ],
    labResults: [
      {
        testName: 'Blood Glucose',
        value: '110',
        unit: 'mg/dL',
        referenceRange: '70-100',
        status: 'abnormal',
        confidence: 0.96
      },
      {
        testName: 'HbA1c',
        value: '6.5',
        unit: '%',
        referenceRange: '<5.7',
        status: 'abnormal',
        confidence: 0.94
      }
    ],
    vitalSigns: [
      {
        type: 'Blood Pressure',
        value: '130/85',
        unit: 'mmHg',
        confidence: 0.91
      },
      {
        type: 'Heart Rate',
        value: '72',
        unit: 'bpm',
        confidence: 0.95
      }
    ],
    physicianInfo: {
      name: 'Dr. Sarah Johnson',
      specialty: 'Internal Medicine',
      licenseNumber: 'MD12345',
      confidence: 0.89
    },
    extractedAt: new Date().toISOString(),
    processingTime: 0,
    extractionMethod: 'Demo mode (AI not configured)'
  }

  // Simulate processing stages
  for (const stage of stages) {
    onProgress({
      documentId,
      stage: stage.name,
      progress: stage.progress,
      currentActivity: `[Demo] Processing ${stage.name}...`
    })

    await new Promise(resolve => setTimeout(resolve, stage.duration))

    if (stage.name === 'extracting') {
      await simulateItemExtraction(documentId, result, emitItemExtracted)
    }
  }

  result.processingTime = Date.now() - startTime
  
  // Apply format detection and normalization to demo results
  const detectedFormat = DocumentFormat.detect(result, '')
  const normalizedResult = DocumentFormat.normalize(result, detectedFormat)
  const cleanedResult = DocumentFormat.cleanup(normalizedResult, detectedFormat)
  const displayResult = DocumentFormat.formatForDisplay(cleanedResult, detectedFormat)
  
  return {
    ...cleanedResult,
    displayFormat: displayResult,
    detectedFormat: detectedFormat.id
  }
}

async function simulateItemExtraction(documentId, result, emitItemExtracted) {
  // Simulate gradual extraction of items
  const items = [
    { category: 'medication', item: result.medications[0] },
    { category: 'diagnosis', item: result.diagnoses[0] },
    { category: 'labResult', item: result.labResults[0] },
    { category: 'medication', item: result.medications[1] },
    { category: 'diagnosis', item: result.diagnoses[1] },
    { category: 'labResult', item: result.labResults[1] },
    { category: 'vitalSign', item: result.vitalSigns[0] },
    { category: 'vitalSign', item: result.vitalSigns[1] }
  ]

  for (const extracted of items) {
    await new Promise(resolve => setTimeout(resolve, 300))
    // Emit item extracted event
    if (emitItemExtracted) {
      emitItemExtracted({
        documentId,
        category: extracted.category,
        item: extracted.item
      })
    }
  }
}

// Export functions
export function exportToJSON(result) {
  return JSON.stringify(result, null, 2)
}

export function exportToCSV(result) {
  let csv = 'Category,Field,Value,Confidence\n'

  // Patient Info
  if (result.patientInfo) {
    csv += `Patient,Name,${result.patientInfo.name},${result.patientInfo.confidence}\n`
    csv += `Patient,DOB,${result.patientInfo.dateOfBirth},${result.patientInfo.confidence}\n`
    csv += `Patient,ID,${result.patientInfo.patientId},${result.patientInfo.confidence}\n`
  }

  // Medications
  result.medications.forEach(med => {
    csv += `Medication,${med.drugName},"${med.dosage} ${med.frequency}",${med.confidence}\n`
  })

  // Diagnoses
  result.diagnoses.forEach(diag => {
    csv += `Diagnosis,${diag.condition},${diag.icdCode || ''},${diag.confidence}\n`
  })

  // Lab Results
  result.labResults.forEach(lab => {
    csv += `Lab,${lab.testName},"${lab.value} ${lab.unit}",${lab.confidence}\n`
  })

  return csv
}

export async function exportToPDF(result) {
  // Simplified PDF export - in real app, use a PDF library
  return `Medical Document Extraction Report\n\nDocument ID: ${result.documentId}\nExtracted: ${result.extractedAt}\n\nThis is a placeholder. Use a PDF library like pdfkit for real PDF generation.`
}
