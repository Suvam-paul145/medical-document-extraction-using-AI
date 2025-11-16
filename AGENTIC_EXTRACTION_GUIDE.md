# 🤖 Agentic Medical Document Extraction - Complete Guide

## Overview

The MedExtract system now features an **intelligent agentic extraction pipeline** that uses OpenAI's function-calling capabilities to analyze and extract structured medical data from documents with high accuracy and real-time processing visibility.

## Architecture

### Multi-Stage Agentic Pipeline

```
INPUT (Medical Document)
        ↓
    [Stage 1: OCR/Text Extraction]
        ↓
    [Stage 2: Document Analysis] ← Agent classifies document type
        ↓
    [Stage 3: Entity Extraction] ← Agent extracts with confidence scoring
        ├─ Patient Information
        ├─ Medications
        ├─ Diagnoses
        ├─ Lab Results
        └─ Vital Signs
        ↓
    [Stage 4: Validation] ← Agent validates data consistency
        ↓
    [Stage 5: Confidence Scoring] ← Agent rates extraction quality
        ↓
OUTPUT (Structured Medical Data)
```

## Supported Document Types

The agent automatically detects and processes:

- 💊 **Prescriptions** - Medication lists with dosages and frequencies
- 🧪 **Lab Reports** - Test results with normal/abnormal flags
- 📋 **Medical Reports** - Clinical findings and assessments
- 🖼️ **Imaging Reports** - Radiology and imaging interpretations
- 📤 **Discharge Summaries** - Hospital discharge documentation
- 📝 **Progress Notes** - Clinical progress and observations
- 📄 **General Documents** - Any medical text document

## Core Components

### 1. Backend: `extractionAgent.js`

**Location:** `backend/services/extractionAgent.js`

**Key Class:** `MedicalExtractionAgent`

```javascript
const agent = new MedicalExtractionAgent(apiKey)

const extractedData = await agent.extractMedicalData(
  documentText, 
  (progress) => {
    console.log(`${progress.stage}: ${progress.message}`)
  }
)
```

**OpenAI Tools (Function Calls):**

1. **`classify_document`** - Identifies document type and sections
2. **`extract_patient_info`** - Extracts demographic data
3. **`extract_medications`** - Extracts drug information
4. **`extract_diagnoses`** - Extracts medical conditions
5. **`extract_lab_results`** - Extracts test values
6. **`extract_vital_signs`** - Extracts vital measurements
7. **`validate_extraction`** - Validates extracted data

### 2. Frontend: `AgentProcessing.tsx` Component

**Location:** `src/components/AgentProcessing.tsx`

Real-time visualization of the agentic extraction process:

```tsx
<AgentProcessing
  isProcessing={isProcessing}
  currentStage={agentProgress}
  extractedItems={extractedItems}
/>
```

**Features:**
- ✅ Stage-by-stage progress visualization
- 🎯 Document type detection with confidence
- 📊 Real-time extracted items display
- 🎨 Animated stage transitions
- 📈 Confidence score display for each item

### 3. Updated: `extraction.js`

**Location:** `backend/services/extraction.js`

Now uses `MedicalExtractionAgent` for intelligent extraction:

```javascript
const agent = new MedicalExtractionAgent(apiKey)

const result = await agent.extractMedicalData(
  documentText,
  (agentProgress) => {
    onProgress({
      documentId: doc.id,
      stage: agentProgress.stage,
      progress: agentProgress.progress,
      currentActivity: agentProgress.message
    })
  }
)
```

## Processing Stages

### Stage 1: Text Extraction (OCR)
- **Progress:** 10-40%
- **Action:** Extracts text from PDF or image
- **Output:** Raw document text

### Stage 2: Document Analysis
- **Progress:** 40-50%
- **Agent Action:** Classifies document type
- **Detects:**
  - Document category (prescription, report, etc.)
  - Key sections (patient info, findings, etc.)
  - Confidence score for classification
- **Output:** Document type, sections, confidence

### Stage 3: Information Extraction
- **Progress:** 50-85%
- **Agent Actions:**
  1. Extract patient demographics
  2. Extract medications with dosages
  3. Extract diagnoses and conditions
  4. Extract lab results and vitals
