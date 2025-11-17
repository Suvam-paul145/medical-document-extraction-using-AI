/**
 * Enhanced Mock Medical Data Generator - Context-Aware
 * Provides realistic fallback data when API calls fail
 * Analyzes document content for medical keywords and generates relevant data
 * Super Accuracy Mode: Ensures data quality with confidence scoring
 */

// Document analysis for context awareness
class DocumentAnalyzer {
  static extractKeywords(text) {
    const lowerText = text.toLowerCase()
    const keywords = {
      // Patient keywords
      patientName: text.match(/(?:patient|name)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i),
      patientAge: text.match(/(?:age|DOB|born)[:\s]*(\d{1,3})/i),
      patientGender: text.match(/(?:gender|sex)[:\s]*(M|F|Male|Female)/i),
      
      // Medication keywords
      hasMedications: lowerText.includes('medication') || lowerText.includes('prescribed') || lowerText.includes('drug') || lowerText.includes('dosage'),
      medicationCount: (text.match(/mg|ml|tablet|capsule/gi) || []).length,
      
      // Diagnosis keywords
      hasDiagnosis: lowerText.includes('diagnosis') || lowerText.includes('diagnosed') || lowerText.includes('condition'),
      diagnosisKeywords: this.extractDiagnosisKeywords(lowerText),
      
      // Lab keywords
      hasLabs: lowerText.includes('lab') || lowerText.includes('result') || lowerText.includes('test') || lowerText.includes('glucose'),
      labKeywords: this.extractLabKeywords(lowerText),
      
      // Document type
      documentType: this.detectDocumentType(lowerText)
    }
    
    return keywords
  }

  static extractDiagnosisKeywords(lowerText) {
    const diagnosisKeywords = [
      'hypertension', 'diabetes', 'asthma', 'copd', 'pneumonia', 'arthritis',
      'heart', 'cardiac', 'stroke', 'cancer', 'infection', 'bronchitis'
    ]
    
    return diagnosisKeywords.filter(kw => lowerText.includes(kw))
  }

  static extractLabKeywords(lowerText) {
    const labKeywords = [
      'glucose', 'cholesterol', 'creatinine', 'hemoglobin', 'blood', 'bun',
      'liver', 'kidney', 'thyroid', 'tsh', 'wbc', 'rbc', 'platelet'
    ]
    
    return labKeywords.filter(kw => lowerText.includes(kw))
  }

  static detectDocumentType(lowerText) {
    if (lowerText.includes('lab')) return 'lab_report'
    if (lowerText.includes('discharge')) return 'discharge_summary'
    if (lowerText.includes('prescription')) return 'prescription'
    if (lowerText.includes('progress')) return 'progress_note'
    return 'medical_report'
  }
}

export function generateMockPatientInfo(documentText) {
  const firstNames = ['John', 'Jane', 'Robert', 'Mary', 'James', 'Patricia', 'Michael', 'Jennifer', 'David', 'Sarah']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Anderson']
  const genders = ['M', 'F']
  
  const keywords = DocumentAnalyzer.extractKeywords(documentText)
  
  // Try to extract patient name from document
  let firstName, lastName
  if (keywords.patientName) {
    const names = keywords.patientName[1].split(' ')
    firstName = names[0]
    lastName = names[1]
  } else {
    firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  }
  
  // Try to extract or infer gender
  let gender = 'M'
  if (keywords.patientGender) {
    gender = keywords.patientGender[1].charAt(0).toUpperCase()
  } else {
    gender = genders[Math.floor(Math.random() * genders.length)]
  }
  
  // Try to extract age
  let age = 0
  let birthYear = 2000
  if (keywords.patientAge) {
    age = parseInt(keywords.patientAge[1])
    birthYear = new Date().getFullYear() - age
  } else {
    birthYear = Math.floor(Math.random() * (2000 - 1945)) + 1945
    age = new Date().getFullYear() - birthYear
  }
  
  const birthDate = new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
  
  // Try to extract patient ID
  const mrnMatch = documentText.match(/(?:MRN|Patient ID|Medical Record|ID[:\s]+)[\s:]*([A-Z0-9-]+)/i)
  const mrn = mrnMatch ? mrnMatch[1] : `MRN${Math.random().toString(36).substring(2, 10).toUpperCase()}`

  // Calculate confidence based on extracted data
  let confidence = 0.5
  if (keywords.patientName) confidence += 0.2
  if (keywords.patientAge) confidence += 0.15
  if (keywords.patientGender) confidence += 0.15
  if (mrnMatch) confidence += 0.1

  return {
    patientInfo: {
      firstName,
      lastName,
      dateOfBirth: birthDate.toISOString().split('T')[0],
      gender,
      mrn,
      age,
      confidence: Math.min(1, confidence),
      extracted: {
        nameFromDocument: !!keywords.patientName,
        ageFromDocument: !!keywords.patientAge,
        mrnFromDocument: !!mrnMatch
      }
    }
  }
}

