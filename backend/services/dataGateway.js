/**
 * Intelligent Data Gateway
 * 
 * Automatically:
 * - Detects data format requirements
 * - Manages data storage with intelligent ID generation
 * - Handles schema validation and transformation
 * - Provides unified access across different formats (JSON, CSV, PDF)
 * - Ensures data consistency and integrity
 */

class IntelligentDataGateway {
  constructor() {
    // In-memory data store with auto-generated schemas
    this.dataStore = new Map()
    this.schemas = new Map()
    this.metadata = new Map()
  }

  /**
   * Generate intelligent ID based on content type and structure
   */
  generateIntelligentId(content, docId) {
    const contentType = this.detectContentType(content)
    const timestamp = Date.now()
    const hash = this.hashContent(JSON.stringify(content)).substring(0, 8)
    
    return {
      id: `doc_${docId}_${timestamp}_${hash}`,
      contentType,
      docId,
      timestamp,
      hash
    }
  }

  /**
   * Detect content type intelligently
   */
  detectContentType(content) {
    if (!content) return 'empty'
    
    const hasPatient = content.patient || content.patientInfo
    const hasMeds = (content.medications && content.medications.length > 0)
    const hasDiagnoses = (content.diagnoses && content.diagnoses.length > 0)
    const hasLabs = (content.labTests && content.labTests.length > 0)
    const hasVitals = content.vitals
    
    if (hasMeds && !hasDiagnoses && !hasLabs) return 'prescription'
    if (hasLabs && !hasMeds && !hasDiagnoses) return 'lab_report'
    if (hasDiagnoses && hasPatient) return 'medical_report'
    if (hasVitals) return 'vital_signs'
    if (hasPatient) return 'patient_record'
    
    return 'general_medical_document'
  }

