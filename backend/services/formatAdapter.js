/**
 * Format Adapter - Intelligent Document Format Detection & Normalization
 * 
 * Detects document format (prescription, lab report, medical record, etc.)
 * and adapts extraction to handle format-specific requirements
 */

const documentFormats = {
  PRESCRIPTION: {
    id: 'prescription',
    name: 'Prescription',
    requiredFields: ['medications', 'patient'],
    optionalFields: ['physician', 'diagnosis', 'date'],
    essentialFields: ['medications', 'patient.name', 'patient.age'],
    dropFields: ['documentLength', 'validation.warnings', 'vitals']
  },
  LAB_REPORT: {
    id: 'lab_report',
    name: 'Laboratory Report',
    requiredFields: ['labTests', 'patient'],
    optionalFields: ['vitals', 'physician', 'date'],
    essentialFields: ['labTests', 'patient.name'],
    dropFields: ['medications', 'diagnoses', 'documentLength']
  },
  MEDICAL_REPORT: {
    id: 'medical_report',
    name: 'Medical Report/Chart',
    requiredFields: ['patient', 'diagnoses'],
    optionalFields: ['medications', 'labTests', 'physician', 'vitals'],
    essentialFields: ['patient.name', 'diagnoses'],
    dropFields: []
  },
  DISCHARGE_SUMMARY: {
    id: 'discharge_summary',
    name: 'Discharge Summary',
    requiredFields: ['patient', 'diagnoses', 'medications'],
    optionalFields: ['labTests', 'physician', 'vitals'],
    essentialFields: ['patient.name', 'diagnoses', 'medications'],
    dropFields: []
  },
  IMAGING_REPORT: {
    id: 'imaging_report',
    name: 'Imaging Report',
    requiredFields: ['patient'],
    optionalFields: ['diagnoses', 'physician', 'findings'],
    essentialFields: ['patient.name'],
    dropFields: ['medications', 'labTests', 'vitals']
  },
  PROGRESS_NOTE: {
    id: 'progress_note',
    name: 'Progress Note',
    requiredFields: ['patient'],
    optionalFields: ['diagnoses', 'medications', 'physician'],
    essentialFields: ['patient.name'],
    dropFields: ['labTests', 'vitals']
  }
}

/**
 * Detect document format based on extracted data and content patterns
 */
export function detectDocumentFormat(extractedData, documentText) {
  const { documentType } = extractedData
  
  // Map extracted document type to format
  const formatMap = {
    'prescription': documentFormats.PRESCRIPTION,
    'lab_report': documentFormats.LAB_REPORT,
    'medical_report': documentFormats.MEDICAL_REPORT,
    'imaging_report': documentFormats.IMAGING_REPORT,
    'discharge_summary': documentFormats.DISCHARGE_SUMMARY,
    'progress_note': documentFormats.PROGRESS_NOTE,
    'other': null
  }
  
  let detectedFormat = formatMap[documentType] || null
  
  // If format not detected, use pattern matching on document text
  if (!detectedFormat) {
    detectedFormat = inferFormatFromText(documentText)
  }
  
  return detectedFormat || formatMap.medical_report // Default to medical report
}

/**
 * Infer document format from text patterns
 */
function inferFormatFromText(text) {
  const lowerText = text.toLowerCase()
  
  // Prescription indicators
  if (lowerText.match(/rx|prescription|prescribed|tablets?|capsules?|dosage|frequency/i)) {
    return documentFormats.PRESCRIPTION
  }
  
  // Lab report indicators
  if (lowerText.match(/laboratory|lab results?|test results?|blood test|urinalysis|reference range/i)) {
    return documentFormats.LAB_REPORT
  }
  
  // Discharge summary indicators
  if (lowerText.match(/discharge|discharged|hospital course|diagnoses at discharge/i)) {
    return documentFormats.DISCHARGE_SUMMARY
  }
  
  // Imaging report indicators
  if (lowerText.match(/imaging|mri|ct scan|x-ray|ultrasound|radiograph|findings:/i)) {
    return documentFormats.IMAGING_REPORT
  }
  
  // Progress note indicators
  if (lowerText.match(/progress note|office visit|follow-up|subjective|objective|assessment|plan/i)) {
    return documentFormats.PROGRESS_NOTE
  }
  
  // Default to medical report
  return documentFormats.MEDICAL_REPORT
}

/**
 * Normalize extracted data according to detected format
 * - Keep only essential fields for the format
 * - Drop non-essential metadata
 * - Handle missing required fields gracefully
 */
