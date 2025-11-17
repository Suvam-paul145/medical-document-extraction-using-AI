/**
 * Data Normalizer - Converts extracted data to frontend-compatible format
 * Handles mapping from different extraction methods to unified schema
 * Ensures all important medical information is preserved and accessible
 */

export class DataNormalizer {
  /**
   * Normalize extraction result from agent to frontend schema
   * Maps field names and structures to match ExtractionResult interface
   */
  static normalizeExtractionResult(agentResult) {
    if (!agentResult) return this.getEmptyResult()

    return {
      documentId: agentResult.documentId || `doc_${Date.now()}`,
      
      // Patient information
      patientInfo: this.normalizePatientInfo(
        agentResult.patient || agentResult.patientInfo || {}
      ),

      // Medications (handle both labTests and medications)
      medications: this.normalizeMedications(
        agentResult.medications || agentResult.medicationsList || []
      ),

      // Diagnoses
      diagnoses: this.normalizeDiagnoses(
        agentResult.diagnoses || agentResult.diagnosisList || []
      ),

      // Lab Results (labTests -> labResults)
      labResults: this.normalizeLabs(
        agentResult.labTests || agentResult.labResults || []
      ),

      // Vital Signs
      vitalSigns: this.normalizeVitals(
        agentResult.vitals || agentResult.vitalSigns || []
      ),

      // Physician Information
      physicianInfo: this.normalizePhysician(
        agentResult.physician || agentResult.physicianInfo || {}
      ),

      extractedAt: agentResult.extractedAt || new Date().toISOString(),
      processingTime: agentResult.processingTime || 0
    }
  }

  /**
   * Normalize patient information with proper field mapping
   */
  static normalizePatientInfo(patientData) {
    if (!patientData || Object.keys(patientData).length === 0) {
      return {
        name: 'Not extracted',
        dateOfBirth: '',
        patientId: '',
        age: 0,
        gender: '',
        contactNumber: '',
        address: '',
        confidence: 0
      }
    }

    // Handle different field name variations
    const firstName = patientData.firstName || patientData.first_name || ''
    const lastName = patientData.lastName || patientData.last_name || ''
    const name = patientData.name || `${firstName} ${lastName}`.trim()

    return {
      name,
      dateOfBirth: patientData.dateOfBirth || patientData.date_of_birth || patientData.dob || '',
      patientId: patientData.patientId || patientData.patient_id || patientData.mrn || patientData.MRN || '',
      age: patientData.age || 0,
      gender: patientData.gender || patientData.sex || '',
      contactNumber: patientData.contactNumber || patientData.contact_number || patientData.phone || '',
      address: patientData.address || patientData.location || '',
      confidence: patientData.confidence || (name ? 0.8 : 0)
    }
  }

  /**
   * Normalize medications with super accuracy
   * Ensures all medication details are properly mapped and accessible
   */
  static normalizeMedications(medicationsData) {
    if (!Array.isArray(medicationsData)) {
      return []
    }

    return medicationsData
      .filter(med => med && (med.name || med.drugName || med.medication))
      .map(med => ({
        drugName: med.name || med.drugName || med.medication || 'Unknown',
        dosage: (med.dosage || med.dose || '') + (med.unit || med.dosageUnit ? ` ${med.unit || med.dosageUnit}` : ''),
        frequency: med.frequency || med.frequencyPerDay || 'As prescribed',
        duration: med.duration || med.durationMonths || 'Ongoing',
        route: med.route || med.administration_route || 'Oral',
        prescribedDate: med.prescribedDate || med.prescribed_date || med.dateStarted || '',
        indication: med.indication || med.reason || med.reason_for_medication || 'Not specified',
        sideEffects: med.sideEffects || med.side_effects || [],
        contraindications: med.contraindications || med.interactions || [],
        confidence: med.confidence || 0.85,
        status: med.status || 'active',
        prescriber: med.prescriber || 'Not specified'
      }))
  }

  /**
   * Normalize diagnoses with ICD codes and severity
   * Ensures proper classification and clinical context
   */
  static normalizeDiagnoses(diagnosesData) {
    if (!Array.isArray(diagnosesData)) {
      return []
    }

    return diagnosesData
      .filter(diag => diag && (diag.condition || diag.name || diag.diagnosis))
      .map(diag => ({
        condition: diag.condition || diag.name || diag.diagnosis || 'Unknown',
        icdCode: diag.icdCode || diag.icd_code || diag.ICD10 || diag.icd10 || '',
        diagnosedDate: diag.diagnosedDate || diag.diagnosed_date || diag.date_of_diagnosis || '',
        severity: diag.severity || diag.severity_level || 'Unknown',
        notes: diag.notes || diag.clinical_notes || diag.description || '',
        status: diag.status || diag.diagnosis_status || 'Active',
        primaryCondition: diag.isPrimary || diag.is_primary || false,
        confidence: diag.confidence || 0.82
      }))
  }

