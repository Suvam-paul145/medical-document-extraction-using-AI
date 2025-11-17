# Intelligent Data Gateway System

## Overview

The **Intelligent Data Gateway** is a sophisticated system that automatically detects, validates, transforms, and exports medical document extraction data in multiple formats. It intelligently manages data storage with automatic ID generation, schema detection, and format conversion.

## Key Features

### 1. **Automatic Content Type Detection**
- Analyzes document structure to determine content type
- Detects: `prescription`, `lab_report`, `medical_report`, `patient_record`, `vital_signs`, `general_medical_document`
- Uses heuristics based on data presence (patient info, medications, diagnoses, lab results, vitals)

### 2. **Intelligent ID Generation**
- Auto-generates unique storage IDs with format: `doc_{documentId}_{timestamp}_{hash}`
- Includes content hash for integrity verification
- Tracks content type and document relationships

### 3. **Auto-Schema Generation**
- Introspects data structure automatically
- Generates schemas with field types, nested objects, and arrays
- Validates data against generated schema
- Detects missing critical fields

### 4. **Data Normalization & Validation**
- Normalizes inconsistent data structures
- Validates confidence scores and data quality
- Generates warnings for low-confidence extractions
- Ensures array fields consistency

### 5. **Multi-Format Export**
- **JSON**: Structured, comprehensive export
- **CSV**: Flat, spreadsheet-compatible format
- **XML**: Hierarchical, machine-readable format
- **HTML**: Beautiful, web-viewable reports with tables and sections
- **Table**: Organized sections for frontend display

### 6. **Smart Frontend Display**
- Automatic format detection and display
- Responsive table views with confidence badges
- Syntax-highlighted code views
- Interactive format switching
- One-click export to multiple formats

## Architecture

```
Request
  ↓
DataGateway.storeData()
  ├─ Detect content type
  ├─ Generate intelligent ID
  ├─ Generate schema
  ├─ Validate content
  ├─ Normalize structure
  └─ Store in memory map
  
Response
  ↓
DataGateway.retrieveData()
  ├─ Lookup by document ID
  ├─ Convert to requested format
  ├─ Return with metadata
  └─ Cache for performance
```

## Usage Examples

### Backend: Storing Data

```javascript
import dataGateway from './services/dataGateway.js'

const extractedData = {
  documentType: 'prescription',
  patient: { patientInfo: { ... } },
  medications: [ ... ],
  diagnoses: [ ... ],
  labTests: [ ... ],
  vitals: { ... }
}

const result = dataGateway.storeData(documentId, extractedData, {
  filename: 'document.pdf',
  fileType: 'application/pdf'
})

// Result includes:
// {
//   success: true,
//   storageId: 'doc_abc123_1234567890_f5a3b2c1',
//   contentType: 'prescription',
//   schema: { ... },
//   validation: { isValid: true, warnings: [] }
// }
```

### Backend: Retrieving Data

```javascript
// Get as JSON
const jsonResult = dataGateway.retrieveData(documentId, 'json')

// Get as CSV
const csvResult = dataGateway.retrieveData(documentId, 'csv')

// Get as HTML report
const htmlResult = dataGateway.retrieveData(documentId, 'html')

// Get as formatted table for frontend
const tableResult = dataGateway.retrieveData(documentId, 'table')
```

### API Endpoints

#### Store Result
```bash
POST /api/documents/upload
Content-Type: multipart/form-data

Result:
{
  "success": true,
  "documentId": "uuid",
  "message": "Document queued for processing"
}
```

#### Retrieve Result (JSON format)
```bash
GET /api/documents/{documentId}/result?format=json

Response:
{
  "success": true,
  "documentId": "...",
  "storageId": "doc_xxx_yyy_zzz",
  "contentType": "prescription",
  "format": "json",
  "data": "{ ... JSON string ... }",
  "metadata": { ... }
}
```

#### Retrieve Formatted Result (for frontend display)
```bash
GET /api/documents/{documentId}/formatted?format=table

Response:
{
  "success": true,
  "data": {
    "sections": [
      {
        "title": "Patient Information",
        "type": "patient",
        "data": [ ... ]
      },
      {
        "title": "Medications",
        "type": "medications",
        "columns": ["name", "dosage", "frequency", ...],
        "data": [ ... ]
      },
      ...
    ]
  }
}
```

#### Export Document
```bash
GET /api/export/{documentId}?format=csv

Response: CSV file download
```

#### Get All Results
```bash
GET /api/documents?format=json

Response:
{
  "success": true,
  "stats": {
    "totalDocuments": 5,
    "totalStorage": 5,
    "contentTypes": {
      "prescription": 2,
      "lab_report": 2,
      "medical_report": 1
    }
  },
  "results": [ ... ]
}
```

## Content Type Detection

### Prescription
- Contains medications
- May contain patient info
- Usually no diagnoses or lab results

```
Detection: medications.length > 0 && !diagnoses && !labTests
```

### Lab Report
- Contains lab test results
- May contain patient info
- Usually no medications or diagnoses

```
Detection: labTests.length > 0 && !medications && !diagnoses
```

### Medical Report
- Contains patient info and diagnoses
- May contain medications and lab tests
- Comprehensive patient record

```
Detection: diagnoses.length > 0 && patient
```

### Vital Signs
- Contains vital measurements
- Blood pressure, heart rate, temperature, etc.

