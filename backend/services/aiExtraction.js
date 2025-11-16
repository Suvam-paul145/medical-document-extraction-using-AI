import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'

/**
 * Extract medical information from document text using AI
 * @param {string} documentText - The extracted text from the document
 * @param {string} apiKey - OpenAI API key (from user)
 * @returns {Promise<Object>} Structured extraction result
 */
export async function extractMedicalData(documentText, apiKey) {
  // Require API key
  if (!apiKey) {
    throw new Error('OpenAI API key is required for extraction. Please configure it in settings.')
  }

  try {
    // Initialize OpenAI client with provided API key
    const openaiClient = new OpenAI({
      apiKey: apiKey
    })

    const prompt = createExtractionPrompt(documentText)

    // Set timeout for AI call (60 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI extraction timeout after 60 seconds')), 60000)
    })

    const aiPromise = openaiClient.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a medical document extraction expert. Extract structured medical information from documents with high accuracy. Always return valid JSON.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent, accurate extraction
      response_format: { type: 'json_object' }, // Force JSON response
      max_tokens: 2000 // Limit response size for faster processing
    })

    const response = await Promise.race([aiPromise, timeoutPromise])

    const extractedData = JSON.parse(response.choices[0].message.content)
    
    // Add confidence scores (AI doesn't provide these, so we estimate based on completeness)
    return addConfidenceScores(extractedData)
  } catch (error) {
    console.error('AI Extraction Error:', error)
    throw new Error(`AI extraction failed: ${error.message}`)
  }
}

/**
 * Create a detailed prompt for medical data extraction
 */
function createExtractionPrompt(documentText) {
  return `Extract medical information from the following document. Return a JSON object with this exact structure:

{
  "patientInfo": {
    "name": "string or null",
    "dateOfBirth": "YYYY-MM-DD or null",
    "patientId": "string or null",
    "age": number or null,
    "gender": "Male/Female/Other or null"
  },
  "medications": [
    {
      "drugName": "string",
      "dosage": "string",
      "frequency": "string",
      "duration": "string",
      "route": "string (e.g., Oral, IV, Topical)"
    }
  ],
  "diagnoses": [
    {
      "condition": "string",
      "icdCode": "string or null",
      "diagnosedDate": "YYYY-MM-DD or null",
      "severity": "string or null"
    }
  ],
  "labResults": [
    {
      "testName": "string",
      "value": "string",
      "unit": "string",
      "referenceRange": "string or null",
      "status": "normal/abnormal/high/low"
    }
  ],
  "vitalSigns": [
    {
      "type": "string (e.g., Blood Pressure, Heart Rate, Temperature)",
      "value": "string",
      "unit": "string"
    }
  ],
  "physicianInfo": {
    "name": "string or null",
    "specialty": "string or null",
    "licenseNumber": "string or null"
  }
}

IMPORTANT RULES:
1. Only extract information that is explicitly stated in the document
2. If information is not found, use null (not empty string)
3. For dates, use YYYY-MM-DD format
4. For medications, extract: drug name, dosage (e.g., "10mg"), frequency (e.g., "Once daily"), duration, route
5. For lab results, include test name, value, unit, reference range if available, and status (normal/abnormal/high/low)
6. Return empty arrays [] if no items found, not null
7. Be accurate - medical data is critical

Document text:
${documentText.substring(0, 12000)}` // Limit to avoid token limits
}

/**
 * Add confidence scores to extracted data
 * Higher confidence for more complete data
 */
function addConfidenceScores(data) {
  // Calculate confidence based on data completeness
  const calculateConfidence = (item, requiredFields) => {
    const filledFields = requiredFields.filter(field => 
      item[field] !== null && item[field] !== undefined && item[field] !== ''
    ).length
    return Math.min(0.99, 0.7 + (filledFields / requiredFields.length) * 0.25)
  }

  // Patient info confidence
  if (data.patientInfo) {
    data.patientInfo.confidence = calculateConfidence(
      data.patientInfo,
      ['name', 'dateOfBirth', 'patientId']
    )
  }

  // Medications confidence
  if (data.medications && Array.isArray(data.medications)) {
    data.medications.forEach(med => {
      med.confidence = calculateConfidence(med, ['drugName', 'dosage', 'frequency'])
    })
  }

  // Diagnoses confidence
  if (data.diagnoses && Array.isArray(data.diagnoses)) {
    data.diagnoses.forEach(diag => {
      diag.confidence = calculateConfidence(diag, ['condition'])
    })
  }

  // Lab results confidence
  if (data.labResults && Array.isArray(data.labResults)) {
    data.labResults.forEach(lab => {
      lab.confidence = calculateConfidence(lab, ['testName', 'value', 'unit'])
    })
  }

  // Vital signs confidence
  if (data.vitalSigns && Array.isArray(data.vitalSigns)) {
    data.vitalSigns.forEach(vital => {
      vital.confidence = calculateConfidence(vital, ['type', 'value'])
    })
  }

  // Physician info confidence
  if (data.physicianInfo) {
    data.physicianInfo.confidence = calculateConfidence(
      data.physicianInfo,
      ['name']
    )
  }

  return data
}

/**
 * Check if AI extraction is available
 */
export function isAIAvailable() {
  return openaiClient !== null
}