- **Output:** Structured medical entities

### Stage 4: Data Validation
- **Progress:** 85-95%
- **Agent Action:** Validates data consistency
- **Checks:**
  - Data field consistency
  - Normal vs abnormal values
  - Missing critical information
  - Conflicting data
- **Output:** Validation report, recommendations

### Stage 5: Completion
- **Progress:** 95-100%
- **Output:** Final extracted data with confidence scores

## Data Output Format

```typescript
interface ExtractedMedicalData {
  documentType: string              // 'prescription' | 'lab_report' | etc
  confidence: number               // 0-1 confidence score
  patient: {
    firstName?: string
    lastName?: string
    dateOfBirth?: string
    gender?: 'M' | 'F' | 'Other' | 'Unknown'
    mrn?: string
    age?: number
    confidence: number
  }
  medications: Array<{
    name: string
    dosage?: string
    unit?: string
    frequency?: string
    duration?: string
    route?: 'oral' | 'iv' | 'im' | 'topical' | 'inhaled' | 'transdermal'
    indication?: string
    confidence: number
  }>
  diagnoses: Array<{
    condition: string
    icdCode?: string
    status: 'confirmed' | 'suspected' | 'ruled_out' | 'history'
    severity?: 'mild' | 'moderate' | 'severe' | 'unknown'
    onsetDate?: string
    confidence: number
  }>
  labTests: Array<{
    testName: string
    value?: string
    unit?: string
    referenceRange?: string
    resultStatus: 'normal' | 'abnormal_high' | 'abnormal_low' | 'critical' | 'unknown'
    testDate?: string
    confidence: number
  }>
  vitals?: {
    temperature?: string
    bloodPressure?: string
    heartRate?: string
    respiratoryRate?: string
    oxygenSaturation?: string
    weight?: string
    height?: string
    timestamp?: string
  }
  validation: {
    isValid: boolean
    issues?: Array<{
      severity: 'info' | 'warning' | 'error'
      message: string
      field: string
    }>
    recommendations?: string[]
  }
  extractedAt: string              // ISO timestamp
  documentLength: number            // characters
}
```

## Confidence Scoring

Each extracted item includes a **confidence score (0-1)**:

- **0.9-1.0** 🟢 Very High - Clear, unambiguous data
- **0.7-0.9** 🟡 High - Standard extraction quality
- **0.5-0.7** 🟠 Medium - Some ambiguity or context needed
- **0.0-0.5** 🔴 Low - Uncertain extraction, manual review recommended

## Real-Time Progress Updates

The agent emits progress events via WebSocket:

```javascript
// Backend emits these events:
onProgress({
  stage: 'analyzing',           // current stage name
  substage: 'document_analysis', // specific substage
  message: 'Analyzing document...',
  progress: 35,                 // 0-100%
  data: {
    documentType: 'prescription'
  }
})
```

## UI Integration

### ProcessingView Component
Shows real-time extraction progress with:
- 📍 Stage timeline visualization
- 📊 Live extracted items counter
- 🎯 Document type badge
- ⏳ Confidence scores

### AgentProcessing Component
Dedicated agentic visualization:
- Multi-stage pipeline animation
- Extracted items display grid
- Real-time updates
- Confidence indicators

## Usage Example

```javascript
// Backend
import { MedicalExtractionAgent } from './extractionAgent.js'

const agent = new MedicalExtractionAgent(apiKey)

const result = await agent.extractMedicalData(
  documentText,
  (progress) => {
    console.log(`${progress.stage}: ${progress.message} (${progress.progress}%)`)
    io.emit('extraction:progress', progress)
  }
)

console.log(`Found ${result.medications.length} medications`)
console.log(`Found ${result.diagnoses.length} diagnoses`)
```

```typescript
// Frontend
const [extractedData, setExtractedData] = useState(null)
const [currentStage, setCurrentStage] = useState(null)

useEffect(() => {
  websocket.on('extraction:progress', (progress) => {
    setCurrentStage(progress)
  })
}, [])
```

## Error Handling