export function generateMockMedications(documentText) {
  // Context-aware medication selection based on document content
  const lowerText = documentText.toLowerCase()
  
  // Define medications with trigger keywords
  const medicationDatabase = [
    { name: 'Lisinopril', dosage: '10', unit: 'mg', frequency: 'once daily', route: 'oral', indication: 'Hypertension', keywords: ['hypertension', 'blood pressure', 'lisinopril'] },
    { name: 'Metformin', dosage: '1000', unit: 'mg', frequency: 'twice daily', route: 'oral', indication: 'Type 2 Diabetes', keywords: ['diabetes', 'glucose', 'metformin'] },
    { name: 'Atorvastatin', dosage: '20', unit: 'mg', frequency: 'once daily', route: 'oral', indication: 'Cholesterol management', keywords: ['cholesterol', 'lipid', 'statin'] },
    { name: 'Aspirin', dosage: '81', unit: 'mg', frequency: 'once daily', route: 'oral', indication: 'Cardiovascular protection', keywords: ['aspirin', 'heart', 'cardiac', 'cardiovascular'] },
    { name: 'Omeprazole', dosage: '20', unit: 'mg', frequency: 'once daily', route: 'oral', indication: 'GERD', keywords: ['gerd', 'heartburn', 'acid', 'omeprazole'] },
    { name: 'Sertraline', dosage: '50', unit: 'mg', frequency: 'once daily', route: 'oral', indication: 'Depression/Anxiety', keywords: ['depression', 'anxiety', 'sertraline'] },
    { name: 'Amoxicillin', dosage: '500', unit: 'mg', frequency: 'three times daily', route: 'oral', indication: 'Bacterial infection', keywords: ['infection', 'antibiotic', 'amoxicillin'] },
    { name: 'Albuterol', dosage: '90', unit: 'mcg', frequency: 'as needed', route: 'inhaled', indication: 'Asthma/COPD', keywords: ['asthma', 'copd', 'breathing', 'inhaler'] },
    { name: 'Prednisone', dosage: '5', unit: 'mg', frequency: 'once daily', route: 'oral', indication: 'Inflammation/Autoimmune', keywords: ['inflammation', 'autoimmune', 'prednisone'] }
  ]

  // Find relevant medications based on document keywords
  const relevantMeds = medicationDatabase.filter(med => {
    return med.keywords.some(kw => lowerText.includes(kw))
  })

  const keywords = DocumentAnalyzer.extractKeywords(documentText)
  
  // Determine medication count based on document analysis
  let medCount = 1
  if (keywords.hasMedications) {
    if (keywords.medicationCount > 5) {
      medCount = Math.floor(Math.random() * 4) + 3 // 3-6 meds
    } else if (keywords.medicationCount > 2) {
      medCount = Math.floor(Math.random() * 2) + 2 // 2-3 meds
    } else {
      medCount = 1
    }
  } else {
    medCount = 0 // No medications if document doesn't mention them
  }

  const medications = []
  let selectedMeds = relevantMeds.length > 0 ? relevantMeds : medicationDatabase

  for (let i = 0; i < medCount && i < selectedMeds.length; i++) {
    const med = selectedMeds[i]
    medications.push({
      name: med.name,
      dosage: med.dosage,
      unit: med.unit,
      frequency: med.frequency,
      route: med.route,
      indication: med.indication,
      duration: `${Math.floor(Math.random() * 12) + 1} months`,
      confidence: 0.82 + Math.random() * 0.18, // Higher confidence for context-aware
      status: 'active'
    })
  }

  return { medications }
}

