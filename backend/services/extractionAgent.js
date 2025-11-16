import OpenAI from 'openai'

/**
 * Agentic Medical Document Extraction
 * 
 * Multi-stage extraction pipeline:
 * 1. Document Analysis - Determine document type and key sections
 * 2. Entity Classification - Identify and classify medical entities
 * 3. Information Extraction - Extract structured medical data using function calling
 * 4. Validation - Verify extracted data accuracy and consistency
 * 5. Confidence Scoring - Rate confidence of extracted information
 */

// Define the tools/functions for the agent to use
const extractionTools = [
  {
    type: 'function',
    function: {
      name: 'classify_document',
      description: 'Classify the medical document type and identify key sections',
      parameters: {
        type: 'object',
        properties: {
          documentType: {
            type: 'string',
            enum: ['prescription', 'lab_report', 'medical_report', 'imaging_report', 'discharge_summary', 'progress_note', 'other'],
            description: 'Type of medical document'
          },
          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'Confidence score for document classification'
          },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                startLine: { type: 'integer' },
                endLine: { type: 'integer' }
              }
            },
            description: 'Identified sections in the document'
          }
        },
        required: ['documentType', 'confidence', 'sections']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'extract_patient_info',
      description: 'Extract patient demographic and identification information',
      parameters: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['M', 'F', 'Other', 'Unknown'] },
          mrn: { type: 'string', description: 'Medical Record Number' },
          age: { type: 'integer' },
          confidence: { type: 'number', minimum: 0, maximum: 1 }
        },
        required: ['confidence']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'extract_medications',
      description: 'Extract medication information including name, dosage, frequency, and duration',
      parameters: {
        type: 'object',
        properties: {
          medications: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                dosage: { type: 'string' },
                unit: { type: 'string', enum: ['mg', 'g', 'ml', 'mcg', 'IU', 'tabs', 'drops', 'other'] },
                frequency: { type: 'string' },
                duration: { type: 'string' },
                route: { type: 'string', enum: ['oral', 'iv', 'im', 'topical', 'inhaled', 'transdermal', 'other'] },
                indication: { type: 'string', description: 'Reason for medication' },
                confidence: { type: 'number', minimum: 0, maximum: 1 }
              },
              required: ['name', 'confidence']
            }
          }
        },
        required: ['medications']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'extract_diagnoses',
      description: 'Extract diagnoses, medical conditions, and clinical findings',
      parameters: {
        type: 'object',
        properties: {
          diagnoses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                condition: { type: 'string' },
                icdCode: { type: 'string', description: 'ICD-10 code if available' },
                status: { type: 'string', enum: ['confirmed', 'suspected', 'ruled_out', 'history'] },
                severity: { type: 'string', enum: ['mild', 'moderate', 'severe', 'unknown'] },
                onsetDate: { type: 'string', format: 'date' },
                confidence: { type: 'number', minimum: 0, maximum: 1 }
              },
              required: ['condition', 'confidence']
            }
          }
        },
        required: ['diagnoses']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'extract_lab_results',
      description: 'Extract laboratory test results and values',
      parameters: {
        type: 'object',
        properties: {
          labTests: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                testName: { type: 'string' },
                value: { type: 'string' },
                unit: { type: 'string' },
                referenceRange: { type: 'string' },
                resultStatus: { type: 'string', enum: ['normal', 'abnormal_high', 'abnormal_low', 'critical', 'unknown'] },
                testDate: { type: 'string', format: 'date' },
                confidence: { type: 'number', minimum: 0, maximum: 1 }
              },
              required: ['testName', 'confidence']
            }
          }
        },
        required: ['labTests']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'extract_vital_signs',
      description: 'Extract vital signs and measurements',
      parameters: {
        type: 'object',
        properties: {
          vitals: {
            type: 'object',
            properties: {
              temperature: { type: 'string' },
              bloodPressure: { type: 'string' },
              heartRate: { type: 'string' },
              respiratoryRate: { type: 'string' },
              oxygenSaturation: { type: 'string' },
              weight: { type: 'string' },
              height: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' }
            }
          },
          confidence: { type: 'number', minimum: 0, maximum: 1 }
        },
        required: ['confidence']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'validate_extraction',
      description: 'Validate extracted data for consistency and flag potential issues',
      parameters: {
        type: 'object',
        properties: {
          isValid: { type: 'boolean' },
          issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                severity: { type: 'string', enum: ['info', 'warning', 'error'] },
                message: { type: 'string' },
                field: { type: 'string' }
              }
            }
          },
          recommendations: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['isValid']
      }
    }
  }
]

