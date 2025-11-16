/**
 * Medical Extraction Agent using OpenRouter API
 * 
 * This service uses OpenRouter to access multiple AI models for intelligent
 * multi-stage document analysis. It maintains conversation history and uses
 * function calling for structured data extraction.
 */

import {
  OpenRouterClient,
  OpenRouterMessage,
  OpenRouterFunction,
  OpenRouterResponse,
  OPENROUTER_MODELS,
  parseFunctionArguments
} from './openrouterClient'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ExtractionStage {
  stage: string
  substage: string
  message: string
  progress: number
  data?: Record<string, any>
}

export interface MedicalExtractionResult {
  documentType: string
  confidence: number
  patientInfo?: Record<string, any>
  medications?: Array<Record<string, any>>
  diagnoses?: Array<Record<string, any>>
  labResults?: Array<Record<string, any>>
  vitalSigns?: Record<string, any>
  rawText?: string
}

export type ProgressCallback = (stage: ExtractionStage) => void

// ============================================================================
// EXTRACTION FUNCTIONS FOR OPENROUTER FUNCTION CALLING
// ============================================================================

const EXTRACTION_FUNCTIONS: OpenRouterFunction[] = [
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
              frequency: { type: 'string', description: 'e.g., twice daily, every 8 hours' },
              route: { type: 'string', enum: ['oral', 'IV', 'IM', 'topical', 'inhalation', 'sublingual', 'rectal'] },
              duration: { type: 'string', description: 'e.g., 7 days, indefinite' },
              purpose: { type: 'string', description: 'Indication for use' }
            },
            required: ['name']
          }
        }
      }
    }
  },
  {
    name: 'extract_diagnoses',
    description: 'Extract diagnosis and clinical findings from medical documents',
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
              onset: { type: 'string' },
              severity: { type: 'string', enum: ['mild', 'moderate', 'severe', 'unknown'] },
              status: { type: 'string', enum: ['active', 'resolved', 'unknown'] }
            },
            required: ['condition']
          }
        }
      }
    }
  },
  {
    name: 'extract_lab_results',
    description: 'Extract laboratory test results and values from medical documents',
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
              status: { type: 'string', enum: ['normal', 'abnormal', 'critical', 'unknown'] },
              testDate: { type: 'string', description: 'Format: YYYY-MM-DD' }
            },
            required: ['testName']
          }
        }
      }
    }
  },
  {
    name: 'extract_vital_signs',
    description: 'Extract vital signs measurements from medical documents',
    parameters: {
      type: 'object',
      properties: {
        vitalSigns: {
          type: 'object',
          properties: {
            bloodPressure: { type: 'string', description: 'Format: 120/80' },
            heartRate: { type: 'string', description: 'BPM' },
            temperature: { type: 'string', description: 'in Celsius or Fahrenheit' },
            respiratoryRate: { type: 'string', description: 'breaths per minute' },
            oxygenSaturation: { type: 'string', description: 'SpO2 percentage' },
            weight: { type: 'string', description: 'in kg or lbs' },
            height: { type: 'string', description: 'in cm or inches' }
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
        completeness: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Percentage of expected fields that were extracted'
        },
        issues: {
          type: 'array',
          items: {
            type: 'string',
            description: 'Any issues or concerns found during validation'
          }
        },
        recommendations: {
          type: 'array',
          items: {
            type: 'string',
            description: 'Recommendations for improving extraction accuracy'
          }
        }
      }
    }
  }
]

// ============================================================================
// MEDICAL EXTRACTION AGENT CLASS
// ============================================================================

export class MedicalExtractionAgent {
  private client: OpenRouterClient
  private conversationHistory: OpenRouterMessage[] = []
  private extractedData: Partial<MedicalExtractionResult> = {}
  private model: string = OPENROUTER_MODELS.GPT_4_TURBO
  private onProgress?: ProgressCallback

  constructor(apiKey: string, model?: string) {
    this.client = new OpenRouterClient({
      apiKey,
      siteUrl: process.env.SITE_URL || 'http://localhost:5173',
      siteName: 'Medical Document Extraction'
    })

    if (model) {
      this.model = model
    }
  }

  /**
   * Extract medical data from OCR text
   */
  async extractMedicalData(
    ocrText: string,
    onProgress?: ProgressCallback
  ): Promise<MedicalExtractionResult> {
    this.onProgress = onProgress
    this.conversationHistory = []
    this.extractedData = {}

    try {
      // Stage 1: Analyze document
      await this.analyzeDocument(ocrText)

      // Stage 2: Extract patient info
      await this.extractPatientInfo()

      // Stage 3: Extract medications
      await this.extractMedications()

      // Stage 4: Extract diagnoses
      await this.extractDiagnoses()

      // Stage 5: Validate extraction
      await this.validateExtraction()

      return this.extractedData as MedicalExtractionResult
    } catch (error) {
      console.error('Extraction error:', error)
      throw error
    }
  }