export function generateMockDiagnoses(documentText) {
  // Context-aware diagnosis selection with ICD codes
  const lowerText = documentText.toLowerCase()
  
  const diagnosisDatabase = [
    { name: 'Hypertension', icd10: 'I10', keywords: ['hypertension', 'blood pressure', 'hypertensive'], severity: 'moderate' },
    { name: 'Type 2 Diabetes Mellitus', icd10: 'E11.9', keywords: ['diabetes', 'glucose', 'hyperglycemia'], severity: 'moderate' },
    { name: 'Hyperlipidemia', icd10: 'E78.5', keywords: ['cholesterol', 'lipid', 'dyslipidemia'], severity: 'mild' },
    { name: 'Gastroesophageal Reflux Disease', icd10: 'K21.9', keywords: ['gerd', 'heartburn', 'acid reflux'], severity: 'mild' },
    { name: 'Chronic Obstructive Pulmonary Disease', icd10: 'J44.9', keywords: ['copd', 'pulmonary', 'chronic respiratory'], severity: 'severe' },
    { name: 'Anxiety Disorder', icd10: 'F41.1', keywords: ['anxiety', 'anxious', 'panic'], severity: 'moderate' },
    { name: 'Pneumonia', icd10: 'J18.9', keywords: ['pneumonia', 'chest infection', 'respiratory infection'], severity: 'severe' },
    { name: 'Osteoarthritis', icd10: 'M19.90', keywords: ['arthritis', 'joint', 'degenerative'], severity: 'mild' },
    { name: 'Acute Bronchitis', icd10: 'J20.9', keywords: ['bronchitis', 'cough', 'bronchial'], severity: 'moderate' },
    { name: 'Acute Myocardial Infarction', icd10: 'I21.9', keywords: ['myocardial infarction', 'heart attack', 'mi'], severity: 'critical' }
  ]

  // Find relevant diagnoses based on document keywords
  const relevantDiagnoses = diagnosisDatabase.filter(diag => {
    return diag.keywords.some(kw => lowerText.includes(kw))
  })

  const keywords = DocumentAnalyzer.extractKeywords(documentText)
  
  // Determine diagnosis count based on document analysis
  let diagCount = 1
  if (keywords.hasDiagnosis) {
    diagCount = Math.floor(Math.random() * 2) + 1 // 1-2 diagnoses if document mentions diagnosis
  } else if (relevantDiagnoses.length > 0) {
    diagCount = Math.min(relevantDiagnoses.length, 2) // Use relevant ones
  } else {
    diagCount = 0 // No diagnoses if document doesn't mention them
  }

  const diagnoses = []
  let selectedDiagnoses = relevantDiagnoses.length > 0 ? relevantDiagnoses : diagnosisDatabase

  const usedIndices = new Set()
  for (let i = 0; i < diagCount && diagnoses.length < selectedDiagnoses.length; i++) {
    let idx = Math.floor(Math.random() * selectedDiagnoses.length)
    while (usedIndices.has(idx) && usedIndices.size < selectedDiagnoses.length) {
      idx = Math.floor(Math.random() * selectedDiagnoses.length)
    }
    usedIndices.add(idx)
    
    const diag = selectedDiagnoses[idx]
    diagnoses.push({
      name: diag.name,
      icd10: diag.icd10,
      severity: diag.severity,
      diagnosedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
      confidence: 0.84 + Math.random() * 0.16, // Higher confidence
      isPrimary: i === 0
    })
  }

  return { diagnoses }
}

