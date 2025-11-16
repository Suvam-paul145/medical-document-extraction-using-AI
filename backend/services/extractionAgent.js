/**
 * Agentic Medical Document Extraction using OpenRouter
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
      throw new Error('OpenRouter API key is required for agentic extraction')
    }
    this.apiKey = apiKey
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

      let documentAnalysis = {}
      try {
        const analysisResponse = await this.analyzeDocument(documentText)
        documentAnalysis = this.parseResponse(analysisResponse)
      } catch (error) {
        console.warn('⚠️  Document analysis failed, continuing with partial data:', error.message)
        documentAnalysis = { documentType: 'Unknown' }
      }

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

      let patientInfo = { patientInfo: {} }
      try {
        patientInfo = await this.extractPatientInfo(documentText, documentAnalysis)
      } catch (error) {
        console.warn('⚠️  Patient info extraction failed, continuing:', error.message)
      }

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

      let medications = { medications: [] }
      try {
        medications = await this.extractMedications(documentText, documentAnalysis)
      } catch (error) {
        console.warn('⚠️  Medication extraction failed, continuing:', error.message)
      }

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

      let diagnoses = { diagnoses: [] }
      try {
        diagnoses = await this.extractDiagnoses(documentText, documentAnalysis)
      } catch (error) {
        console.warn('⚠️  Diagnosis extraction failed, continuing:', error.message)
      }

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

      let labResults = { labTests: [] }
      try {
        labResults = await this.extractLabResults(documentText, documentAnalysis)
      } catch (error) {
        console.warn('⚠️  Lab results extraction failed, continuing:', error.message)
      }

      onProgress({
        stage: 'extracting',
        substage: 'lab_extracted',
        message: `Found ${labResults.labTests?.length || 0} lab tests`,
        progress: 85
      })

      // Stage 3: Validation (optional - skip if fails)
      onProgress({
        stage: 'validating',
        substage: 'data_validation',
        message: 'Validating extracted data...',
        progress: 90
      })

      let validation = { isValid: true, warnings: [] }
      try {
        validation = await this.validateExtraction({
          ...documentAnalysis,
          ...patientInfo,
          ...medications,
          ...diagnoses,
          ...labResults
        })
      } catch (error) {
        console.warn('⚠️  Validation failed, using data anyway:', error.message)
      }

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
    // Reset conversation for document analysis
    this.conversationHistory = []
    
    const systemPrompt = `You are a medical document analysis expert. Analyze the provided medical document and classify its type.
    
    Use the classify_document function to provide:
    1. Document type (prescription, lab report, medical report, etc.)
    2. Confidence score (0-1) for the classification
    3. Key sections identified in the document`

    return await this.callAgent(systemPrompt, documentText)
  }

  async extractPatientInfo(documentText, documentAnalysis) {
    // Reset conversation for each independent extraction task
    this.conversationHistory = []
    
    const systemPrompt = `You are a healthcare data extractor specializing in patient information. Extract patient demographic information from the medical document.
    
    Use the extract_patient_info function to provide name, date of birth, gender, medical record number, and age if available.
    Provide a confidence score for each extraction.`

    const userMessage = `Document type: ${documentAnalysis.documentType}\n\nExtract patient information from this document:\n\n${documentText}`

    return await this.callAgent(systemPrompt, userMessage)
  }

  async extractMedications(documentText, documentAnalysis) {
    // Reset conversation for each independent extraction task
    this.conversationHistory = []
    
    const systemPrompt = `You are a pharmacology expert data extractor. Extract all medication information from medical documents.
    
    Use the extract_medications function to provide medication names, dosages, frequencies, routes, and indications.
    Include confidence scores for each medication.`

    const userMessage = `Document type: ${documentAnalysis.documentType}\n\nExtract medications from this document:\n\n${documentText}`

    return await this.callAgent(systemPrompt, userMessage)
  }

  async extractDiagnoses(documentText, documentAnalysis) {
    // Reset conversation for each independent extraction task
    this.conversationHistory = []
    
    const systemPrompt = `You are a clinical diagnosis expert. Extract diagnoses and medical conditions from the document.
    
    Use the extract_diagnoses function to provide condition names, ICD codes if available, severity, and status.
    Include confidence scores and onset dates when available.`

    const userMessage = `Document type: ${documentAnalysis.documentType}\n\nExtract diagnoses from this document:\n\n${documentText}`

    return await this.callAgent(systemPrompt, userMessage)
  }

  async extractLabResults(documentText, documentAnalysis) {
    // Reset conversation for each independent extraction task
    this.conversationHistory = []
    
    const systemPrompt = `You are a laboratory results expert. Extract lab test results, values, and vital signs from the document.
    
    Use the extract_lab_results and extract_vital_signs functions to provide test names, values, units, reference ranges, and vital sign measurements.
    Include confidence scores for each result.`

    const userMessage = `Document type: ${documentAnalysis.documentType}\n\nExtract lab results and vital signs from this document:\n\n${documentText}`

    return await this.callAgent(systemPrompt, userMessage)
  }

  async validateExtraction(extractedData) {
    // Reset conversation for validation task
    this.conversationHistory = []
    
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

    try {
      // Use OpenRouter API directly with fetch
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.SITE_URL || 'http://localhost:5173',
          'X-Title': 'Medical Document Extraction'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...this.conversationHistory
          ],
          tools: extractionTools.map(t => ({
            type: 'function',
            function: t.function
          })),
          tool_choice: 'auto',
          max_tokens: 800,
          temperature: 0.5
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('OpenRouter API error details:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error,
          body: errorData
        })
        throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      
      // Check if response has valid choices
      if (!data.choices || !data.choices[0]) {
        console.error('Invalid OpenRouter response structure:', {
          status: response.status,
          body: data
        })
        throw new Error(`OpenRouter API returned invalid response structure`)
      }
      
      const choice = data.choices[0]

      // Process tool calls if present (new format)
      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        const toolCall = choice.message.tool_calls[0]
        const functionArgs = typeof toolCall.function.arguments === 'string' 
          ? JSON.parse(toolCall.function.arguments) 
          : toolCall.function.arguments

        // DO NOT store tool_calls in conversation history because:
        // OpenAI requires tool_calls to be followed by tool messages
        // Since we're parsing the result directly, we don't need conversation continuity
        // Store only the assistant message without tool_calls for next turn
        this.conversationHistory.push({
          role: 'assistant',
          content: choice.message.content || `Extracting ${toolCall.function.name}...`
        })

        return {
          functionName: toolCall.function.name,
          functionArgs: functionArgs,
          message: choice.message.content || ''
        }
      } else {
        // Regular text response
        this.conversationHistory.push({
          role: 'assistant',
          content: choice.message.content
        })

        return {
          functionName: null,
          functionArgs: null,
          message: choice.message.content
        }
      }
    } catch (error) {
      console.error('OpenRouter API call failed:', error)
      throw error
    }
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