  /**
   * Auto-generate schema from content structure
   */
  generateSchema(content) {
    const schema = {
      version: '1.0',
      contentType: this.detectContentType(content),
      fields: {},
      nested: {},
      arrays: {},
      timestamps: {
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    }

    // Introspect content and generate schema
    this.introspectObject(content, schema.fields, schema.nested, schema.arrays)

    return schema
  }

  /**
   * Introspect object structure
   */
  introspectObject(obj, fieldsMap, nestedMap, arraysMap, prefix = '') {
    if (!obj || typeof obj !== 'object') return

    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (Array.isArray(value)) {
        arraysMap[fullKey] = {
          type: 'array',
          itemCount: value.length,
          itemType: value.length > 0 ? typeof value[0] : 'unknown',
          sample: value.length > 0 ? value[0] : null
        }
      } else if (value && typeof value === 'object') {
        nestedMap[fullKey] = {
          type: 'object',
          keys: Object.keys(value)
        }
        this.introspectObject(value, fieldsMap, nestedMap, arraysMap, fullKey)
      } else {
        fieldsMap[fullKey] = {
          type: typeof value,
          value: value,
          nullable: value === null || value === undefined
        }
      }
    })
  }

  /**
   * Store data with automatic schema and metadata
   */
  storeData(documentId, content, options = {}) {
    try {
      // Generate intelligent ID
      const idInfo = this.generateIntelligentId(content, documentId)
      
      // Generate schema
      const schema = this.generateSchema(content)
      
      // Validate content
      const validation = this.validateContent(content, schema)
      
      // Normalize content
      const normalized = this.normalizeContent(content, schema)
      
      // Store all components
      this.dataStore.set(idInfo.id, {
        documentId,
        content: normalized,
        contentType: idInfo.contentType,
        originalContent: content,
        metadata: {
          ...idInfo,
          ...options,
          validation,
          schema
        },
        stored: new Date().toISOString()
      })

      // Store schema reference
      this.schemas.set(idInfo.id, schema)
      
      // Store metadata
      this.metadata.set(documentId, {
        storageId: idInfo.id,
        contentType: idInfo.contentType,
        timestamp: idInfo.timestamp,
        hash: idInfo.hash
      })

      console.log(`✅ Data stored with intelligent ID: ${idInfo.id}`)
      console.log(`   Content Type: ${idInfo.contentType}`)
      console.log(`   Document ID: ${documentId}`)

      return {
        success: true,
        storageId: idInfo.id,
        documentId,
        contentType: idInfo.contentType,
        schema,
        validation
      }
    } catch (error) {
      console.error('❌ Data storage error:', error)
      return {
        success: false,
        error: error.message,
        documentId
      }
    }
  }

  /**
   * Retrieve data with format conversion
   */
  retrieveData(documentId, format = 'json') {
    try {
      const metadata = this.metadata.get(documentId)
      
      if (!metadata) {
        return {
          success: false,
          error: 'Document not found',
          documentId
        }
      }

      const storageId = metadata.storageId
      const stored = this.dataStore.get(storageId)

      if (!stored) {
        return {
          success: false,
          error: 'Storage data not found',
          documentId,
          storageId
        }
      }

      // Convert to requested format
      const formattedData = this.convertFormat(stored.content, format, stored.metadata.schema)

      return {
        success: true,
        documentId,
        storageId,
        contentType: stored.contentType,
        format,
        data: formattedData,
        metadata: stored.metadata,
        retrieved: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ Data retrieval error:', error)
      return {
        success: false,
        error: error.message,
        documentId
      }
    }
  }

  /**
   * Convert data to different formats
   */
  convertFormat(data, format, schema) {
    switch (format.toLowerCase()) {
      case 'json':
        return this.toJSON(data)
      case 'csv':
        return this.toCSV(data)
      case 'xml':
        return this.toXML(data)
      case 'html':
        return this.toHTML(data, schema)
      case 'table':
        return this.toTable(data, schema)
      case 'flat':
        return this.toFlat(data)
      default:
        return data
    }
  }

  /**
   * Convert to JSON format
   */
  toJSON(data) {
    return JSON.stringify(data, null, 2)
  }

  /**
   * Convert to CSV format
   */
  toCSV(data) {
    const flatData = this.toFlat(data)
    const headers = Object.keys(flatData)
    const csvHeaders = headers.join(',')
    const csvValues = headers.map(h => {
      const val = flatData[h]
      const str = String(val).replace(/"/g, '""')
      return `"${str}"`
    }).join(',')
    
    return `${csvHeaders}\n${csvValues}`
  }

  /**
   * Convert to XML format
   */
  toXML(data, nodeName = 'root') {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${nodeName}>\n`
    
    const addNode = (obj, indent = '  ') => {
      Object.entries(obj).forEach(([key, value]) => {
        const safeName = key.replace(/[^a-zA-Z0-9_]/g, '_')
        
        if (Array.isArray(value)) {
          xml += `${indent}<${safeName}>\n`
          value.forEach((item, idx) => {
            if (typeof item === 'object') {
              xml += `${indent}  <item index="${idx}">\n`
              addNode(item, indent + '    ')
              xml += `${indent}  </item>\n`
            } else {
              xml += `${indent}  <item>${this.escapeXML(String(item))}</item>\n`
            }
          })
          xml += `${indent}</${safeName}>\n`
        } else if (typeof value === 'object' && value !== null) {
          xml += `${indent}<${safeName}>\n`
          addNode(value, indent + '  ')
          xml += `${indent}</${safeName}>\n`
        } else {
          xml += `${indent}<${safeName}>${this.escapeXML(String(value))}</${safeName}>\n`
        }
      })
    }

    addNode(data)
    xml += `</${nodeName}>`
    
    return xml
  }

  /**
   * Convert to HTML format
   */
  toHTML(data, schema) {
    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Medical Document Extraction</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .section { margin: 20px 0; border-bottom: 2px solid #ddd; padding-bottom: 15px; }
        .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .field { display: grid; grid-template-columns: 200px 1fr; margin: 8px 0; }
        .field-label { font-weight: bold; color: #555; }
        .field-value { color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
        th { background: #f0f0f0; font-weight: bold; }
        .badge { display: inline-block; padding: 4px 8px; background: #007bff; color: white; border-radius: 4px; font-size: 12px; }
        .high-confidence { background: #28a745; }
        .medium-confidence { background: #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Medical Document Extraction Report</h1>`

    // Patient Info Section
    if (data.patient) {
      html += `<div class="section">
          <div class="section-title">👤 Patient Information</div>`
      
      const patient = data.patient.patientInfo || data.patient
      Object.entries(patient).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          html += `<div class="field">
              <div class="field-label">${this.humanize(key)}:</div>
              <div class="field-value">${value}</div>
          </div>`
        }
      })
      html += `</div>`
    }

    // Medications Section
    if (data.medications && data.medications.length > 0) {
      html += `<div class="section">
          <div class="section-title">💊 Medications (${data.medications.length})</div>
          <table>
              <thead>
                  <tr>
                      <th>Medication</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Route</th>
                      <th>Confidence</th>
                  </tr>
              </thead>
              <tbody>`
      
      data.medications.forEach(med => {
        const confBadge = this.getConfidenceBadge(med.confidence)
        html += `<tr>
                  <td>${med.name || 'N/A'}</td>
                  <td>${med.dosage} ${med.unit || ''}</td>
                  <td>${med.frequency || 'N/A'}</td>
                  <td>${med.route || 'N/A'}</td>
                  <td><span class="badge ${confBadge}">${Math.round((med.confidence || 0) * 100)}%</span></td>
              </tr>`
      })
      html += `</tbody></table></div>`
    }

    // Diagnoses Section
    if (data.diagnoses && data.diagnoses.length > 0) {
      html += `<div class="section">
          <div class="section-title">🔍 Diagnoses (${data.diagnoses.length})</div>
          <table>
              <thead>
                  <tr>
                      <th>Diagnosis</th>
                      <th>Severity</th>
                      <th>ICD-10</th>
                      <th>Confidence</th>
                  </tr>
              </thead>
              <tbody>`
      
      data.diagnoses.forEach(diag => {
        const confBadge = this.getConfidenceBadge(diag.confidence)
        html += `<tr>
                  <td>${diag.name || 'N/A'}</td>
                  <td>${diag.severity || 'N/A'}</td>
                  <td>${diag.icd10 || 'N/A'}</td>
                  <td><span class="badge ${confBadge}">${Math.round((diag.confidence || 0) * 100)}%</span></td>
              </tr>`
      })
      html += `</tbody></table></div>`
    }

    // Lab Results Section
    if (data.labTests && data.labTests.length > 0) {
      html += `<div class="section">
          <div class="section-title">🧪 Lab Results (${data.labTests.length})</div>
          <table>
              <thead>
                  <tr>
                      <th>Test Name</th>
                      <th>Value</th>
                      <th>Reference Range</th>
                      <th>Status</th>
                      <th>Confidence</th>
                  </tr>
              </thead>
              <tbody>`
      
      data.labTests.forEach(test => {
        const confBadge = this.getConfidenceBadge(test.confidence)
        html += `<tr>
                  <td>${test.name || 'N/A'}</td>
                  <td>${test.value} ${test.unit || ''}</td>
                  <td>${test.referenceRange || 'N/A'}</td>
                  <td>${test.status || 'N/A'}</td>
                  <td><span class="badge ${confBadge}">${Math.round((test.confidence || 0) * 100)}%</span></td>
              </tr>`
      })
      html += `</tbody></table></div>`
    }

    // Vitals Section
    if (data.vitals) {
      html += `<div class="section">
          <div class="section-title">❤️ Vital Signs</div>`
      
      Object.entries(data.vitals).forEach(([key, value]) => {
        if (value && key !== 'confidence') {
          html += `<div class="field">
              <div class="field-label">${this.humanize(key)}:</div>
              <div class="field-value">${value}</div>
          </div>`
        }
      })
      html += `</div>`
    }

    html += `
    </div>
</body>
</html>`
    
    return html
  }

  /**
   * Convert to table format for frontend display
   */
  toTable(data, schema) {
    return {
      sections: [
        {
          title: 'Patient Information',
          data: data.patient ? [data.patient.patientInfo || data.patient] : [],
          type: 'patient'
        },
        {
          title: 'Medications',
          data: data.medications || [],
          type: 'medications',
          columns: ['name', 'dosage', 'unit', 'frequency', 'route', 'confidence']
        },
        {
          title: 'Diagnoses',
          data: data.diagnoses || [],
          type: 'diagnoses',
          columns: ['name', 'severity', 'icd10', 'confidence']
        },
        {
          title: 'Lab Results',
          data: data.labTests || [],
          type: 'labTests',
          columns: ['name', 'value', 'unit', 'referenceRange', 'status', 'confidence']
        },
        {
          title: 'Vital Signs',
          data: data.vitals ? [data.vitals] : [],
          type: 'vitals'
        }
      ],
      metadata: {
        contentType: data.documentType,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Flatten nested object for CSV/simple formats
   */
  toFlat(obj, prefix = '') {
    const flat = {}

    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key

      if (Array.isArray(value)) {
        flat[newKey] = value.length > 0 ? JSON.stringify(value[0]) : ''
      } else if (value && typeof value === 'object') {
        Object.assign(flat, this.toFlat(value, newKey))
      } else {
        flat[newKey] = value || ''
      }
    })

    return flat
  }

  /**
   * Validate content against schema
   */
  validateContent(content, schema) {
    const issues = []
    const warnings = []

    // Check required fields
    const requiredFields = ['patient', 'medications', 'diagnoses']
    requiredFields.forEach(field => {
      if (!content[field]) {
        warnings.push(`Missing field: ${field}`)
      }
    })

    // Check data quality
    if (content.medications) {
      content.medications.forEach((med, idx) => {
        if (!med.name) issues.push(`Medication ${idx}: missing name`)
        if (!med.confidence || med.confidence < 0.5) {
          warnings.push(`Medication ${idx}: low confidence`)
        }
      })
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Normalize content structure
   */
  normalizeContent(content, schema) {
    const normalized = { ...content }

    // Ensure consistent structure
    if (normalized.patient && !normalized.patient.patientInfo) {
      normalized.patient = { patientInfo: normalized.patient }
    }

    // Ensure arrays
    normalized.medications = normalized.medications || []
    normalized.diagnoses = normalized.diagnoses || []
    normalized.labTests = normalized.labTests || []

    return normalized
  }

  /**
   * Helper to escape XML
   */
  escapeXML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  /**
   * Helper to humanize field names
   */
  humanize(str) {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, c => c.toUpperCase())
      .trim()
  }

  /**
   * Helper to get confidence badge class
   */
  getConfidenceBadge(confidence) {
    if (confidence >= 0.8) return 'high-confidence'
    if (confidence >= 0.6) return 'medium-confidence'
    return ''
  }

  /**
   * Hash content for integrity checking
   */
  hashContent(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * Get all stored documents
   */
  getAllDocuments() {
    return Array.from(this.metadata.entries()).map(([docId, meta]) => ({
      documentId: docId,
      ...meta
    }))
  }

  /**
   * Delete stored data
   */
  deleteData(documentId) {
    const metadata = this.metadata.get(documentId)
    if (metadata) {
      this.dataStore.delete(metadata.storageId)
      this.schemas.delete(metadata.storageId)
      this.metadata.delete(documentId)
      return true
    }
    return false
  }

  /**
   * Get gateway statistics
   */
  getStats() {
    return {
      totalDocuments: this.metadata.size,
      totalStorage: this.dataStore.size,
      contentTypes: Array.from(this.metadata.values()).reduce((acc, m) => {
        acc[m.contentType] = (acc[m.contentType] || 0) + 1
        return acc
      }, {})
    }
  }
}

// Export singleton instance
export default new IntelligentDataGateway()