export function normalizeByFormat(extractedData, format) {
  if (!format) return extractedData
  
  const normalized = {
    documentId: extractedData.documentId,
    documentType: format.id,
    documentName: format.name,
    extractedAt: extractedData.extractedAt,
    processingTime: extractedData.processingTime,
    extractionConfidence: extractedData.confidence || 0.7
  }
  
  // Add required and optional fields
  const fieldsToInclude = [...format.requiredFields, ...format.optionalFields]
  
  fieldsToInclude.forEach(field => {
    const value = getNestedValue(extractedData, field)
    if (value !== undefined && value !== null) {
      setNestedValue(normalized, field, value)
    }
  })
  
  // Validate essential fields are present
  const missingEssential = format.essentialFields.filter(
    field => !getNestedValue(normalized, field)
  )
  
  if (missingEssential.length > 0) {
    normalized.warnings = normalized.warnings || []
    normalized.warnings.push(
      `Missing essential fields for ${format.name}: ${missingEssential.join(', ')}`
    )
  }
  
  // Add validation metadata
  if (extractedData.validation) {
    normalized.dataQuality = {
      isValid: extractedData.validation.isValid,
      warnings: extractedData.validation.warnings || [],
      recommendations: extractedData.validation.recommendations || []
    }
  }
  
  return normalized
}

/**
 * Clean up data by removing unnecessary fields
 */
export function cleanupData(extractedData, format) {
  const cleaned = { ...extractedData }
  
  if (!format) return cleaned
  
  // Remove fields marked as non-essential
  format.dropFields.forEach(field => {
    deleteNestedValue(cleaned, field)
  })
  
  // Remove empty arrays and null objects
  removeEmptyValues(cleaned)
  
  return cleaned
}

/**
 * Helper: Get nested property value (e.g., "patient.name")
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj)
}

/**
 * Helper: Set nested property value
 */
function setNestedValue(obj, path, value) {
  const parts = path.split('.')
  let current = obj
  
  for (let i = 0; i < parts.length - 1; i++) {
    const prop = parts[i]
    current[prop] = current[prop] || {}
    current = current[prop]
  }
  
  current[parts[parts.length - 1]] = value
}

/**
 * Helper: Delete nested property
 */
function deleteNestedValue(obj, path) {
  const parts = path.split('.')
  let current = obj
  
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]]
    if (!current) return
  }
  
  delete current[parts[parts.length - 1]]
}

/**
 * Helper: Remove empty values (empty arrays, empty objects, nulls)
 */
function removeEmptyValues(obj) {
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        delete obj[key]
      } else {
        value.forEach(item => {
          if (typeof item === 'object') removeEmptyValues(item)
        })
      }
    } else if (value && typeof value === 'object') {
      removeEmptyValues(value)
      if (Object.keys(value).length === 0) {
        delete obj[key]
      }
    } else if (value === null || value === undefined) {
      delete obj[key]
    }
  })
}

/**
 * Format extraction results for display
 * Adapts output based on document format
 */
export function formatForDisplay(extractedData, format) {
  const formatted = {
    documentType: format?.name || extractedData.documentType,
    confidence: extractedData.extractionConfidence || 0.7,
    extractedAt: new Date(extractedData.extractedAt).toLocaleString(),
    processingTime: `${(extractedData.processingTime / 1000).toFixed(2)}s`,
    sections: {}
  }
  
  // Build sections based on format
  if (extractedData.patient) {
    formatted.sections.patient = {
      title: 'Patient Information',
      data: extractedData.patient,
      isVisible: true
    }
  }
  
  if (extractedData.medications && Array.isArray(extractedData.medications)) {
    formatted.sections.medications = {
      title: 'Medications',
      count: extractedData.medications.length,
      data: extractedData.medications,
      isVisible: format?.requiredFields?.includes('medications') || 
                 format?.optionalFields?.includes('medications')
    }
  }
  
  if (extractedData.diagnoses && Array.isArray(extractedData.diagnoses)) {
    formatted.sections.diagnoses = {
      title: 'Diagnoses',
      count: extractedData.diagnoses.length,
      data: extractedData.diagnoses,
      isVisible: format?.requiredFields?.includes('diagnoses') || 
                 format?.optionalFields?.includes('diagnoses')
    }
  }
  
  if (extractedData.labTests && Array.isArray(extractedData.labTests)) {
    formatted.sections.labTests = {
      title: 'Laboratory Tests',
      count: extractedData.labTests.length,
      data: extractedData.labTests,
      isVisible: format?.requiredFields?.includes('labTests') || 
                 format?.optionalFields?.includes('labTests')
    }
  }
  
  if (extractedData.vitals && Object.keys(extractedData.vitals).length > 0) {
    formatted.sections.vitals = {
      title: 'Vital Signs',
      data: extractedData.vitals,
      isVisible: format?.optionalFields?.includes('vitals')
    }
  }
  
  if (extractedData.dataQuality) {
    formatted.dataQuality = extractedData.dataQuality
  }
  
  return formatted
}

export const DocumentFormat = {
  PRESCRIPTION: documentFormats.PRESCRIPTION,
  LAB_REPORT: documentFormats.LAB_REPORT,
  MEDICAL_REPORT: documentFormats.MEDICAL_REPORT,
  DISCHARGE_SUMMARY: documentFormats.DISCHARGE_SUMMARY,
  IMAGING_REPORT: documentFormats.IMAGING_REPORT,
  PROGRESS_NOTE: documentFormats.PROGRESS_NOTE,
  detect: detectDocumentFormat,
  normalize: normalizeByFormat,
  cleanup: cleanupData,
  formatForDisplay
}