  /**
   * Normalize lab results with reference ranges and status
   * Ensures proper value interpretation and clinical context
   */
  static normalizeLabs(labsData) {
    if (!Array.isArray(labsData)) {
      return []
    }

    return labsData
      .filter(lab => lab && (lab.testName || lab.name || lab.test))
      .map(lab => ({
        testName: lab.testName || lab.name || lab.test || 'Unknown Test',
        value: (lab.value || lab.result || '').toString(),
        unit: lab.unit || lab.units || lab.measurement_unit || '',
        referenceRange: lab.referenceRange || lab.reference_range || lab.normal_range || '',
        testDate: lab.testDate || lab.test_date || lab.date || '',
        status: this.interpretLabStatus(
          lab.status || lab.result_status || lab.resultStatus,
          lab.value,
          lab.referenceRange
        ),
        normalRange: lab.normalRange || lab.normal_range || lab.referenceRange || '',
        highValue: lab.highValue || lab.high_value,
        lowValue: lab.lowValue || lab.low_value,
        method: lab.method || lab.test_method || '',
        notes: lab.notes || lab.clinical_notes || '',
        confidence: lab.confidence || 0.85
      }))
  }

  /**
   * Normalize vital signs
   */
  static normalizeVitals(vitalsData) {
    if (!vitalsData || Object.keys(vitalsData).length === 0) {
      return []
    }

    const vitalsList = []
    const vitalTypes = {
      temperature: ['Temperature', '°C', 'temp'],
      bloodPressure: ['Blood Pressure', 'mmHg', 'BP'],
      heartRate: ['Heart Rate', 'bpm', 'pulse'],
      respiratoryRate: ['Respiratory Rate', '/min', 'RR'],
      oxygenSaturation: ['Oxygen Saturation', '%', 'SpO2'],
      weight: ['Weight', 'kg', 'wt'],
      height: ['Height', 'cm', 'ht']
    }

    for (const [key, [name, unit]] of Object.entries(vitalTypes)) {
      if (vitalsData[key]) {
        vitalsList.push({
          type: name,
          value: vitalsData[key].toString(),
          unit,
          measuredDate: vitalsData.timestamp || vitalsData.measuredDate || '',
          confidence: vitalsData.confidence || 0.9
        })
      }
    }

    return vitalsList
  }

  /**
   * Normalize physician information
   */
  static normalizePhysician(physicianData) {
    if (!physicianData || Object.keys(physicianData).length === 0) {
      return {
        name: '',
        specialty: '',
        licenseNumber: '',
        contactInfo: '',
        confidence: 0
      }
    }

    return {
      name: physicianData.name || physicianData.doctorName || '',
      specialty: physicianData.specialty || physicianData.department || '',
      licenseNumber: physicianData.licenseNumber || physicianData.license || '',
      contactInfo: physicianData.contactInfo || physicianData.contact || '',
      confidence: physicianData.confidence || 0.7
    }
  }

  /**
   * Interpret lab result status from value and reference range
   */
  static interpretLabStatus(providedStatus, value, referenceRange) {
    if (providedStatus) return providedStatus

    // If status provided, use it
    if (value && referenceRange) {
      const numValue = parseFloat(value)
      if (isNaN(numValue)) return 'pending'

      // Simple interpretation - can be enhanced with ML
      if (referenceRange.includes('-')) {
        const [low, high] = referenceRange.split('-').map(v => parseFloat(v.trim()))
        if (numValue < low) return 'abnormal_low'
        if (numValue > high) return 'abnormal_high'
        return 'normal'
      }
    }

    return 'unknown'
  }

  /**
   * Get empty result structure for failed extractions
   */
  static getEmptyResult() {
    return {
      documentId: `doc_${Date.now()}`,
      patientInfo: {
        name: '',
        dateOfBirth: '',
        patientId: '',
        age: 0,
        gender: '',
        contactNumber: '',
        address: '',
        confidence: 0
      },
      medications: [],
      diagnoses: [],
      labResults: [],
      vitalSigns: [],
      physicianInfo: {
        name: '',
        specialty: '',
        licenseNumber: '',
        contactInfo: '',
        confidence: 0
      },
      extractedAt: new Date().toISOString(),
      processingTime: 0
    }
  }

  /**
   * Validate extracted data and add confidence metrics
   */
  static validateAndScore(extractionResult) {
    const scores = {
      patientDataCompleteness: this.scorePatientCompleteness(extractionResult.patientInfo),
      medicationCount: extractionResult.medications.length,
      diagnosisCount: extractionResult.diagnoses.length,
      labCount: extractionResult.labResults.length,
      overallConfidence: this.calculateOverallConfidence(extractionResult)
    }

    return {
      ...extractionResult,
      qualityMetrics: scores
    }
  }

  /**
   * Score patient data completeness
   */
  static scorePatientCompleteness(patientInfo) {
    let completeness = 0
    const fields = ['name', 'dateOfBirth', 'patientId', 'age', 'gender']
    
    fields.forEach(field => {
      if (patientInfo[field] && patientInfo[field] !== '') {
        completeness += 20
      }
    })

    return Math.min(100, completeness)
  }

  /**
   * Calculate overall confidence score
   */
  static calculateOverallConfidence(extractionResult) {
    let totalConfidence = 0
    let count = 0

    if (extractionResult.patientInfo?.confidence) {
      totalConfidence += extractionResult.patientInfo.confidence
      count++
    }

    extractionResult.medications.forEach(med => {
      totalConfidence += med.confidence || 0.8
      count++
    })

    extractionResult.diagnoses.forEach(diag => {
      totalConfidence += diag.confidence || 0.8
      count++
    })

    extractionResult.labResults.forEach(lab => {
      totalConfidence += lab.confidence || 0.8
      count++
    })

    return count > 0 ? totalConfidence / count : 0
  }
}

export default DataNormalizer