### API Key Required
```
Error: OpenAI API key is required for agentic extraction
```
→ Solution: Configure API key in Settings modal

### Insufficient Text
```
Error: Could not extract sufficient text from document
```
→ Solution: Verify document quality or try a clearer image

### Model Unavailable
```
Error: gpt-4-turbo-preview not available
```
→ Solution: Ensure your OpenAI plan includes GPT-4 access

## Performance Characteristics

| Metric | Value |
|--------|-------|
| **Average Processing Time** | 15-30 seconds |
| **Text Extraction** | 5-10 seconds |
| **Agent Analysis** | 8-15 seconds |
| **Validation** | 2-5 seconds |
| **Max Document Size** | 10MB |
| **Max Text Length** | ~100,000 characters |

## Testing the Agent

### Test Scenarios

1. **Prescription Document**
   - Upload a prescription image/PDF
   - Verify medications extracted with dosages
   - Check confidence scores

2. **Lab Report**
   - Upload lab results
   - Verify test names and values
   - Check abnormal flagging

3. **Medical Report**
   - Upload clinical report
   - Verify diagnoses extracted
   - Check severity assessment

4. **Mixed Document**
   - Upload document with multiple data types
   - Verify all categories extracted
   - Check validation warnings if any

### Sample Test Command

```bash
# Test via API
curl -X POST http://localhost:5000/api/upload \
  -F "file=@sample_prescription.pdf" \
  -F "apiKey=sk-your-key-here"
```

## Advanced Features

### Document Section Detection
Agent identifies and extracts relevant sections:
- Patient demographics section
- Medications section
- Findings/Assessment section
- Lab results section

### Validation & Quality Assurance
Agent checks for:
- Missing critical fields
- Data inconsistencies
- Value anomalies
- Conflicting information

### Recommended Corrections
Agent suggests:
- Missing fields to review
- Unclear values for manual verification
- Data conflicts to resolve

## API Reference

### MedicalExtractionAgent Class

```javascript
// Constructor
const agent = new MedicalExtractionAgent(apiKey)

// Main Method
await agent.extractMedicalData(documentText, onProgress)

// Individual Methods
await agent.analyzeDocument(text)
await agent.extractPatientInfo(text, analysis)
await agent.extractMedications(text, analysis)
await agent.extractDiagnoses(text, analysis)
await agent.extractLabResults(text, analysis)
await agent.validateExtraction(extractedData)
```

## Troubleshooting

### Agent not responding
→ Check OpenAI API key validity
→ Verify network connectivity
→ Check API rate limits

### Incomplete extractions
→ Document quality may be poor
→ Try a clearer image
→ Verify document type is supported

### Confidence scores too low
→ Document may be ambiguous or unclear
→ Manual review of flagged items recommended
→ Consider document clarity improvement

## Future Enhancements

- 🔮 Multi-language support (Spanish, French, German)
- 📚 Custom extraction templates for specialized documents
- 🎓 Fine-tuning for specific hospital/clinic formats
- ⚡ Batch processing for multiple documents
- 🔄 Automatic retry with temperature adjustment
- 💾 Extraction history and audit trail
- 🤝 Manual correction feedback loop

## Best Practices

1. **Document Quality**
   - Use clear, legible documents
   - Ensure good lighting for photos
   - Use high-resolution images
   - Avoid skewed/rotated documents

2. **API Usage**
   - Monitor token usage
   - Consider GPT-4 for complex documents
   - Cache large documents
   - Batch process when possible

3. **Data Validation**
   - Always review low-confidence extractions
   - Validate sensitive medical data
   - Cross-check diagnoses and medications
   - Check normality/abnormality flags

4. **Performance**
   - Monitor extraction times
   - Optimize document pre-processing
   - Use WebSocket for real-time updates
   - Implement proper error handling

## Support & Resources

- 📖 Full SETUP.md for installation details
- 📚 README.md for overview
- 💻 Backend services in `backend/services/`
- 🎨 Components in `src/components/`
- 🧪 Sample test documents in `uploads/`

---

**Version:** 1.0  
**Last Updated:** November 2025  
**Status:** Production Ready