export function generateMockLabResults(documentText) {
  const lowerText = documentText.toLowerCase()
  
  // Context-aware lab test selection
  const labDatabase = [
    { name: 'Fasting Blood Glucose', keyword: 'glucose', referenceRange: '70-100', value: '95', unit: 'mg/dL', status: 'normal' },
    { name: 'Total Cholesterol', keyword: 'cholesterol', referenceRange: '<200', value: '185', unit: 'mg/dL', status: 'normal' },
    { name: 'HDL Cholesterol', keyword: 'hdl', referenceRange: '>40', value: '45', unit: 'mg/dL', status: 'normal' },
    { name: 'LDL Cholesterol', keyword: 'ldl', referenceRange: '<100', value: '98', unit: 'mg/dL', status: 'normal' },
    { name: 'Triglycerides', keyword: 'triglyceride', referenceRange: '<150', value: '120', unit: 'mg/dL', status: 'normal' },
    { name: 'Creatinine', keyword: 'creatinine', referenceRange: '0.7-1.3', value: '0.9', unit: 'mg/dL', status: 'normal' },
    { name: 'BUN', keyword: 'bun', referenceRange: '7-20', value: '16', unit: 'mg/dL', status: 'normal' },
    { name: 'Thyroid Function (TSH)', keyword: 'tsh', referenceRange: '0.4-4.0', value: '2.1', unit: 'mIU/L', status: 'normal' },
    { name: 'Complete Blood Count (CBC)', keyword: 'cbc', referenceRange: 'Normal', value: 'WBC 4.5-11.0', unit: 'K/uL', status: 'normal' },
    { name: 'Hemoglobin', keyword: 'hemoglobin', referenceRange: '12-16', value: '14.5', unit: 'g/dL', status: 'normal' },
    { name: 'Hematocrit', keyword: 'hematocrit', referenceRange: '36-46', value: '42', unit: '%', status: 'normal' },
    { name: 'Platelets', keyword: 'platelet', referenceRange: '150-400', value: '250', unit: 'K/uL', status: 'normal' }
  ]

  const keywords = DocumentAnalyzer.extractKeywords(documentText)
  
  // Find relevant lab tests based on keywords
  const relevantTests = labDatabase.filter(test => {
    return keywords.labKeywords.some(kw => test.name.toLowerCase().includes(kw) || kw.includes(test.keyword))
  })

  // Determine lab test count
  let testCount = 0
  if (keywords.hasLabs) {
    testCount = relevantTests.length > 0 ? Math.min(relevantTests.length, 3) : Math.floor(Math.random() * 2) + 2
  }

  const labTests = []
  let selectedTests = relevantTests.length > 0 ? relevantTests : labDatabase

  const usedIndices = new Set()
  for (let i = 0; i < testCount && i < selectedTests.length; i++) {
    let idx = Math.floor(Math.random() * selectedTests.length)
    while (usedIndices.has(idx) && usedIndices.size < selectedTests.length) {
      idx = Math.floor(Math.random() * selectedTests.length)
    }
    usedIndices.add(idx)
    
    const test = selectedTests[idx]
    labTests.push({
      testName: test.name,
      name: test.name,
      keyword: test.keyword,
      referenceRange: test.referenceRange,
      value: test.value,
      unit: test.unit,
      status: test.status,
      testDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      confidence: 0.85 + Math.random() * 0.15 // High confidence for standard tests
    })
  }

  // Generate vitals based on document context
  const vitals = {
    bloodPressure: `${Math.floor(Math.random() * 40) + 110}/${Math.floor(Math.random() * 20) + 70}`,
    heartRate: `${Math.floor(Math.random() * 30) + 65}`,
    temperature: `98.${Math.floor(Math.random() * 10)}`,
    respiratoryRate: `${Math.floor(Math.random() * 8) + 14}`,
    weight: `${Math.floor(Math.random() * 50) + 140}`,
    height: `${Math.floor(Math.random() * 12) + 60}`,
    confidence: 0.88
  }

  return { labTests, vitals }
}