  /**
   * Stage 1: Analyze and classify document
   */
  private async analyzeDocument(ocrText: string): Promise<void> {
    this.emitProgress({
      stage: 'Analysis',
      substage: 'Classifying',
      message: 'Analyzing document type and characteristics...',
      progress: 10
    })

    const systemPrompt = `You are an expert medical document analyzer. Analyze the provided medical document carefully.
    First, classify the document type. Be thorough and precise in your analysis.
    Use the classify_document function to provide your classification.`

    const userMessage = `Please analyze this medical document and classify it:\n\n${ocrText}`

    this.conversationHistory.push({
      role: 'user',
      content: [{ type: 'text', text: userMessage }]
    })

    const response = await this.callAgent(systemPrompt, [EXTRACTION_FUNCTIONS[0]])

    await this.processResponse(response, 'Classifying document')

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
  private async extractPatientInfo(): Promise<void> {
    this.emitProgress({
      stage: 'Extraction',
      substage: 'Patient Info',
      message: 'Extracting patient demographic information...',
      progress: 30
    })

    const systemPrompt = `You are an expert at extracting patient information from medical documents.
    Extract all patient demographic and identification information available.
    Use the extract_patient_info function to provide structured patient information.`

    const userMessage = `Based on the document you analyzed, please extract all patient information:`

    this.conversationHistory.push({
      role: 'user',
      content: [{ type: 'text', text: userMessage }]
    })

    const response = await this.callAgent(systemPrompt, [EXTRACTION_FUNCTIONS[1]])

    await this.processResponse(response, 'Extracting patient info')

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
  private async extractMedications(): Promise<void> {
    this.emitProgress({
      stage: 'Extraction',
      substage: 'Medications',
      message: 'Extracting medication information...',
      progress: 50
    })

    const systemPrompt = `You are an expert at extracting medication information from medical documents.
    Extract all medications mentioned, including prescriptions and current medications.
    For each medication, include name, dosage, frequency, route, and any other relevant information.
    Use the extract_medications function to provide structured medication data.`

    const userMessage = `Based on the document you analyzed, please extract all medication information:`

    this.conversationHistory.push({
      role: 'user',
      content: [{ type: 'text', text: userMessage }]
    })

    const response = await this.callAgent(systemPrompt, [EXTRACTION_FUNCTIONS[2]])

    await this.processResponse(response, 'Extracting medications')

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
  private async extractDiagnoses(): Promise<void> {
    this.emitProgress({
      stage: 'Extraction',
      substage: 'Diagnoses',
      message: 'Extracting clinical diagnoses and findings...',
      progress: 70
    })

    const systemPrompt = `You are an expert at extracting diagnosis information from medical documents.
    Extract all diagnoses, conditions, and clinical findings mentioned in the document.
    Include ICD codes if available, severity, and status.
    Use the extract_diagnoses function to provide structured diagnosis data.`

    const userMessage = `Based on the document you analyzed, please extract all diagnosis and clinical information:`

    this.conversationHistory.push({
      role: 'user',
      content: [{ type: 'text', text: userMessage }]
    })

    const response = await this.callAgent(systemPrompt, [EXTRACTION_FUNCTIONS[3]])

    await this.processResponse(response, 'Extracting diagnoses')

    this.emitProgress({
      stage: 'Extraction',
      substage: 'Diagnoses Complete',
      message: 'Diagnosis information extracted',
      progress: 75
    })
  }

  /**
   * Stage 5: Validate extraction
   */
  private async validateExtraction(): Promise<void> {
    this.emitProgress({
      stage: 'Validation',
      substage: 'Quality Check',
      message: 'Validating extracted data quality and completeness...',
      progress: 85
    })

    const systemPrompt = `You are a medical data quality validator. Validate the completeness and accuracy of the extracted data.
    Check for inconsistencies, missing critical fields, and data quality issues.
    Use the validate_extraction function to provide your validation assessment.`

    const userMessage = `Please validate the completeness and accuracy of all extracted data:`

    this.conversationHistory.push({
      role: 'user',
      content: [{ type: 'text', text: userMessage }]
    })

    const response = await this.callAgent(systemPrompt, [EXTRACTION_FUNCTIONS[6]])

    await this.processResponse(response, 'Validating extraction')

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
  private async callAgent(
    systemPrompt: string,
    functions: OpenRouterFunction[]
  ): Promise<OpenRouterResponse> {
    const messages: OpenRouterMessage[] = [
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

    // Add assistant response to conversation history
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
   * Process OpenRouter API response and handle function calls
   */
  private async processResponse(
    response: OpenRouterResponse,
    stageName: string
  ): Promise<void> {
    if (response.error) {
      throw new Error(`OpenRouter API error: ${response.error.message}`)
    }

    const choice = response.choices[0]
    if (!choice) {
      throw new Error('No response choice from OpenRouter')
    }

    // Handle tool calls (function calling)
    if (choice.message.tool_calls) {
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type === 'function') {
          const functionName = toolCall.function.name
          const functionArgs = parseFunctionArguments(toolCall.function.arguments)

          this.processExtractedData(functionName, functionArgs)
        }
      }
    }

    // Handle deprecated function_call format
    if (choice.message.function_call) {
      const functionName = choice.message.function_call.name
      const functionArgs = parseFunctionArguments(choice.message.function_call.arguments)
      this.processExtractedData(functionName, functionArgs)
    }
  }

  /**
   * Process extracted data based on function name
   */
  private processExtractedData(
    functionName: string,
    functionArgs: Record<string, any>
  ): void {
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

      case 'validate_extraction':
        // Validation results don't need to be stored separately
        break
    }
  }

  /**
   * Emit progress updates
   */
  private emitProgress(stage: ExtractionStage): void {
    if (this.onProgress) {
      this.onProgress(stage)
    }
  }
}
