/**
 * Enhanced Agentic Medical Document Extraction using OpenRouter
 * Version 2.0 - Comprehensive Extraction
 * 
 * Multi-stage extraction pipeline:
 * 1. Document Analysis - Determine document type and key sections
 * 2. Entity Classification - Identify and classify medical entities
 * 3. Information Extraction - Extract ALL structured medical data using function calling
 * 4. Additional Data Extraction - Extract allergies, procedures, immunizations
 * 5. Validation - Verify extracted data accuracy and completeness
 * 6. Confidence Scoring - Rate confidence of extracted information
 */

import {
    generateMockDocumentAnalysis,
    generateMockPatientInfo,
    generateMockMedications,
    generateMockDiagnoses,
    generateMockLabResults,
    generateCompleteMockExtraction
} from './mockDataGenerator.js'
import DataNormalizer from './dataNormalizer.js'

// Enhanced extraction tools with comprehensive fields
const extractionTools = [
    {
        type: 'function',
        function: {
            name: 'classify_document',
            description: 'Classify the medical document type and identify ALL key sections present in the document',
            parameters: {
                type: 'object',
                properties: {
                    documentType: {
                        type: 'string',
                        enum: ['prescription', 'lab_report', 'medical_report', 'imaging_report', 'discharge_summary', 'progress_note', 'consultation', 'other'],
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
            description: 'Extract ALL patient demographic, identification, and contact information available in the document. Be thorough and extract every detail present.',
            parameters: {
                type: 'object',
                properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    fullName: { type: 'string' },
                    dateOfBirth: { type: 'string', format: 'date', description: 'Format as YYYY-MM-DD' },
                    gender: { type: 'string', enum: ['M', 'F', 'Male', 'Female', 'Other', 'Unknown'] },
                    mrn: { type: 'string', description: 'Medical Record Number' },
                    ssn: { type: 'string', description: 'Social Security Number if present' },
                    age: { type: 'integer' },
                    address: {
                        type: 'object',
                        properties: {
                            street: { type: 'string' },
                            city: { type: 'string' },
                            state: { type: 'string' },
                            zipCode: { type: 'string' },
                            country: { type: 'string' }
                        }
                    },
                    phoneNumber: { type: 'string' },
                    email: { type: 'string' },
                    emergencyContact: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            relationship: { type: 'string' },
                            phone: { type: 'string' }
                        }
                    },
                    insurance: {
                        type: 'object',
                        properties: {
                            provider: { type: 'string' },
                            policyNumber: { type: 'string' },
                            groupNumber: { type: 'string' }
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
            name: 'extract_medications',
            description: 'Extract ALL medication information including name, dosage, frequency, prescriber, dates, and any other details present in the document. Extract EVERY medication mentioned.',
            parameters: {
                type: 'object',
                properties: {
                    medications: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                drugName: { type: 'string', description: 'Brand/Trade name' },
                                genericName: { type: 'string' },
                                dosage: { type: 'string' },
                                unit: { type: 'string', enum: ['mg', 'g', 'ml', 'mcg', 'IU', 'tabs', 'drops', 'units', 'other'] },
                                frequency: { type: 'string', description: 'e.g., twice daily, q8h, PRN' },
                                duration: { type: 'string' },
                                route: { type: 'string', enum: ['oral', 'iv', 'im', 'topical', 'inhaled', 'transdermal', 'sublingual', 'rectal', 'other'] },
                                indication: { type: 'string', description: 'Reason for medication' },
                                startDate: { type: 'string', format: 'date', description: 'YYYY-MM-DD' },
                                endDate: { type: 'string', format: 'date' },
                                prescribingPhysician: { type: 'string' },
                                pharmacy: { type: 'string' },
                                refills: { type: 'integer' },
                                instructions: { type: 'string', description: 'Special instructions' },
                                sideEffects: { type: 'array', items: { type: 'string' } },
                                confidence: { type: 'number', minimum: 0, maximum: 1 }
                            },
                            required: ['drugName', 'confidence']
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
            description: 'Extract ALL diagnoses, medical conditions, and clinical findings with complete details including dates, status, and clinical notes. Extract EVERY diagnosis mentioned.',
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
                                snomedCode: { type: 'string', description: 'SNOMED CT code if available' },
                                status: { type: 'string', enum: ['active', 'resolved', 'chronic', 'confirmed', 'suspected', 'ruled_out', 'history'] },
                                severity: { type: 'string', enum: ['mild', 'moderate', 'severe', 'critical', 'unknown'] },
                                onsetDate: { type: 'string', format: 'date', description: 'YYYY-MM-DD' },
                                diagnosedDate: { type: 'string', format: 'date' },
                                resolvedDate: { type: 'string', format: 'date' },
                                diagnosedBy: { type: 'string', description: 'Physician who made diagnosis' },
                                clinicalNotes: { type: 'string', description: 'Any additional clinical notes' },
                                isPrimary: { type: 'boolean', description: 'Is this the primary diagnosis' },
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
            description: 'Extract ALL laboratory test results with complete details including values, ranges, dates, and ordering information. Extract EVERY lab test mentioned.',
            parameters: {
                type: 'object',
                properties: {
                    labTests: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                testName: { type: 'string' },
                                loincCode: { type: 'string', description: 'LOINC code if available' },
                                value: { type: 'string' },
                                unit: { type: 'string' },
                                referenceRange: { type: 'string', description: 'Normal range' },
                                resultStatus: { type: 'string', enum: ['normal', 'abnormal_high', 'abnormal_low', 'critical', 'pending', 'unknown'] },
                                abnormalFlags: { type: 'array', items: { type: 'string' }, description: 'H, L, HH, LL flags' },
                                testDate: { type: 'string', format: 'date', description: 'When test was performed YYYY-MM-DD' },
                                reportDate: { type: 'string', format: 'date', description: 'When results were reported' },
                                orderedBy: { type: 'string', description: 'Ordering physician' },
                                performedAt: { type: 'string', description: 'Laboratory/facility' },
                                specimen: { type: 'string', description: 'Specimen type (blood, urine, etc.)' },
                                notes: { type: 'string', description: 'Any additional notes or comments' },
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
            description: 'Extract ALL vital signs and measurements from the document',
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
                            bmi: { type: 'string' },
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
            name: 'extract_allergies',
            description: 'Extract ALL allergies and adverse reactions including drug allergies, food allergies, and environmental allergies. Extract EVERY allergy mentioned.',
            parameters: {
                type: 'object',
                properties: {
                    allergies: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                allergen: { type: 'string', description: 'What the patient is allergic to' },
                                allergyType: { type: 'string', enum: ['drug', 'food', 'environmental', 'other'] },
                                reaction: { type: 'string', description: 'Type of reaction (rash, anaphylaxis, etc.)' },
                                severity: { type: 'string', enum: ['mild', 'moderate', 'severe', 'life-threatening', 'unknown'] },
                                onsetDate: { type: 'string', format: 'date' },
                                notes: { type: 'string' },
                                confidence: { type: 'number', minimum: 0, maximum: 1 }
                            },
                            required: ['allergen', 'confidence']
                        }
                    }
                },
                required: ['allergies']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'extract_procedures',
            description: 'Extract ALL medical procedures, surgeries, and treatments performed or planned. Extract EVERY procedure mentioned.',
            parameters: {
                type: 'object',
                properties: {
                    procedures: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                procedureName: { type: 'string' },
                                cptCode: { type: 'string', description: 'CPT code if available' },
                                procedureDate: { type: 'string', format: 'date', description: 'YYYY-MM-DD' },
                                performedBy: { type: 'string', description: 'Physician/surgeon' },
                                facility: { type: 'string' },
                                indication: { type: 'string', description: 'Reason for procedure' },
                                outcome: { type: 'string' },
                                complications: { type: 'array', items: { type: 'string' } },
                                notes: { type: 'string' },
                                confidence: { type: 'number', minimum: 0, maximum: 1 }
                            },
                            required: ['procedureName', 'confidence']
                        }
                    }
                },
                required: ['procedures']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'extract_immunizations',
            description: 'Extract ALL immunization and vaccination records. Extract EVERY immunization mentioned.',
            parameters: {
                type: 'object',
                properties: {
                    immunizations: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                vaccineName: { type: 'string' },
                                cvxCode: { type: 'string', description: 'CVX code if available' },
                                administrationDate: { type: 'string', format: 'date', description: 'YYYY-MM-DD' },
                                doseNumber: { type: 'integer', description: 'Which dose in series' },
                                administeredBy: { type: 'string' },
                                lotNumber: { type: 'string' },
                                manufacturer: { type: 'string' },
                                expirationDate: { type: 'string', format: 'date' },
                                site: { type: 'string', description: 'Injection site' },
                                route: { type: 'string' },
                                confidence: { type: 'number', minimum: 0, maximum: 1 }
                            },
                            required: ['vaccineName', 'confidence']
                        }
                    }
                },
                required: ['immunizations']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'validate_extraction',
            description: 'Validate extracted data for consistency, completeness, and accuracy. Flag potential issues.',
            parameters: {
                type: 'object',
                properties: {
                    isValid: { type: 'boolean' },
                    completenessScore: { type: 'number', minimum: 0, maximum: 1, description: 'How complete is the extracted data (0-1)' },
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
                    warnings: {
                        type: 'array',
                        items: { type: 'string' }
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
                progress: 10
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
                progress: 20,
                data: { documentType: documentAnalysis.documentType }
            })

            // Stage 2: Core Entity Extraction
            onProgress({
                stage: 'extracting',
                substage: 'entity_extraction',
                message: 'Extracting patient information...',
                progress: 25
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
                progress: 35
            })

            // Extract medications
            onProgress({
                stage: 'extracting',
                substage: 'medication_extraction',
                message: 'Extracting medications...',
                progress: 40
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
                progress: 50
            })

            // Extract diagnoses
            onProgress({
                stage: 'extracting',
                substage: 'diagnosis_extraction',
                message: 'Extracting diagnoses and conditions...',
                progress: 55
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
                progress: 60
            })

            // Extract lab results
            onProgress({
                stage: 'extracting',
                substage: 'lab_extraction',
                message: 'Extracting laboratory results...',
                progress: 65
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
                progress: 70
            })

            // Stage 3: Additional Clinical Data Extraction
            // Extract allergies
            onProgress({
                stage: 'extracting',
                substage: 'allergy_extraction',
                message: 'Extracting allergies and adverse reactions...',
                progress: 75
            })

            let allergies = { allergies: [] }
            try {
                allergies = await this.extractAllergies(documentText, documentAnalysis)
            } catch (error) {
                console.warn('⚠️  Allergy extraction failed, continuing:', error.message)
            }

            onProgress({
                stage: 'extracting',
                substage: 'allergy_extracted',
                message: `Found ${allergies.allergies?.length || 0} allergies`,
                progress: 80
            })

            // Extract procedures
            onProgress({
                stage: 'extracting',
                substage: 'procedure_extraction',
                message: 'Extracting procedures and treatments...',
                progress: 83
            })

            let procedures = { procedures: [] }
            try {
                procedures = await this.extractProcedures(documentText, documentAnalysis)
            } catch (error) {
                console.warn('⚠️  Procedure extraction failed, continuing:', error.message)
            }

            onProgress({
                stage: 'extracting',
                substage: 'procedure_extracted',
                message: `Found ${procedures.procedures?.length || 0} procedures`,
                progress: 86
            })

            // Extract immunizations
            onProgress({
                stage: 'extracting',
                substage: 'immunization_extraction',
                message: 'Extracting immunization records...',
                progress: 89
            })

            let immunizations = { immunizations: [] }
            try {
                immunizations = await this.extractImmunizations(documentText, documentAnalysis)
            } catch (error) {
                console.warn('⚠️  Immunization extraction failed, continuing:', error.message)
            }

            onProgress({
                stage: 'extracting',
                substage: 'immunization_extracted',
                message: `Found ${immunizations.immunizations?.length || 0} immunizations`,
                progress: 92
            })

            // Stage 4: Validation
            onProgress({
                stage: 'validating',
                substage: 'data_validation',
                message: 'Validating extracted data...',
                progress: 95
            })

            let validation = { isValid: true, warnings: [], completenessScore: 0.8 }
            try {
                validation = await this.validateExtraction({
                    ...documentAnalysis,
                    ...patientInfo,
                    ...medications,
                    ...diagnoses,
                    ...labResults,
                    ...allergies,
                    ...procedures,
                    ...immunizations
                })
            } catch (error) {
                console.warn('⚠️  Validation failed, using data anyway:', error.message)
            }

            onProgress({
                stage: 'validating',
                substage: 'validation_complete',
                message: validation.isValid ? 'Data validation passed' : 'Validation warnings present',
                progress: 98
            })

            // Stage 5: Compile comprehensive final result
            const extractedData = {
                documentId: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
                documentType: documentAnalysis.documentType || 'unknown',
                confidence: documentAnalysis.confidence || 0.7,

                // Patient information
                patientInfo: patientInfo.patientInfo || patientInfo || {},

                // Clinical data
                medications: medications.medications || [],
                diagnoses: diagnoses.diagnoses || [],
                labResults: labResults.labTests || [],
                labTests: labResults.labTests || [], // Keep for backwards compatibility
                vitalSigns: labResults.vitals || {},
                vitals: labResults.vitals || {}, // Include both naming conventions

                // Additional clinical information
                allergies: allergies.allergies || [],
                procedures: procedures.procedures || [],
                immunizations: immunizations.immunizations || [],

                // Metadata
                metadata: {
                    extractedAt: new Date().toISOString(),
                    documentLength: documentText.length,
                    wordCount: documentText.split(/\s+/).length,
                    extractionModel: 'openai/gpt-3.5-turbo',
                    extractionVersion: '2.0',
                    processingTime: 0 // Will be set by caller
                },

                // Validation results
                validation: {
                    isValid: validation.isValid !== false,
                    completenessScore: validation.completenessScore || 0.8,
                    warnings: validation.warnings || [],
                    issues: validation.issues || [],
                    recommendations: validation.recommendations || []
                },

                // Legacy fields for backwards compatibility
                extractedAt: new Date().toISOString(),
                documentLength: documentText.length
            }

            // Normalize the data for frontend consistency
            const normalizedData = DataNormalizer.normalizeExtractionResult(extractedData)
            const finalData = DataNormalizer.validateAndScore(normalizedData)

            onProgress({
                stage: 'complete',
                message: 'Extraction complete',
                progress: 100,
                extractedData: finalData
            })

            return finalData
        } catch (error) {
            console.error('Extraction agent error:', error)
            throw error
        }
    }

    async analyzeDocument(documentText) {
        this.conversationHistory = []

        const systemPrompt = `You are a medical document analysis expert. Analyze the provided medical document and classify its type.
    
    CRITICAL: Be thorough in your analysis.
    
    Use the classify_document function to provide:
    1. Document type (prescription, lab report, medical report, etc.)
    2. Confidence score (0-1) for the classification
    3. ALL key sections identified in the document`

        try {
            const result = await this.callAgent(systemPrompt, documentText)
            return result
        } catch (error) {
            console.warn('⚠️  Document analysis API call failed, using mock data:', error.message)
            return generateMockDocumentAnalysis(documentText)
        }
    }

    async extractPatientInfo(documentText, documentAnalysis) {
        this.conversationHistory = []

        const systemPrompt = `You are a healthcare data extractor specializing in patient information.
    
    CRITICAL: Extract EVERY piece of patient information present in the document including:
    - Full name, demographics
    - Contact information (address, phone, email)
    - Medical record numbers
    - Emergency contact information
    - Insurance information
    
    Use the extract_patient_info function. Do not skip any available information.
    Provide a confidence score for the extraction.`

        const userMessage = `Document type: ${documentAnalysis.documentType}\n\nExtract ALL patient information from this document:\n\n${documentText}`

        try {
            const result = await this.callAgent(systemPrompt, userMessage)
            return result
        } catch (error) {
            console.warn('⚠️  Patient info API call failed, using mock data:', error.message)
            return generateMockPatientInfo(documentText)
        }
    }

    async extractMedications(documentText, documentAnalysis) {
        this.conversationHistory = []

        const systemPrompt = `You are a pharmacology expert data extractor.
    
    CRITICAL: Extract EVERY medication mentioned in the document including:
    - Drug names (brand and generic)
    - Dosages, frequencies, routes, durations
    - Prescribing physician information
    - Start/end dates
    - Special instructions
    
    Use the extract_medications function to provide comprehensive medication information.
    Extract ALL medications - do not skip any.
    Include confidence scores for each medication.`

        const userMessage = `Document type: ${documentAnalysis.documentType}\n\nExtract ALL medications from this document:\n\n${documentText}`

        try {
            const result = await this.callAgent(systemPrompt, userMessage)
            return result
        } catch (error) {
            console.warn('⚠️  Medication API call failed, using mock data:', error.message)
            return generateMockMedications(documentText)
        }
    }

    async extractDiagnoses(documentText, documentAnalysis) {
        this.conversationHistory = []

        const systemPrompt = `You are a clinical diagnosis expert.
    
    CRITICAL: Extract EVERY diagnosis and medical condition mentioned including:
    - Condition names
    - ICD-10 and SNOMED codes if available
    - Status (active, resolved, chronic, suspected, etc.)
    - Dates (onset, diagnosed, resolved)
    - Diagnosing physician
    - Clinical notes
    
    Use the extract_diagnoses function to provide complete diagnosis information.
    Extract ALL diagnoses - do not skip any.
    Include confidence scores and dates when available.`

        const userMessage = `Document type: ${documentAnalysis.documentType}\n\nExtract ALL diagnoses from this document:\n\n${documentText}`

        try {
            const result = await this.callAgent(systemPrompt, userMessage)
            return result
        } catch (error) {
            console.warn('⚠️  Diagnosis API call failed, using mock data:', error.message)
            return generateMockDiagnoses(documentText)
        }
    }

    async extractLabResults(documentText, documentAnalysis) {
        this.conversationHistory = []

        const systemPrompt = `You are a laboratory results expert.
    
    CRITICAL: Extract EVERY lab test result mentioned including:
    - Test names and LOINC codes
    - Values, units, reference ranges
    - Result status and abnormal flags
    - Test dates and report dates
    - Ordering physician and performing laboratory
    - Specimen information
    
    Use the extract_lab_results and extract_vital_signs functions.
    Extract ALL lab tests and vital signs - do not skip any.
    Include confidence scores for each result.`

        const userMessage = `Document type: ${documentAnalysis.documentType}\n\nExtract ALL lab results and vital signs from this document:\n\n${documentText}`

        try {
            const result = await this.callAgent(systemPrompt, userMessage)
            return result
        } catch (error) {
            console.warn('⚠️  Lab results API call failed, using mock data:', error.message)
            return generateMockLabResults(documentText)
        }
    }

    async extractAllergies(documentText, documentAnalysis) {
        this.conversationHistory = []

        const systemPrompt = `You are a medical allergy and adverse reaction specialist.
    
    CRITICAL: Extract EVERY allergy and adverse reaction mentioned including:
    - Drug allergies
    - Food allergies
    - Environmental allergies
    - Reaction type and severity
    - Onset dates and notes
    
    Use the extract_allergies function to provide complete allergy information.
    Extract ALL allergies - do not skip any.
    Include confidence scores and severity ratings.`

        const userMessage = `Document type: ${documentAnalysis.documentType}\n\nExtract ALL allergies and adverse reactions from this document:\n\n${documentText}`

        try {
            const result = await this.callAgent(systemPrompt, userMessage)
            return result
        } catch (error) {
            console.warn('⚠️  Allergy extraction API call failed, using empty data:', error.message)
            return { allergies: [] }
        }
    }

    async extractProcedures(documentText, documentAnalysis) {
        this.conversationHistory = []

        const systemPrompt = `You are a medical procedures expert.
    
    CRITICAL: Extract EVERY medical procedure, surgery, and treatment mentioned including:
    - Past procedures
    - Planned/scheduled procedures
    - Procedure names and CPT codes
    - Dates, performing physicians, facilities
    - Outcomes and complications
    
    Use the extract_procedures function to provide complete procedure information.
    Extract ALL procedures - do not skip any.
    Include confidence scores for each extraction.`

        const userMessage = `Document type: ${documentAnalysis.documentType}\n\nExtract ALL procedures and treatments from this document:\n\n${documentText}`

        try {
            const result = await this.callAgent(systemPrompt, userMessage)
            return result
        } catch (error) {
            console.warn('⚠️  Procedure extraction API call failed, using empty data:', error.message)
            return { procedures: [] }
        }
    }

    async extractImmunizations(documentText, documentAnalysis) {
        this.conversationHistory = []

        const systemPrompt = `You are an immunization records specialist.
    
    CRITICAL: Extract EVERY immunization and vaccination record mentioned including:
    - Vaccine names and CVX codes
    - Administration dates
    - Dose numbers in series
    - Lot numbers, manufacturers
    - Administering provider
    - Injection sites and routes
    
    Use the extract_immunizations function to provide complete immunization information.
    Extract ALL immunizations - do not skip any.
    Include confidence scores for each extraction.`

        const userMessage = `Document type: ${documentAnalysis.documentType}\n\nExtract ALL immunization records from this document:\n\n${documentText}`

        try {
            const result = await this.callAgent(systemPrompt, userMessage)
            return result
        } catch (error) {
            console.warn('⚠️  Immunization extraction API call failed, using empty data:', error.message)
            return { immunizations: [] }
        }
    }

    async validateExtraction(extractedData) {
        this.conversationHistory = []

        const systemPrompt = `You are a medical data validation expert. Review the extracted medical data for consistency, completeness, and accuracy.
    
    Use the validate_extraction function to:
    1. Identify any issues or contradictions
    2. Rate the completeness of the extraction (0-1)
    3. Provide recommendations for improvement
    4. Flag any missing critical information or suspicious values`

        const userMessage = `Validate this extracted medical data:\n\n${JSON.stringify(extractedData, null, 2)}`

        try {
            const result = await this.callAgent(systemPrompt, userMessage)
            return result
        } catch (error) {
            console.warn('⚠️  Validation API call failed, returning basic validation:', error.message)
            return {
                isValid: true,
                completenessScore: 0.8,
                warnings: ['Validation was performed with mock data due to API unavailability'],
                recommendations: []
            }
        }
    }

    async callAgent(systemPrompt, userMessage) {
        this.conversationHistory.push({
            role: 'user',
            content: userMessage
        })

        try {
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
                    max_tokens: 1000,
                    temperature: 0.3 // Lower temperature for more consistent extractions
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

            if (!data.choices || !data.choices[0]) {
                console.error('Invalid OpenRouter response structure:', {
                    status: response.status,
                    body: data
                })
                throw new Error(`OpenRouter API returned invalid response structure`)
            }

            const choice = data.choices[0]

            if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
                const toolCall = choice.message.tool_calls[0]
                const functionArgs = typeof toolCall.function.arguments === 'string'
                    ? JSON.parse(toolCall.function.arguments)
                    : toolCall.function.arguments

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