export class MedicalExtractionAgent {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required for agentic extraction')
    }
    this.client = new OpenAI({ apiKey })
    this.conversationHistory = []
  }

  async extractMedicalData(documentText, onProgress) {
    try {
      // Stage 1: Document Analysis
      onProgress({
        stage: 'analyzing',
        substage: 'document_analysis',
        message: 'Analyzing document structure and type...',
        progress: 20
      })

      const analysisResponse = await this.analyzeDocument(documentText)
      const documentAnalysis = this.parseResponse(analysisResponse)

      onProgress({
        stage: 'analyzing',
        substage: 'document_analysis_complete',
        message: `Document type: ${documentAnalysis.documentType || 'unknown'}`,
        progress: 35,
        data: { documentType: documentAnalysis.documentType }
      })

      // Stage 2: Entity Classification and Extraction
      onProgress({
        stage: 'extracting',
        substage: 'entity_extraction',
        message: 'Extracting patient information...',
        progress: 40
      })

      const patientInfo = await this.extractPatientInfo(documentText, documentAnalysis)
      onProgress({
        stage: 'extracting',
        substage: 'patient_extracted',
        message: 'Patient information extracted',
        progress: 50
      })

      // Extract medications
      onProgress({
        stage: 'extracting',
        substage: 'medication_extraction',
        message: 'Extracting medications...',
        progress: 55
      })

      const medications = await this.extractMedications(documentText, documentAnalysis)
      onProgress({
        stage: 'extracting',
        substage: 'medication_extracted',
        message: `Found ${medications.medications?.length || 0} medications`,
        progress: 65
      })

      // Extract diagnoses
      onProgress({
        stage: 'extracting',
        substage: 'diagnosis_extraction',
        message: 'Extracting diagnoses and conditions...',
        progress: 70
      })

      const diagnoses = await this.extractDiagnoses(documentText, documentAnalysis)
      onProgress({
        stage: 'extracting',
        substage: 'diagnosis_extracted',
        message: `Found ${diagnoses.diagnoses?.length || 0} diagnoses`,
        progress: 75
      })

      // Extract lab results
      onProgress({
        stage: 'extracting',
        substage: 'lab_extraction',
        message: 'Extracting laboratory results...',
        progress: 80
      })

      const labResults = await this.extractLabResults(documentText, documentAnalysis)
      onProgress({
        stage: 'extracting',
        substage: 'lab_extracted',
        message: `Found ${labResults.labTests?.length || 0} lab tests`,
        progress: 85
      })

      // Stage 3: Validation
      onProgress({
        stage: 'validating',
        substage: 'data_validation',
        message: 'Validating extracted data...',
        progress: 90
      })

      const validation = await this.validateExtraction({
        ...documentAnalysis,
        ...patientInfo,
        ...medications,
        ...diagnoses,
        ...labResults
      })

      onProgress({
        stage: 'validating',
        substage: 'validation_complete',
        message: validation.isValid ? 'Data validation passed' : 'Validation warnings present',
        progress: 95
      })

      // Compile final result
      const extractedData = {
        documentType: documentAnalysis.documentType || 'unknown',
        confidence: documentAnalysis.confidence || 0.7,
        patient: patientInfo,
        medications: medications.medications || [],
        diagnoses: diagnoses.diagnoses || [],
        labTests: labResults.labTests || [],
        vitals: labResults.vitals || {},
        validation: validation,
        extractedAt: new Date().toISOString(),
        documentLength: documentText.length
      }

      onProgress({
        stage: 'complete',
        message: 'Extraction complete',
        progress: 100,
        extractedData
      })

      return extractedData
    } catch (error) {
      console.error('Extraction agent error:', error)
      throw error
    }
  }

  async analyzeDocument(documentText) {
    const systemPrompt = `You are a medical document analysis expert. Analyze the provided medical document and classify its type.
    
    Use the classify_document function to provide:
    1. Document type (prescription, lab report, medical report, etc.)
    2. Confidence score (0-1) for the classification
    3. Key sections identified in the document`

    return await this.callAgent(systemPrompt, documentText)
  }

  async extractPatientInfo(documentText, documentAnalysis) {
    const systemPrompt = `You are a healthcare data extractor specializing in patient information. Extract patient demographic information from the medical document.
    
    Use the extract_patient_info function to provide name, date of birth, gender, medical record number, and age if available.
    Provide a confidence score for each extraction.`

    const userMessage = `Document type: ${documentAnalysis.documentType}\n\nExtract patient information from this document:\n\n${documentText}`

    return await this.callAgent(systemPrompt, userMessage)
  }

  async extractMedications(documentText, documentAnalysis) {
    const systemPrompt = `You are a pharmacology expert data extractor. Extract all medication information from medical documents.
    
    Use the extract_medications function to provide medication names, dosages, frequencies, routes, and indications.
    Include confidence scores for each medication.`

    const userMessage = `Document type: ${documentAnalysis.documentType}\n\nExtract medications from this document:\n\n${documentText}`

    return await this.callAgent(systemPrompt, userMessage)
  }

  async extractDiagnoses(documentText, documentAnalysis) {
    const systemPrompt = `You are a clinical diagnosis expert. Extract diagnoses and medical conditions from the document.
    
    Use the extract_diagnoses function to provide condition names, ICD codes if available, severity, and status.
    Include confidence scores and onset dates when available.`

    const userMessage = `Document type: ${documentAnalysis.documentType}\n\nExtract diagnoses from this document:\n\n${documentText}`

    return await this.callAgent(systemPrompt, userMessage)
  }

  async extractLabResults(documentText, documentAnalysis) {
    const systemPrompt = `You are a laboratory results expert. Extract lab test results, values, and vital signs from the document.
    
    Use the extract_lab_results and extract_vital_signs functions to provide test names, values, units, reference ranges, and vital sign measurements.
    Include confidence scores for each result.`

    const userMessage = `Document type: ${documentAnalysis.documentType}\n\nExtract lab results and vital signs from this document:\n\n${documentText}`

    return await this.callAgent(systemPrompt, userMessage)
  }

  async validateExtraction(extractedData) {
    const systemPrompt = `You are a medical data validation expert. Review the extracted medical data for consistency, completeness, and accuracy.
    
    Use the validate_extraction function to identify any issues, provide recommendations, and rate overall validity.
    Flag any contradictions, missing critical information, or suspicious values.`

    const userMessage = `Validate this extracted medical data:\n\n${JSON.stringify(extractedData, null, 2)}`

    return await this.callAgent(systemPrompt, userMessage)
  }

  async callAgent(systemPrompt, userMessage) {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    })

    const response = await this.client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      system: systemPrompt,
      messages: this.conversationHistory,
      tools: extractionTools,
      tool_choice: 'auto',
      max_tokens: 4096
    })

    // Process function calls if present
    if (response.choices[0].finish_reason === 'tool_calls') {
      const toolCalls = response.choices[0].message.tool_calls

      // Store assistant response
      this.conversationHistory.push({
        role: 'assistant',
        content: response.choices[0].message.content || '',
        tool_calls: toolCalls
      })

      const toolResults = []
      for (const toolCall of toolCalls) {
        const result = JSON.parse(toolCall.function.arguments)
        toolResults.push({
          type: 'tool',
          tool_use_id: toolCall.id,
          content: JSON.stringify(result)
        })
      }

      // Add tool results to history
      this.conversationHistory.push({
        role: 'user',
        content: toolResults
      })

      return toolResults.map(r => JSON.parse(r.content))
    }

    // Extract structured data from response
    return this.parseResponse(response.choices[0].message.content)
  }

  parseResponse(response) {
    if (Array.isArray(response)) {
      return response.length > 0 ? response[0] : {}
    }

    if (typeof response === 'object') {
      return response
    }

    // Try to extract JSON from text response
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    } catch (e) {
      return { error: 'Could not parse response' }
    }
  }
}

// Export function for compatibility with existing code
export async function extractMedicalDataWithAgent(documentText, apiKey) {
  const agent = new MedicalExtractionAgent(apiKey)
  
  return new Promise((resolve, reject) => {
    agent.extractMedicalData(documentText, (progress) => {
      // Progress callbacks handled by caller
    }).then(resolve).catch(reject)
  })
}
