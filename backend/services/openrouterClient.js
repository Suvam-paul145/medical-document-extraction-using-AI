/**
 * OpenRouter API Integration - JavaScript Implementation
 * 
 * Since your backend is in JavaScript, this file shows how to convert
 * the TypeScript implementation to JavaScript while maintaining full functionality.
 */

// ============================================================================
// OPENROUTER CLIENT - JAVASCRIPT VERSION
// ============================================================================

class OpenRouterClient {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('OpenRouter API key is required')
    }

    this.apiKey = config.apiKey
    this.apiBaseUrl = config.apiBaseUrl || 'https://openrouter.ai/api/v1'
    this.siteUrl = config.siteUrl
    this.siteName = config.siteName
    this.timeout = config.timeout || 30000
  }

  /**
   * Make a request to OpenRouter API
   */
  async request(body, options = {}) {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    }

    // Add optional headers for ranking
    if (this.siteUrl) {
      headers['HTTP-Referer'] = this.siteUrl
    }
    if (this.siteName) {
      headers['X-Title'] = this.siteName
    }

    const controller = new AbortController()
    const timeout = options.timeout || this.timeout
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(`${this.apiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
        )
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      throw new Error(`OpenRouter request failed: ${error.message}`)
    }
  }

  /**
   * Chat completion with text messages
   */
  async chat(messages, options = {}) {
    const body = {
      model: options.model || 'openai/gpt-4-turbo-preview',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 2048
    }

    const response = await this.request(body)

    if (response.error) {
      throw new Error(`OpenRouter error: ${response.error.message}`)
    }

    const choice = response.choices[0]
    if (!choice || !choice.message.content) {
      throw new Error('No response content from OpenRouter')
    }

    return choice.message.content
  }

  /**
   * Chat completion with function calling
   */
  async chatWithFunctions(messages, functions, options = {}) {
    const body = {
      model: options.model || 'openai/gpt-4-turbo-preview',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 2048,
      functions,
      function_choice: 'auto'
    }

    return await this.request(body)
  }

  /**
   * Analyze an image/document
   */
  async analyzeImage(imageUrl, prompt, options = {}) {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          }
        ]
      }
    ]

    return await this.chat(messages, options)
  }

  /**
   * Extract medical data from image using function calling
   */
  async extractMedicalDataFromImage(imageUrl, prompt, functions, options = {}) {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          }
        ]
      }
    ]

    return await this.chatWithFunctions(messages, functions, options)
  }
}

// ============================================================================
// MEDICAL EXTRACTION AGENT - JAVASCRIPT VERSION
// ============================================================================

const EXTRACTION_FUNCTIONS = [
  {
    name: 'classify_document',
    description: 'Classify the type of medical document being analyzed',
    parameters: {
      type: 'object',
      properties: {
        documentType: {
          type: 'string',
          enum: [
            'prescription',
            'lab_report',
            'medical_report',
            'imaging_report',
            'discharge_summary',
            'progress_note',
            'other'
          ]
        },
        confidence: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Confidence score for document classification'
        },
        reason: {
          type: 'string',
          description: 'Explanation for the document classification'
        }
      },
      required: ['documentType', 'confidence']
    }
  },
  {
    name: 'extract_patient_info',
    description: 'Extract patient demographic and identification information',
    parameters: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        dateOfBirth: { type: 'string', description: 'Format: YYYY-MM-DD' },
        age: { type: 'number' },
        gender: { type: 'string', enum: ['M', 'F', 'Other', 'Unknown'] },
        mrn: { type: 'string', description: 'Medical Record Number' },
        accountNumber: { type: 'string' }
      }
    }
  },
  {
    name: 'extract_medications',
    description: 'Extract medication information from prescription or medical records',
    parameters: {
      type: 'object',
      properties: {
        medications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Drug name' },
              dosage: { type: 'string', description: 'e.g., 500mg, 10mL' },
              frequency: { type: 'string', description: 'e.g., twice daily' },
              route: { type: 'string', enum: ['oral', 'IV', 'IM', 'topical', 'inhalation'] },
              duration: { type: 'string' },
              purpose: { type: 'string' }
            },
            required: ['name']
          }
        }
      }
    }
  },
  {
    name: 'extract_diagnoses',
    description: 'Extract diagnosis and clinical findings',
    parameters: {
      type: 'object',
      properties: {
        diagnoses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              condition: { type: 'string' },
              icdCode: { type: 'string' },
              severity: { type: 'string', enum: ['mild', 'moderate', 'severe', 'unknown'] }
            },
            required: ['condition']
          }
        }
      }
    }
  },
  {
    name: 'extract_lab_results',
    description: 'Extract laboratory test results',
    parameters: {
      type: 'object',
      properties: {
        labResults: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              testName: { type: 'string' },
              value: { type: 'string' },
              unit: { type: 'string' },
              referenceRange: { type: 'string' },
              status: { type: 'string', enum: ['normal', 'abnormal', 'critical', 'unknown'] }
            },
            required: ['testName']
          }
        }
      }
    }
  },
  {
    name: 'extract_vital_signs',
    description: 'Extract vital signs measurements',
    parameters: {
      type: 'object',
      properties: {
        vitalSigns: {
          type: 'object',
          properties: {
            bloodPressure: { type: 'string' },
            heartRate: { type: 'string' },
            temperature: { type: 'string' },
            respiratoryRate: { type: 'string' },
            oxygenSaturation: { type: 'string' }
          }
        }
      }
    }
  },
  {
    name: 'validate_extraction',
    description: 'Validate the completeness and accuracy of extracted data',
    parameters: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        completeness: { type: 'number', minimum: 0, maximum: 1 },
        issues: { type: 'array', items: { type: 'string' } }
      }
    }
  }
]

class MedicalExtractionAgent {
  constructor(apiKey, model = 'openai/gpt-4-turbo-preview') {
    this.client = new OpenRouterClient({
      apiKey,
      siteUrl: process.env.SITE_URL || 'http://localhost:5173',
      siteName: 'Medical Document Extraction'
    })
    this.model = model
    this.conversationHistory = []
    this.extractedData = {}
    this.onProgress = null
  }

  /**
   * Extract medical data from OCR text
   */
  async extractMedicalData(ocrText, onProgress) {
    this.onProgress = onProgress
    this.conversationHistory = []
    this.extractedData = {}

    try {
      await this.analyzeDocument(ocrText)
      await this.extractPatientInfo()
      await this.extractMedications()
      await this.extractDiagnoses()
      await this.extractLabResults()
      await this.validateExtraction()

      return this.extractedData
    } catch (error) {
      console.error('Extraction error:', error)
      throw error
    }
  }

  /**
   * Stage 1: Analyze and classify document
   */
  async analyzeDocument(ocrText) {
    this.emitProgress({
      stage: 'Analysis',
      substage: 'Classifying',
      message: 'Analyzing document type and characteristics...',
      progress: 10
    })

    const systemPrompt = `You are an expert medical document analyzer. Analyze the provided document.
    First, classify the document type. Use the classify_document function.`

    const userMessage = `Please analyze this medical document:\n\n${ocrText}`

    this.conversationHistory.push({
      role: 'user',
      content: [{ type: 'text', text: userMessage }]
    })

    const response = await this.callAgent(systemPrompt, [EXTRACTION_FUNCTIONS[0]])

    await this.processResponse(response)

    this.emitProgress({
      stage: 'Analysis',
      substage: 'Classification Complete',
      message: 'Document classification complete',
      progress: 15,
      data: {
        documentType: this.extractedData.documentType,
        confidence: this.extractedData.confidence
      }
    })
  }

  /**
   * Stage 2: Extract patient information
   */
  async extractPatientInfo() {
    this.emitProgress({
      stage: 'Extraction',
      substage: 'Patient Info',
      message: 'Extracting patient information...',
      progress: 30
    })

    const systemPrompt = `Extract all patient demographic and identification information.
    Use the extract_patient_info function.`

    const userMessage = `Please extract all patient information:`

    this.conversationHistory.push({
      role: 'user',
      content: [{ type: 'text', text: userMessage }]
    })

    const response = await this.callAgent(systemPrompt, [EXTRACTION_FUNCTIONS[1]])
    await this.processResponse(response)

    this.emitProgress({
      stage: 'Extraction',
      substage: 'Patient Info Complete',
      message: 'Patient information extracted',
      progress: 40
    })
  }

  /**
   * Stage 3: Extract medications
   */
  async extractMedications() {
    this.emitProgress({
      stage: 'Extraction',
      substage: 'Medications',
      message: 'Extracting medication information...',
      progress: 50
    })

    const systemPrompt = `Extract all medications mentioned in the document.
    Use the extract_medications function.`

    const userMessage = `Please extract all medication information:`

    this.conversationHistory.push({
      role: 'user',
      content: [{ type: 'text', text: userMessage }]
    })

    const response = await this.callAgent(systemPrompt, [EXTRACTION_FUNCTIONS[2]])
    await this.processResponse(response)

    this.emitProgress({
      stage: 'Extraction',
      substage: 'Medications Complete',
      message: 'Medication information extracted',
      progress: 60
    })
  }

  /**
   * Stage 4: Extract diagnoses
   */
  async extractDiagnoses() {
    this.emitProgress({
      stage: 'Extraction',
      substage: 'Diagnoses',
      message: 'Extracting clinical diagnoses...',
      progress: 70
    })

    const systemPrompt = `Extract all diagnoses and clinical findings.
    Use the extract_diagnoses function.`

    const userMessage = `Please extract all diagnosis information:`

    this.conversationHistory.push({
      role: 'user',
      content: [{ type: 'text', text: userMessage }]
    })

    const response = await this.callAgent(systemPrompt, [EXTRACTION_FUNCTIONS[3]])
    await this.processResponse(response)

    this.emitProgress({
      stage: 'Extraction',
      substage: 'Diagnoses Complete',
      message: 'Diagnosis information extracted',
      progress: 75
    })
  }

  /**
   * Stage 5: Extract lab results
   */
  async extractLabResults() {
    this.emitProgress({
      stage: 'Extraction',
      substage: 'Lab Results',
      message: 'Extracting laboratory results...',
      progress: 80
    })

    const systemPrompt = `Extract all laboratory test results.
    Use the extract_lab_results function.`

    const userMessage = `Please extract all lab results:`

    this.conversationHistory.push({
      role: 'user',
      content: [{ type: 'text', text: userMessage }]
    })

    const response = await this.callAgent(systemPrompt, [EXTRACTION_FUNCTIONS[4]])
    await this.processResponse(response)

    this.emitProgress({
      stage: 'Extraction',
      substage: 'Lab Results Complete',
      message: 'Lab results extracted',
      progress: 85
    })
  }

  /**
   * Stage 6: Validate extraction
   */
  async validateExtraction() {
    this.emitProgress({
      stage: 'Validation',
      substage: 'Quality Check',
      message: 'Validating extracted data...',
      progress: 90
    })

    const systemPrompt = `Validate the completeness and accuracy of extracted data.
    Use the validate_extraction function.`

    const userMessage = `Please validate all extracted data:`

    this.conversationHistory.push({
      role: 'user',
      content: [{ type: 'text', text: userMessage }]
    })

    const response = await this.callAgent(systemPrompt, [EXTRACTION_FUNCTIONS[6]])
    await this.processResponse(response)

    this.emitProgress({
      stage: 'Validation',
      substage: 'Complete',
      message: 'Data validation complete',
      progress: 100
    })
  }

  /**
   * Call OpenRouter API with function calling
   */
  async callAgent(systemPrompt, functions) {
    const messages = [
      {
        role: 'system',
        content: [{ type: 'text', text: systemPrompt }]
      },
      ...this.conversationHistory
    ]

    const response = await this.client.chatWithFunctions(
      messages,
      functions,
      {
        model: this.model,
        temperature: 0.5,
        maxTokens: 2048
      }
    )

    // Add assistant response to history
    if (response.choices[0]?.message) {
      this.conversationHistory.push({
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: response.choices[0].message.content || ''
          }
        ]
      })
    }

    return response
  }

  /**
   * Process OpenRouter API response
   */
  async processResponse(response) {
    if (response.error) {
      throw new Error(`OpenRouter error: ${response.error.message}`)
    }

    const choice = response.choices[0]
    if (!choice) {
      throw new Error('No response choice from OpenRouter')
    }

    // Handle function calls
    if (choice.message.function_call) {
      const functionName = choice.message.function_call.name
      const functionArgs = JSON.parse(choice.message.function_call.arguments)
      this.processExtractedData(functionName, functionArgs)
    }
  }

  /**
   * Process extracted data based on function name
   */
  processExtractedData(functionName, functionArgs) {
    switch (functionName) {
      case 'classify_document':
        this.extractedData.documentType = functionArgs.documentType
        this.extractedData.confidence = functionArgs.confidence
        break
      case 'extract_patient_info':
        this.extractedData.patientInfo = functionArgs
        break
      case 'extract_medications':
        this.extractedData.medications = functionArgs.medications || []
        break
      case 'extract_diagnoses':
        this.extractedData.diagnoses = functionArgs.diagnoses || []
        break
      case 'extract_lab_results':
        this.extractedData.labResults = functionArgs.labResults || []
        break
      case 'extract_vital_signs':
        this.extractedData.vitalSigns = functionArgs.vitalSigns || {}
        break
    }
  }

  /**
   * Emit progress updates
   */
  emitProgress(stage) {
    if (this.onProgress) {
      this.onProgress(stage)
    }
  }
}

// ============================================================================
// USAGE IN EXPRESS ROUTE
// ============================================================================

// Example integration in backend/services/extraction.js

/*
const { MedicalExtractionAgent } = require('./extractionAgentOpenRouter.js')

export async function processDocument(file, uploadPath, io) {
  try {
    // Extract text with OCR (existing code)
    const ocrText = await performOCR(file)

    // Initialize agent
    const agent = new MedicalExtractionAgent(
      process.env.OPENROUTER_API_KEY,
      process.env.EXTRACTION_MODEL || 'openai/gpt-4-turbo-preview'
    )

    // Extract with progress tracking
    const extractionResult = await agent.extractMedicalData(
      ocrText,
      (stage) => {
        // Emit progress to frontend via WebSocket
        io.emit('extraction_progress', stage)
      }
    )

    return extractionResult
  } catch (error) {
    console.error('Extraction failed:', error)
    throw error
  }
}

// In your route handler:
app.post('/api/upload', async (req, res) => {
  try {
    const result = await processDocument(req.file, uploadPath, io)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
*/

module.exports = {
  OpenRouterClient,
  MedicalExtractionAgent,
  EXTRACTION_FUNCTIONS
}