```
Detection: vitals object present
```

### Patient Record
- Contains patient demographic information
- May contain other data

```
Detection: patient.patientInfo present
```

## Data Format Transformations

### JSON Format
Complete, nested JSON representation of all data
```json
{
  "documentType": "prescription",
  "confidence": 0.92,
  "patient": { ... },
  "medications": [ ... ],
  "diagnoses": [ ... ],
  "labTests": [ ... ],
  "vitals": { ... }
}
```

### CSV Format
Flattened key-value pairs
```
patient.firstName,patient.lastName,medication.name,medication.dosage,...
John,Doe,Aspirin,500,...
```

### XML Format
Hierarchical XML structure
```xml
<?xml version="1.0"?>
<root>
  <documentType>prescription</documentType>
  <patient>
    <patientInfo>
      <firstName>John</firstName>
      ...
    </patientInfo>
  </patient>
  <medications>
    <item>...</item>
  </medications>
</root>
```

### HTML Format
Beautiful, styled HTML report with:
- Patient information card
- Medication table
- Diagnosis table
- Lab results table
- Vital signs display
- Color-coded confidence badges

### Table Format
Organized sections for frontend display:
```javascript
{
  "sections": [
    {
      "title": "Patient Information",
      "type": "patient",
      "data": [ { firstName, lastName, age, ... } ]
    },
    {
      "title": "Medications",
      "type": "medications",
      "columns": ["name", "dosage", "frequency", "confidence"],
      "data": [ { name, dosage, frequency, confidence } ]
    }
  ]
}
```

## Schema Generation Example

When storing prescription data, the gateway generates:

```javascript
{
  "version": "1.0",
  "contentType": "prescription",
  "fields": {
    "documentType": { type: "string", value: "prescription" },
    "confidence": { type: "number", value: 0.92 },
    "patient.patientInfo.firstName": { type: "string" },
    "patient.patientInfo.lastName": { type: "string" },
    ...
  },
  "nested": {
    "patient": { type: "object", keys: ["patientInfo"] },
    "patient.patientInfo": { type: "object", keys: ["firstName", ...] }
  },
  "arrays": {
    "medications": {
      type: "array",
      itemCount: 2,
      itemType: "object",
      sample: { name: "Aspirin", dosage: "500", ... }
    }
  }
}
```

## Validation Rules

1. **Required Fields**: Patient info, at least one data category
2. **Confidence Check**: Warnings for confidence < 0.5
3. **Data Quality**: Identifies missing critical information
4. **Consistency**: Detects contradictions in data
5. **Completeness**: Rates extraction completeness

## Performance Considerations

- **In-Memory Storage**: Suitable for demo/testing (up to ~100 documents)
- **Caching**: Stores parsed results to avoid re-computation
- **Lazy Loading**: Formats generated only when requested
- **Streaming**: HTML reports generated on-demand
- **Scalability**: Ready for database backend with minimal changes

## Frontend Integration

### Display Results Component
```tsx
import ResultsDisplay from './components/ResultsDisplay'

<ResultsDisplay 
  documentId={docId}
  result={extractionResult}
  onClose={() => setShowResults(false)}
/>
```

### Features
- Format selector buttons (Table, JSON, CSV, HTML, XML)
- Export buttons for each format
- Interactive table views with sorting
- Code syntax highlighting
- Responsive design
- Error handling and loading states

## Testing

Run the test script:
```bash
node test-gateway.js
```

Tests:
1. ✅ Prescription data storage and type detection
2. ✅ Medical report storage with diagnoses
3. ✅ JSON format retrieval
4. ✅ CSV format conversion
5. ✅ HTML report generation
6. ✅ Table format for frontend display
7. ✅ Gateway statistics and monitoring
8. ✅ Document management operations

## Future Enhancements

1. **Database Backend**: Replace in-memory storage with persistent database
2. **Advanced Caching**: Redis caching layer for distributed systems
3. **Batch Processing**: Process multiple documents in parallel
4. **Custom Schemas**: User-defined schema templates
5. **Format Plugins**: Extensible format conversion system
6. **Data Encryption**: Secure storage of sensitive medical data
7. **Audit Logging**: Track all data access and modifications
8. **API Versioning**: Support multiple API versions

## API Health Check

```bash
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2024-11-17T10:30:00Z",
  "dataGateway": {
    "documents": 5,
    "formats": ["json", "csv", "xml", "html", "table"],
    "contentTypes": ["prescription", "lab_report", "medical_report"]
  }
}
```

## Troubleshooting

### "Document not found" Error
- Document may still be processing
- Check processing status first: `GET /api/documents/{docId}/status`

### Format Conversion Error
- Ensure data is complete before exporting
- Check data validation: included in retrieval response

### Export File Empty
- Verify document processing completed successfully
- Check format parameter is valid

### Memory Issues (with many documents)
- Consider database backend
- Implement data archival strategy
- Use streaming for large exports

## Security Considerations

1. **Data Validation**: All input is validated before storage
2. **ID Isolation**: Document IDs are UUID-based
3. **Format Escaping**: XML/HTML properly escapes special characters
4. **Type Safety**: Data types validated against schema
5. **Access Control**: Integrate with authentication/authorization layer

## Support

For issues or questions:
1. Check test-gateway.js for usage examples
2. Review backend logs for detailed error messages
3. Verify document processing completed successfully
4. Check API response for validation warnings