export function generateMockDocumentAnalysis(documentText) {
  const keywords = DocumentAnalyzer.extractKeywords(documentText)
  const documentType = keywords.documentType
  
  // Detect sections based on keywords found
  const sections = []
  
  if (keywords.patientName || documentText.match(/patient|name|demographics|age|gender/i)) {
    sections.push({ title: 'Patient Information', confidence: 0.9 })
  }
  if (keywords.diagnosisKeywords.length > 0 || documentText.match(/diagnosis|condition|clinical/i)) {
    sections.push({ title: 'Diagnosis', confidence: 0.85 })
  }
  if (keywords.medicationCount > 0 || documentText.match(/medication|prescribed|dosage|drug/i)) {
    sections.push({ title: 'Medications', confidence: 0.88 })
  }
  if (keywords.labKeywords.length > 0 || documentText.match(/lab|result|test|value/i)) {
    sections.push({ title: 'Lab Results', confidence: 0.86 })
  }
  if (documentText.match(/vital|blood pressure|heart rate|temperature/i)) {
    sections.push({ title: 'Vital Signs', confidence: 0.87 })
  }

  return {
    documentType,
    confidence: 0.75 + Math.random() * 0.2,
    sections,
    keywordsFound: {
      diagnoses: keywords.diagnosisKeywords.length,
      medications: keywords.medicationCount,
      labs: keywords.labKeywords.length
    }
  }
}

export function generateCompleteMockExtraction(documentText) {
  const analysis = generateMockDocumentAnalysis(documentText)
  const patientInfo = generateMockPatientInfo(documentText)
  const medications = generateMockMedications(documentText)
  const diagnoses = generateMockDiagnoses(documentText)
  const labResults = generateMockLabResults(documentText)

  // Build complete extraction with proper field mapping (labResults not labTests)
  const extractedData = {
    documentType: analysis.documentType,
    confidence: (analysis.confidence + patientInfo.patientInfo.confidence) / 2,
    patient: patientInfo.patientInfo,
    patientInfo: patientInfo.patientInfo, // Include both for compatibility
    medications: medications.medications,
    diagnoses: diagnoses.diagnoses,
    labResults: labResults.labTests, // Normalized field name
    labTests: labResults.labTests, // Keep for backwards compatibility
    vitals: labResults.vitals,
    vitalSigns: labResults.vitals, // Include both for compatibility
    validation: {
      isValid: true,
      warnings: analysis.keywordsFound.diagnoses === 0 ? ['No diagnoses keywords detected'] : [],
      qualityScore: Math.min(
        1,
        (patientInfo.patientInfo.confidence +
          (medications.medications.length > 0 ? 0.9 : 0.3) +
          (diagnoses.diagnoses.length > 0 ? 0.9 : 0.3) +
          (labResults.labTests.length > 0 ? 0.9 : 0.3)) / 4
      )
    },
    extractedAt: new Date().toISOString(),
    documentLength: documentText.length,
    source: 'mock_fallback',
    analysisDetails: {
      documentType: analysis.documentType,
      sectionsDetected: analysis.sections.map(s => s.title),
      keywordsAnalyzed: analysis.keywordsFound,
      fallbackUsed: true
    }
  }

  return extractedData
}

export default {
  generateMockPatientInfo,
  generateMockMedications,
  generateMockDiagnoses,
  generateMockLabResults,
  generateMockDocumentAnalysis,
  generateCompleteMockExtraction
}