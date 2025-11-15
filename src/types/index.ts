// Core medical data types

export interface PatientDemographics {
  name?: string
  dateOfBirth?: string
  patientId?: string
  age?: number
  gender?: string
  contactNumber?: string
  address?: string
  confidence: number
}

export interface Medication {
  drugName: string
  dosage: string
  frequency: string
  duration?: string
  route?: string
  prescribedDate?: string
  confidence: number
}

export interface Diagnosis {
  condition: string
  icdCode?: string
  diagnosedDate?: string
  severity?: string
  notes?: string
  confidence: number
}

export interface LabResult {
  testName: string
  value: string
  unit: string
  referenceRange?: string
  testDate?: string
  status?: 'normal' | 'abnormal' | 'critical'
  confidence: number
}

export interface VitalSign {
  type: string
  value: string
  unit: string
  measuredDate?: string
  confidence: number
}

export interface PhysicianInfo {
  name?: string
  specialty?: string
  licenseNumber?: string
  contactInfo?: string
  confidence: number
}

// Extraction result structure
export interface ExtractionResult {
  documentId: string
  patientInfo?: PatientDemographics
  medications: Medication[]
  diagnoses: Diagnosis[]
  labResults: LabResult[]
  vitalSigns: VitalSign[]
  physicianInfo?: PhysicianInfo
  extractedAt: string
  processingTime: number
}

// Processing state types
export type ProcessingStage = 
  | 'uploading'
  | 'queued'
  | 'ocr'
  | 'analyzing'
  | 'extracting'
  | 'validating'
  | 'completed'
  | 'failed'

export interface ProcessingState {
  documentId: string
  stage: ProcessingStage
  progress: number
  estimatedTimeRemaining?: number
  currentActivity?: string
  error?: ProcessingError
}

export interface ProcessingError {
  code: string
  message: string
  details?: string
  retryable: boolean
  retryCount: number
}

// Activity log for real-time updates
export interface ActivityLogEntry {
  id: string
  timestamp: string
  type: 'info' | 'success' | 'warning' | 'error'
  stage: ProcessingStage
  message: string
  details?: any
}

// WebSocket event types
export interface WebSocketEvents {
  'processing:started': ProcessingState
  'processing:stage': ProcessingState
  'processing:activity': ActivityLogEntry
  'processing:item-extracted': {
    category: 'medication' | 'diagnosis' | 'labResult' | 'vitalSign'
    item: any
  }
  'processing:completed': ExtractionResult
  'processing:error': ProcessingError
}

// API request/response types
export interface UploadDocumentRequest {
  file: File
}

export interface UploadDocumentResponse {
  success: boolean
  documentId: string
  jobId: string
  queuePosition: number
  message: string
}

export interface GetExtractionResultResponse {
  success: boolean
  result?: ExtractionResult
  processing?: ProcessingState
  message: string
}

export interface ExportDataRequest {
  documentId: string
  format: 'json' | 'csv' | 'pdf'
}

export interface ExportDataResponse {
  success: boolean
  downloadUrl: string
  filename: string
  message: string
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: string
    validationErrors?: ValidationError[]
  }
}

// Document metadata
export interface DocumentMetadata {
  id: string
  filename: string
  fileSize: number
  fileType: string
  uploadedAt: string
  status: ProcessingStage
}

// Extracted item counts
export interface ExtractionCounts {
  medications: number
  diagnoses: number
  labResults: number
  vitalSigns: number
}
